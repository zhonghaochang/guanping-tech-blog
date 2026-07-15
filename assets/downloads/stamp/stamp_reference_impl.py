"""A paper-faithful reference implementation of STAMP credit assignment.

This is NOT the official implementation of the paper. It is an educational,
minimal implementation reconstructed from the equations and algorithm in:

  STAMP: Provenance-Guided Credit Assignment for Deep Search Agents
  arXiv:2607.11172v1

The module covers:
1. URL canonicalization and first-exposure attribution.
2. Entity/relation evidence-unit credit allocation.
3. Per-step credit accumulation with a cap.
4. Sign-preserving advantage modulation.
5. Optional PyTorch token-level broadcasting for GRPO/PPO integration.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, FrozenSet, Iterable, List, Literal, Mapping, Sequence
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

EvidenceKind = Literal["entity", "relation"]


@dataclass(frozen=True)
class EvidenceUnit:
    """A verified training-time evidence unit.

    Attributes:
        unit_id: Entity id (e.g. E0) or relation id (e.g. U1).
        kind: "entity" or "relation".
        supporting_urls: URLs judged by the verifier to support this unit.
        verified: Whether the unit is eligible to produce credit.
    """

    unit_id: str
    kind: EvidenceKind
    supporting_urls: FrozenSet[str]
    verified: bool = True


@dataclass(frozen=True)
class ActionStep:
    """One assistant action step and the URLs made available at this step."""

    step_id: int
    action_type: Literal["search", "open", "final"]
    exposed_urls: FrozenSet[str]


@dataclass(frozen=True)
class StampConfig:
    """Hyperparameters used by the paper."""

    delta: float = 0.03
    step_credit_cap: float = 0.10

    def __post_init__(self) -> None:
        if self.delta <= 0:
            raise ValueError("delta must be positive")
        if not 0 <= self.step_credit_cap < 1:
            raise ValueError("step_credit_cap must be in [0, 1)")


def canonicalize_url(url: str) -> str:
    """Canonicalize URLs for deterministic provenance matching.

    The exact canonicalizer used by the paper is not published. This reference
    implementation removes fragments and common tracking parameters, lowercases
    the host, and normalizes trailing slashes.
    """

    url = url.strip()
    if not url:
        raise ValueError("URL cannot be empty")

    parts = urlsplit(url)
    scheme = parts.scheme.lower() or "https"
    netloc = parts.netloc.lower()
    path = parts.path or "/"
    if path != "/":
        path = path.rstrip("/")

    blocked = {
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "gclid",
        "fbclid",
    }
    query_items = [
        (k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True)
        if k.lower() not in blocked
    ]
    query = urlencode(sorted(query_items))
    return urlunsplit((scheme, netloc, path, query, ""))


def first_exposure_map(steps: Sequence[ActionStep]) -> Dict[str, int]:
    """Equation (6): map each URL to the earliest step that exposes it."""

    first_seen: Dict[str, int] = {}
    for step in sorted(steps, key=lambda x: x.step_id):
        for raw_url in step.exposed_urls:
            url = canonicalize_url(raw_url)
            first_seen.setdefault(url, step.step_id)
    return first_seen


def allocate_document_credit(
    units: Iterable[EvidenceUnit],
    config: StampConfig,
) -> Dict[str, float]:
    """Equations (4)-(5): uniformly distribute delta across supporting docs.

    Each verified evidence unit contributes exactly `delta` in total. If a unit
    is supported by K documents, each document receives delta / K.
    """

    document_credit: Dict[str, float] = defaultdict(float)

    for unit in units:
        if not unit.verified or not unit.supporting_urls:
            continue

        canonical_urls = frozenset(
            canonicalize_url(url) for url in unit.supporting_urls
        )
        share = config.delta / len(canonical_urls)
        for url in canonical_urls:
            document_credit[url] += share

    return dict(document_credit)


def attribute_credit_to_steps(
    document_credit: Mapping[str, float],
    exposure_map: Mapping[str, int],
    config: StampConfig,
) -> Dict[int, float]:
    """Equation (7): transfer document credit to first-exposure steps.

    Later encounters of the same URL receive no additional credit. The sum at
    each step is capped by C.
    """

    raw_step_credit: Dict[int, float] = defaultdict(float)
    for raw_url, credit in document_credit.items():
        url = canonicalize_url(raw_url)
        if url not in exposure_map:
            # Equivalent to discarding unresolved citations.
            continue
        raw_step_credit[exposure_map[url]] += float(credit)

    return {
        step_id: min(config.step_credit_cap, credit)
        for step_id, credit in raw_step_credit.items()
    }


def sign_preserving_modulation(
    trajectory_advantage: float,
    step_credit: float,
    cap: float = 0.10,
) -> float:
    """Equation (9): M_c(A) = A * (1 + sign(A) * c)."""

    if not 0 <= step_credit <= cap < 1:
        raise ValueError("Require 0 <= step_credit <= cap < 1")

    if trajectory_advantage > 0:
        sign = 1.0
    elif trajectory_advantage < 0:
        sign = -1.0
    else:
        sign = 0.0

    return trajectory_advantage * (1.0 + sign * step_credit)


def modulate_all_steps(
    trajectory_advantage: float,
    step_ids: Iterable[int],
    step_credit: Mapping[int, float],
    config: StampConfig,
) -> Dict[int, float]:
    """Compute the modulated advantage for every action step."""

    result: Dict[int, float] = {}
    for step_id in step_ids:
        credit = min(config.step_credit_cap, step_credit.get(step_id, 0.0))
        result[step_id] = sign_preserving_modulation(
            trajectory_advantage=trajectory_advantage,
            step_credit=credit,
            cap=config.step_credit_cap,
        )
    return result


def stamp_credit_pipeline(
    steps: Sequence[ActionStep],
    entity_units: Sequence[EvidenceUnit],
    relation_units: Sequence[EvidenceUnit],
    config: StampConfig = StampConfig(),
) -> Dict[int, float]:
    """End-to-end provenance credit computation for one trajectory."""

    for unit in entity_units:
        if unit.kind != "entity":
            raise ValueError(f"Expected entity unit, got {unit.kind}")
    for unit in relation_units:
        if unit.kind != "relation":
            raise ValueError(f"Expected relation unit, got {unit.kind}")

    exposure = first_exposure_map(steps)
    document_credit = allocate_document_credit(
        [*entity_units, *relation_units], config
    )
    return attribute_credit_to_steps(document_credit, exposure, config)


def torch_token_advantages(
    trajectory_advantages,
    token_step_ids,
    step_credit_matrix,
    action_mask,
):
    """Optional PyTorch implementation for GRPO/PPO training.

    Args:
        trajectory_advantages: FloatTensor [B]. One GRPO advantage per rollout.
        token_step_ids: LongTensor [B, L]. Step index for each token. Non-action
            positions may contain 0 because `action_mask` will zero them out.
        step_credit_matrix: FloatTensor [B, S]. Credit c_{i,t} for each step.
        action_mask: Bool/FloatTensor [B, L]. 1 for policy-generated action
            tokens, 0 for user/tool-observation/padding tokens.

    Returns:
        FloatTensor [B, L] containing A*_{i,m}.
    """

    try:
        import torch
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError("PyTorch is required for torch_token_advantages") from exc

    if trajectory_advantages.ndim != 1:
        raise ValueError("trajectory_advantages must have shape [B]")
    if token_step_ids.shape != action_mask.shape:
        raise ValueError("token_step_ids and action_mask must share shape [B, L]")
    if step_credit_matrix.ndim != 2:
        raise ValueError("step_credit_matrix must have shape [B, S]")

    batch_size = trajectory_advantages.shape[0]
    if token_step_ids.shape[0] != batch_size:
        raise ValueError("Batch dimensions do not match")

    max_step = step_credit_matrix.shape[1] - 1
    safe_step_ids = token_step_ids.clamp(min=0, max=max_step)
    token_credit = step_credit_matrix.gather(dim=1, index=safe_step_ids)

    advantage = trajectory_advantages[:, None]
    modulated = advantage * (1.0 + torch.sign(advantage) * token_credit)
    return modulated * action_mask.to(modulated.dtype)


def demo() -> None:
    """Run the worked example used in the accompanying blog."""

    config = StampConfig(delta=0.03, step_credit_cap=0.10)

    url_a = "https://example.org/gig-young?utm_source=search"
    url_b = "https://example.org/elizabeth-montgomery"

    steps = [
        ActionStep(1, "search", frozenset({url_a})),
        ActionStep(2, "open", frozenset({url_a})),
        ActionStep(3, "search", frozenset({url_b})),
        ActionStep(4, "open", frozenset({url_b})),
        ActionStep(5, "final", frozenset()),
    ]

    entity_units = [
        EvidenceUnit("E0", "entity", frozenset({url_a})),
        EvidenceUnit("E1", "entity", frozenset({url_a, url_b})),
    ]
    relation_units = [
        EvidenceUnit("U1", "relation", frozenset({url_a})),
        EvidenceUnit("U2", "relation", frozenset({url_a})),
        EvidenceUnit("U3", "relation", frozenset({url_b})),
    ]

    step_credit = stamp_credit_pipeline(
        steps=steps,
        entity_units=entity_units,
        relation_units=relation_units,
        config=config,
    )

    positive = modulate_all_steps(
        trajectory_advantage=1.0,
        step_ids=[s.step_id for s in steps],
        step_credit=step_credit,
        config=config,
    )
    negative = modulate_all_steps(
        trajectory_advantage=-1.0,
        step_ids=[s.step_id for s in steps],
        step_credit=step_credit,
        config=config,
    )

    print("Step credit:", step_credit)
    print("Positive trajectory:", positive)
    print("Negative trajectory:", negative)


if __name__ == "__main__":
    demo()
