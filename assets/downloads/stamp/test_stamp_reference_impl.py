from stamp_reference_impl import (
    ActionStep,
    EvidenceUnit,
    StampConfig,
    canonicalize_url,
    modulate_all_steps,
    sign_preserving_modulation,
    stamp_credit_pipeline,
)


def test_canonicalization():
    assert canonicalize_url(
        "HTTPS://Example.com/a/?utm_source=x#frag"
    ) == "https://example.com/a"


def test_worked_example():
    cfg = StampConfig(delta=0.03, step_credit_cap=0.10)
    a = "https://example.org/a"
    b = "https://example.org/b"

    steps = [
        ActionStep(1, "search", frozenset({a})),
        ActionStep(2, "open", frozenset({a})),
        ActionStep(3, "search", frozenset({b})),
    ]
    entities = [
        EvidenceUnit("E0", "entity", frozenset({a})),
        EvidenceUnit("E1", "entity", frozenset({a, b})),
    ]
    relations = [
        EvidenceUnit("U1", "relation", frozenset({a})),
        EvidenceUnit("U2", "relation", frozenset({a})),
        EvidenceUnit("U3", "relation", frozenset({b})),
    ]

    credit = stamp_credit_pipeline(steps, entities, relations, cfg)
    assert credit[1] == 0.10
    assert abs(credit[3] - 0.045) < 1e-12
    assert 2 not in credit


def test_sign_preservation():
    assert sign_preserving_modulation(1.0, 0.1, 0.1) == 1.1
    assert sign_preserving_modulation(-1.0, 0.1, 0.1) == -0.9
    assert sign_preserving_modulation(0.0, 0.1, 0.1) == 0.0


def test_uncredited_step_unchanged():
    cfg = StampConfig()
    out = modulate_all_steps(0.5, [1, 2], {1: 0.1}, cfg)
    assert out[1] == 0.55
    assert out[2] == 0.5
