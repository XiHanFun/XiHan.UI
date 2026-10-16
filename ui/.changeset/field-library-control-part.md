---
'@xihan-ui/web-components': patch
---

库内控件放进 `<xh-field>` 时不必再另写 `control` 部件：字段按发现表给控件接线，此前却仍按缺少必需部件 `control` 报错误诊断（`wc.missing-part`）。现在放进字段的库内控件就算 `control` 在场；既没写 `control`、也没放库内控件时照旧报。示例与文档里给库内控件写的 `data-xh-part="control"` 一并去掉，库内控件不接受 asChild，这个标记本来就不起作用。
