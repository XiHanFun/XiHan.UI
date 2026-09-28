---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Table 树形表新增级联勾选，与 Tree 的 `cascade` 同一套算法：

- `cascade`：行声明了 `parentId` 且 `selectionMode` 为 multiple 时生效。勾父行整枝传导，子行全勾上父行跟着勾中，勾了一部分的父行把手投影 `data-indeterminate` 画半选，禁用行的子树整棵冻结；级联下不接 Shift 范围选。
- `checkedStrategy`：对外选中值的收敛策略，缺省 `child` 只收叶行，`parent` 收到最高整枝，`all` 收全部勾中的行。
- 全选在级联下逐棵根整枝传导，基数是够得着的叶行，禁用子树不会被连带勾上。
- 新增导出 `tableCascadeRoots`、`tableCascadeSelectableLeaves`、`tableCascades`。
