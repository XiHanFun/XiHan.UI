---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** FieldArray 表格排布加 `stickyActions`（Web Components 是 `sticky-actions`），缺省 `true`：行尾把手钉在末端侧，与原先一样。容器很窄时钉住的两侧会占掉滚动区的大半，中间的格子怎么滚都看不全，这时写 `false`：把手随行一起横向滚动，滚到末端或 Tab 到把手时露出来，行号仍钉在起始侧。钉住的把手与表格的冻结列一样带 `data-frozen="end"`，表头带 `data-frozen-actions`，皮肤只把带这两个属性的部件钉住。
