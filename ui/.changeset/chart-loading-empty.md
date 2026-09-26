---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

图表首次取数的空态：`pending` 而手里还没有可画的数据时，空态写 `translations.loadingText`（缺省 Loading…）并在文字前转一个圈，空态部件带 `data-state="loading"`；取完仍没有数据才写 `emptyText`。减弱动效与打印下圈停下换成点线。新增组件槽 `--xh-cartesian-chart-empty-gap`、`--xh-pie-chart-empty-gap`。饼图皮肤因此涨约 13%。
