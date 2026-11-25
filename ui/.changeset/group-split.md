---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** ButtonGroup 与 ToggleGroup 自动在相邻项之间画分隔线的开关从 `separators` 改叫 `split`，与 Layout、List、PageHeader、Grid、Table 画分隔线的 `split` 同一个名字。缺省仍是开着。

| 旧名 | 新名 |
| --- | --- |
| `separators`（WC attribute `separators`） | `split`（WC attribute `split`） |
| `api.separators` | `api.split` |
