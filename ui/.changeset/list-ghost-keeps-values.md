---
'@xihan-ui/core': minor
'@xihan-ui/web-components': patch
---

列表删掉一行时，原处淡出的替身显示删除前的内容：替身里克隆出来的库内元素不再接线、不再重建标准结构，经属性写入的值（如只写宿主、由元素铺出结构的 `xh-text-field`）不会被新实例写回空。字段数组的列表排布与表格排布、标签输入、标签组等用列表动效放替身的组件一样受益。

- core：新增导出 `GHOST_ATTR`（`data-xh-ghost`），`trackListMotion` 在离场替身插进文档之前写上它。
- web-components：元素在 `GHOST_ATTR` 标记的替身里时不接线。
