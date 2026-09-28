---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

CheckboxGroup 新增结构形态 `variant`（`list` 缺省 | `card`）与说明行部件 `item-description`。

- `variant="card"` 把每个条目画成一张可点的描边卡，与 RadioGroup 的 card 形态共用选择卡片家族配方：条目换成 Action Control row 档的 `outline` 形态并投影 `data-xh-choice-card`，根投影 `data-variant`；勾中的卡换品牌淡底（有 `tone` 换语气淡底），描边不换，行首方框照常。全选触发器在两种形态里都是一行。
- 条目新增投影 `data-readonly`，卡面据此在只读时收回悬停与按下面。
- 新增部件 `item-description`（`XhCheckboxGroupItemDescription`）：文案下方的说明行，13 / `--xh-fg-muted`；`collection` 的节点新增 `description`，数据驱动时自动铺出这一行。
- 新增组件槽 `--xh-checkbox-group-card-title-font-weight`、`--xh-checkbox-group-item-description-fg`、`--xh-checkbox-group-item-description-font-size`、`--xh-checkbox-group-item-description-fg-disabled`、`--xh-checkbox-group-item-row-gap`。
