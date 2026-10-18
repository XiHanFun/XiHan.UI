---
'@xihan-ui/web-components': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
---

日期、日期范围、时间、时间范围选择器直接放进表单字段时，日历钮（时钟钮）改走组类接线：只拿字段的标题与描述链，不再带 `aria-readonly`、`aria-required`、`aria-invalid`。日历钮是普通按钮，ARIA 不允许它带 `aria-readonly`，此前放进字段的页面会报 axe `aria-allowed-attr`；只读、必填与校验一直由各段（`spinbutton`）报告。
