---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 树的可勾选模式 `checkable`：勾选与选中各管一件事。行首勾选框与空格键只改勾选集合 `checkedValue`（批量删除、批量授权），点行与确认键照 `selectionMode` 选中（单选即当前项，用来看详情），点行空白处不再顺带勾选。

- 新 prop：`checkable`、`checkedValue`（受控）、`defaultCheckedValue`；新事件 `checked-value-change`（Vue 另有 `update:checkedValue`，React 为 `onCheckedValueChange`）。
- `cascade` 与 `checkedStrategy` 在 `checkable` 下作用在勾选集合上，选中集合照朴素规则走。
- api 与插槽作用域新增 `checkable`、`checkedValue`、`isChecked`、`setCheckedValue`、`toggleChecked`；`isIndeterminate` 在 `checkable` 下看勾选集合。
- 树项用 `aria-checked` 报勾选、`aria-selected` 报选中；勾选框不占 Tab 位，点它焦点落在所在的行上，不冒泡成行的点击。
- 行首已是勾选框，选中（当前项）改由品牌淡底行面表达：这一档的行走集合家族的页内持久集合语境（`data-xh-collection-context="page"`）。
- 不开 `checkable` 时行为不变：`multiple` 档的点行本身就是勾选，适合纯勾选清单。
