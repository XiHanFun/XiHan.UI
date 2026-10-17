---
"@xihan-ui/viz": minor
"@xihan-ui/headless": minor
"@xihan-ui/designer-kit": minor
"@xihan-ui/designer-shell": minor
---

**新增** 属性描述的内建编辑方式 `filter`：取值是条件树（`FilterGroup`），属性面板自带 `<xh-filter-builder>` 编辑器。

- `@xihan-ui/viz` 新增 `FilterField`、`FilterParameter`、`FilterValueType`：可筛选字段、可引用参数与它们的值类型，与 `FilterCondition`、`FilterGroup` 同处。
- `@xihan-ui/headless`：条件编辑器的 `fields`、`parameters` 用 viz 的 `FilterField`、`FilterParameter`、`FilterValueType`，从 `@xihan-ui/viz` 引入。
- `@xihan-ui/designer-kit`：`PropertyControl` 新增 `{ kind: 'filter', fields?, parameters?, maxDepth?, ids? }`；`checkPropertyValue` 只查条件树这层形状（组是 `{ logic, conditions }`，条件是 `{ field, operator }`），字段与运算符合不合由各款自己的校验报。`BUILTIN_CONTROL_KINDS` 收进 `filter`，扩展再登记同名编辑方式时合并报冲突。`DataField` 的 value 字段可写 `type`，新增 `listFilterFields(fields)` 列出条件编辑器用的字段。
- `@xihan-ui/designer-shell`：属性面板的 `filter` 编辑器是 `<xh-filter-builder>`。字段先取描述的 `fields`，没写时由面板的 `dataFields` 按 `listFilterFields` 列出值字段；`ids` 为 true 时新建的条件与组按 `c1`、`g1` 取树里没用过的 id；一次增删改写入即封口；多个对象取值不同时显示空树，空态写「多个值」。按需注册时连带注册 `xh-filter-builder`。
