---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增降采样，只作用于绘制，提示框、键盘遍历与数据表始终用原始数据。

- `lttb`：Largest-Triangle-Three-Buckets，保留首尾，结果是原数据的子序列、长度恰为名额，形状最忠实。
- `minMax`：每桶保留首、最小、最大、末四个点，全局的最大值与最小值一定保留，监控类数据的尖峰不会丢。
- `average`：每桶取平均，得到新的点。
- 缺失的点是折线的断点，`lttb` 与 `minMax` 采样后原样保留，两侧各自采样。`needsSampling(count, plotWidth)`：点数超过绘图区宽度两倍时才需要降采样。
