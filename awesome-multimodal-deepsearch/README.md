# Awesome Multimodal DeepSearch

> A curated map of benchmarks, datasets, agents, and evaluation ideas for multimodal deep search.

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
![Benchmarks](https://img.shields.io/badge/benchmarks-12-167d8d)
![Last update](https://img.shields.io/badge/updated-2026--07--22-5c6ac4)

这是一个面向研究者与工程实践者的多模态 DeepSearch 资源索引。它不只收集论文链接，还对比任务规模、搜索环境、数据构建方式、视觉线索如何参与搜索、是否具有过程评分，以及公开结果中的强模型表现。

本项目目前收录 **12 个 benchmark / agent work**，内容整理自一份横向调研表。数值和接收信息可能随后续版本变化，引用时请回到论文或项目页核对。

**[打开可筛选的离线浏览器](./index.html)** · [贡献指南](./CONTRIBUTING.md) · [结构化数据](./data/benchmarks.js)

## Contents

- [Landscape](#landscape)
- [Benchmarks by capability](#benchmarks-by-capability)
- [How to choose](#how-to-choose)
- [A useful research stack](#a-useful-research-stack)
- [Data fields](#data-fields)
- [Contributing](#contributing)

## Landscape

| Work | Date | Scale / environment | Process evaluation | Primary contribution |
|---|---:|---|---|---|
| [MMSearch](https://arxiv.org/abs/2409.12959) | 2024.09 | 300 queries；14 domains | Partial | 将搜索拆为 requery、rerank、summarization、end-to-end |
| [MMSearch-Plus](https://arxiv.org/abs/2508.21475) | 2025.08 | 311 tasks；open web | Weak analysis | 局部视觉线索、provenance、Set-of-Mark |
| [MM-BrowseComp](https://github.com/MMBrowseComp/MM-BrowseComp) | 2025.08 | 224 paper / 400 repo tasks；open web | **Checklist** | 难搜索、易验证的多模态网页任务 |
| [MC-Search](https://arxiv.org/html/2603.00873) | 2026.03 | 3,333 samples；offline multimodal KB | **Strong** | 结构化 reasoning graph、HAVE、Search-Align |
| [VDR-Bench](https://github.com/Osilly/Vision-DeepResearch) | 2026.02 | 2,000 VQA；web-scale visual search | Entity Recall | cropped-image search、Multi-turn Visual Forcing |
| [BrowseComp-V3](https://arxiv.org/abs/2602.12876) | 2026.02 | 300 questions、383 images；open web | **Sub-goals / Process Score** | Visual、Vertical、Verifiable 与 gold trajectory |
| [InterLV-Search](https://arxiv.org/abs/2605.07510) | 2026.05 | 2,061 samples；open web | Trajectory analysis | 视觉证据作为下一跳搜索的 control pivot |
| [V-QPP-Bench](https://arxiv.org/abs/2602.13179) | 2026.02 | 46,700 imperfect queries；controlled MRAG | **Tool / parameter score** | 搜索前视觉 query 诊断与修复 |
| [VSearcher / MM-SearchExam](https://github.com/Ruiyang-061X/VSearcher) | 2026.03 | 283 generated tasks；real web tools | Training trajectories | 自动任务合成、SFT、真实网页 GRPO |
| [VisBrowse-Bench](https://github.com/ZhengboZhang/VisBrowse-Bench) | 2026.03 | 169 expert VQA；real web tools | No formal score | 网页视觉原生搜索、反向搜图与跨图推理 |
| [AgentVista](https://github.com/hkust-nlp/AgentVista) | 2026.02 | 209 tasks、308 images；hybrid tools | No formal score | 真实视觉场景中的通用多工具长程任务 |
| [MERRIN](https://github.com/HanNight/MERRIN) | 2026.04 | 162 questions；noisy open web | Evidence analysis | 隐式模态选择、冲突来源与多模态证据推理 |

## Benchmarks by capability

### Search pipeline and provenance

- **[MMSearch](https://mmsearch.github.io/)** — 早期系统化诊断多模态搜索流水线，适合分析 query 改写、重排、总结与端到端能力分别在哪里失效。[[Paper](https://arxiv.org/abs/2409.12959)] [[Dataset](https://huggingface.co/datasets/CaraJ/MMSearch)]
- **[MMSearch-Plus](https://mmsearch-plus.github.io/)** — 从图中的微小视觉、空间和时间线索外推到图外事实，强调来源追踪与交叉验证。[[Paper](https://arxiv.org/abs/2508.21475)]

### Verifiable browsing and process supervision

- **[MM-BrowseComp](https://github.com/MMBrowseComp/MM-BrowseComp)** — 每题带 verified checklist，用 Overall Accuracy、Strict Accuracy 与 Average Checklist Score 区分真正完成推理链和偶然命中答案。[[Paper](https://arxiv.org/html/2508.13186v1)]
- **[BrowseComp-V3](https://halcyon-zhang.github.io/BrowseComp-V3/)** — 用专家 sub-goals、gold trajectory 和 Process Score 评估公开网页中的 Visual、Vertical、Verifiable 深搜索。[[Paper](https://arxiv.org/abs/2602.12876)]
- **[MC-Search](https://mc-search-project.github.io/)** — 将轨迹组织为五类 reasoning graph，每个样本包含 sub-question、检索模态、supporting facts 和中间答案。[[Paper](https://arxiv.org/html/2603.00873)]

### Visual-native and interleaved search

- **[VDR-Bench](https://github.com/Osilly/Vision-DeepResearch)** — 针对整图检索 shortcut，强调裁剪局部图和多轮视觉强制，并用 Entity Recall 检查 gold entity sequence。[[Paper](https://arxiv.org/html/2602.02185v1)]
- **[InterLV-Search](https://arxiv.org/abs/2605.07510)** — 视觉证据不只是最终答案的佐证，而是决定下一跳搜索方向的 pivot；包含 single-chain 与 multi-branch。[[HTML](https://arxiv.org/html/2605.07510)]
- **[VisBrowse-Bench](https://github.com/ZhengboZhang/VisBrowse-Bench)** — 强调搜索过程中持续获取网页原生视觉信息，使用搜图、反向搜图、局部裁剪和跨图对齐。[[Paper](https://arxiv.org/abs/2603.16289)]

### Query robustness

- **[V-QPP-Bench](https://github.com/phycholosogy/VQQP_Bench)** — 在搜索前诊断旋转、模糊、遮挡、水印、多目标等视觉 query 缺陷，评分工具选择与参数预测。[[Paper](https://arxiv.org/abs/2602.13179)]

### Agent training and realistic environments

- **[VSearcher / MM-SearchExam](https://github.com/Ruiyang-061X/VSearcher)** — 从稀有 Wikidata / Wikipedia 实体自动合成长问题，生成 ReAct 轨迹，经 SFT 冷启动后在真实网页环境用 GRPO 训练。[[Paper](https://arxiv.org/abs/2603.02795)]
- **[AgentVista](https://agentvista-bench.github.io/)** — 把真实图片、网页检索、图像处理、代码计算和页面访问混合进同一长期任务，突出视觉细节、复杂约束和工具协调。[[Paper](https://arxiv.org/abs/2602.23166)] [[Dataset](https://huggingface.co/datasets/Warrieryes/AgentVista)]
- **[MERRIN](https://merrin-benchmark.github.io/)** — 不显式告诉 Agent 应该查看何种模态，要求它在真实网页的相似、冲突、不完整和二手来源中选择可靠证据。[[Paper](https://arxiv.org/abs/2604.13418)] [[Dataset](https://huggingface.co/datasets/HanNight/MERRIN)]

## How to choose

| If you want to study… | Start with… | Why |
|---|---|---|
| 搜索流水线的基础能力拆解 | MMSearch | 阶段定义清楚，适合定位 requery / rerank / summarize 的瓶颈 |
| 局部视觉检索是否不可替代 | VDR-Bench、MMSearch-Plus | 强调 crop、微小区域和视觉实体验证 |
| 视觉证据如何持续控制搜索 | InterLV-Search、VisBrowse-Bench | 视觉线索反复参与下一跳决策与跨图推理 |
| 中间过程是否真的完成 | BrowseComp-V3、MM-BrowseComp、MC-Search | 分别提供 sub-goals、checklist、结构化 reasoning graph |
| 损坏图像输入的鲁棒性 | V-QPP-Bench | 将搜索前修图建模为可评分的 agentic 工具任务 |
| 长程搜索 Agent 的训练 | VSearcher、MC-Search | 覆盖自动任务合成、轨迹冷启动、SFT / RL 或过程对齐 |
| 真实用户工作流与多工具协调 | AgentVista | 将视觉、搜索、访问、图像处理和代码执行放进同一任务 |
| 噪声网页中的证据可靠性 | MERRIN | 测试隐式模态选择、来源冲突与 gold URL 命中 |

## A useful research stack

如果要设计新的多模态 DeepSearch benchmark，可以组合以下六层：

1. **输入鲁棒性** — 借鉴 V-QPP-Bench，先检查图像 query 是否损坏或需要裁剪。
2. **阶段诊断** — 借鉴 MMSearch，分别评估 query 改写、检索、重排、总结与端到端表现。
3. **视觉原生检索** — 借鉴 VDR-Bench / VisBrowse-Bench，避免整图反搜和文本线索泄漏 shortcut。
4. **交替搜索控制** — 借鉴 InterLV-Search，让视觉证据真实决定后续搜索分支。
5. **过程可验证** — 借鉴 BrowseComp-V3 / MM-BrowseComp / MC-Search，用 sub-goals、checklist 或 reasoning graph 评分。
6. **开放网页鲁棒性** — 借鉴 MERRIN / AgentVista，引入自然噪声、证据冲突和混合工具工作流。

## Data fields

可筛选页面的数据位于 [`data/benchmarks.js`](./data/benchmarks.js)，每条记录包含：

```text
id, name, title, date, venue, positioning,
scale, environment, construction, queryExamples,
innovation, processLevel, processDetail, metrics,
bestResult, note, facets, tags, links
```

页面不依赖构建工具或后端服务，直接打开 [`index.html`](./index.html) 即可使用；也可以运行：

```bash
python -m http.server 8000 --directory awesome-multimodal-deepsearch
```

然后访问 `http://localhost:8000/`。

## Contributing

欢迎补充新的 benchmark、数据集、agent 或复现结果。提交前请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)，并优先提供论文、项目页、代码或数据集等一手来源。

## Acknowledgements

本项目基于截至 **2026-07-22** 的横向调研整理。所有论文、项目和数据集名称归其作者所有。
