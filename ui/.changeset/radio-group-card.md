---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

RadioGroup 新增结构形态 `variant`（`list` 缺省 | `card`）与说明行部件 `item-description`；新增选择卡片家族配方。

- `variant="card"` 把每个条目画成一张可点的描边卡（对应 Mantine Radio.Card、Carbon selectable tile），不新建组件：条目换成 Action Control row 档的 `outline` 形态并投影 `data-xh-choice-card`，根投影 `data-variant`。卡面由新配方 `family/choice-card.css`（子路径 `@xihan-ui/styles/choice-card.css`）给出：surface 圆角、内衬 space-3 / space-4、透明底 + `--xh-border-control`，白底承载阶梯悬停 100 → 按下 200 且不随语气染色；选中卡换「页内持久集合的选中」面（品牌淡底 12 → 20 → 28、前景 `--xh-fg-on-brand-subtle`，写了 `tone` 换语气淡底），描边不换，行首圆圈照常；只读不给悬停与按下面，强制色下选中卡描边换 Highlight，打印时选中卡描边加粗。竖排时卡片撑满一列，横排时各卡等分一行、放不下折行。
- 新增部件 `item-description`（`XhRadioGroupItemDescription`）：文案下方的说明行，13 / `--xh-fg-muted`，与文案一起构成条目的可及名；`collection` 的节点新增 `description`，数据驱动时自动铺出这一行。列表形态的条目带了说明同样排成两行。
- 新增组件槽 `--xh-radio-group-card-title-font-weight`、`--xh-radio-group-item-description-fg`、`--xh-radio-group-item-description-font-size`、`--xh-radio-group-item-description-fg-disabled`。
- 设计真源登记 RadioGroup / CheckboxGroup 的 `list | card` 结构形态、选择卡片的部件归族、surface 形状与选中标记。
