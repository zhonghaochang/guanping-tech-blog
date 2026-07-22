# Contributing

感谢你帮助维护 Awesome Multimodal DeepSearch。

## What belongs here

优先收录至少满足一项条件的工作：

- 评测或训练多模态搜索、浏览或证据检索 Agent；
- 图像、视频、音频、图表等非文本证据在搜索链中不可替代；
- 包含多跳检索、网页浏览、图像搜索、局部裁剪、反向搜图或混合工具调用；
- 提供过程评分、轨迹、子目标、checklist、gold evidence 或可复现实验环境。

仅做单步 VQA、普通图文 RAG 或没有搜索 / 浏览环节的工作通常不在当前范围内，除非它解决了 DeepSearch 的关键前置问题。

## Submission checklist

- 使用论文或项目的正式名称，不使用营销化标题。
- 至少提供一个一手来源链接，优先顺序为论文、项目页、代码、数据集。
- 写清数据规模、搜索环境和构建方式。
- 区分最终答案指标与过程 / 轨迹指标。
- 结果数值必须写明模型与评测设置，避免跨设置直接比较。
- 若信息可能随版本变化，在说明中标注论文版、仓库版或数据版本。

## Suggested record

```js
{
  id: "short-id",
  name: "Short Name",
  title: "Full title",
  date: "YYYY-MM",
  venue: "Venue or arXiv",
  positioning: "一句话定位",
  scale: "样本量与领域",
  environment: "搜索 / 浏览环境",
  construction: "数据构建方式",
  queryExamples: ["A public query example"],
  innovation: "相对前序工作的关键新增",
  processLevel: "strong | partial | training | none",
  processLabel: "页面显示标签",
  processDetail: "过程评分如何实现",
  metrics: ["Metric A", "Metric B"],
  bestResult: "模型、设置与结果",
  note: "边界、风险或版本说明",
  facets: ["visual", "process", "open-web"],
  tags: ["Tag A", "Tag B"],
  links: [{ label: "Paper", url: "https://..." }]
}
```

## Review principles

我们更看重准确、可核对和有边界的描述，而不是条目数量。不同 benchmark 的数据、工具权限、judge 和预算差异很大，除非设置严格一致，否则不要把准确率当作统一排行榜。
