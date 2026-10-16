---
'@xihan-ui/web-components': minor
---

`<xh-table>` 新增只读属性 `visibleRows` 与方法 `rowNumber(rowId)`、`isExpanded(rowId)`，与 Vue / React 插槽载荷里的同名成员同源：树形表与分组报表按 `visibleRows` 铺表体即可折叠，收起的父行底下的子行不在其中，不必再按 `parentId` 与展开集合自己摊平一遍。
