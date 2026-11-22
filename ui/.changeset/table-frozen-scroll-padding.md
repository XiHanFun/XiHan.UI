---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

**修复** 表格把一格滚进可视区（`scrollIntoView`、焦点移入、引导的自动滚动）时停在视口边上，一半压在冻结列底下。连接层把两侧冻结列的总宽写到根上（`--xh-_table-frozen-start` / `--xh-_table-frozen-end`），皮肤据此给滚动容器留出滚动内距；放进滚动区的表格改由不冻结的列头与格子带滚动外距。
