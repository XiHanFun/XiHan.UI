---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

表格（Table）的列定义新增 `rowHeader`：表体与脚注里这一列的格子写 `role="rowheader"`，读屏报某一格时连着念出它所在行的表头。交叉表的行维度列、分组标签与合计行的标题格据此有了正确的表头语义；列头仍是 `columnheader`，外观不变。
