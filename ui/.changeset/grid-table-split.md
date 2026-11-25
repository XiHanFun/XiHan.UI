---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

**破坏性** Grid 的格线与 Table 的列间竖线从 `ruled` 改叫 `split`：Layout、List、PageHeader 画分隔线都叫 `split`，这两处投影的也早就是 `data-split`，只有 prop 名没跟上。

| 旧名 | 新名 |
| --- | --- |
| Grid、Table 的 `ruled`（WC attribute `ruled`） | `split`（WC attribute `split`） |
| `--xh-grid-ruled-padding` | `--xh-grid-split-padding` |
