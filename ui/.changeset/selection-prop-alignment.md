---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
---

**选择态一族（table / tree / transfer）的选中集合统一叫 `selection`。** 三个组件表达的是同一件事，
却各叫各的：table 是 `selection`、tree 是 `selectedValue`、transfer 是 `selected`。1.0 之后 prop 名
就是公开 API，趁 alpha 一次改完，不留别名。

三家统一为 `selection` / `defaultSelection`，回调仍是 `onSelectionChange`，载荷字段一律 `{ value }`
（全库同类载荷都用 `value`，transfer 的 `{ selected }` 是唯一破例）。

迁移点：

- tree：prop `selectedValue` → `selection`、`defaultSelectedValue` → `defaultSelection`；
  `TreeApi.selectedValue` → `selection`、`setSelectedValue` → `setSelection`；
  机器事件 `SELECTED.SET` → `SELECTION.SET`；Vue 的 `v-model:selectedValue` → `v-model:selection`；
  WC 的 `el.selectedValue` → `el.selection`、`el.defaultSelectedValue` → `el.defaultSelection`。
- transfer：prop `selected` → `selection`、`defaultSelected` → `defaultSelection`；
  载荷 `TransferSelectionChangeDetails.selected` → `value`；
  `TransferApi.selected` → `selection`、`setSelected` → `setSelection`；
  机器事件 `SELECTED.SET { selected }` → `SELECTION.SET { value }`；
  纯函数入参与 `TransferMoveInput` / `TransferMoveResult` 的 `selected` 字段 → `selection`；
  Vue 的 `v-model:selected` → `v-model:selection`，默认插槽载荷 `selected` → `selection`、
  `setSelected` → `setSelection`；WC 的 `el.selected` → `el.selection`、
  `el.defaultSelected` → `el.defaultSelection`。
- table 本来就是这套名字，不变。

三者的语义各不相同，改的只是名字：table 的 `selection` 可以是 `'all'`，tree 分单选/复选，
transfer 的 `selection` 是两侧的勾选集合，与「已搬到右侧」的 `value` 是两回事。
