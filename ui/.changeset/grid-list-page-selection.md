---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

GridList 的选中标记与 Table、Transfer 统一：同为「页内持久集合 + 行首勾选框」，选中行铺品牌淡底行面（`--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle`，悬停 20%、按下 28%），方框留作非颜色通道。此前选中行保持透明面、只靠方框表达，与另外两者是两套标记。

- 新增组件槽 `--xh-grid-list-row-bg-selected`、`--xh-grid-list-row-fg-selected`，与 `--xh-table-row-bg-selected` / `--xh-transfer-item-bg-selected` 同位。
- `row-selection-indicator` 投影 `data-xh-check-mark` 与 `data-xh-check-mark-profile="box"`，方框里的勾改由勾选标记配方画（与 Checkbox、Transfer、Table 同一副淡变与缩放），皮肤里复刻的那一份删掉。
- 指针点过之后留下的高亮行（`data-highlighted` 而非 `:focus-visible`）面退回静息：未选中行透明、选中行回到选中面，指针移入仍按悬停那一档。
