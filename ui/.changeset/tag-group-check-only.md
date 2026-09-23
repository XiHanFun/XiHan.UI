---
'@xihan-ui/styles': major
---

TagGroup 的选中改成与 TreeSelect 同一种读法：选中的标签面、字与描边都不换，只在文字后亮一枚对号。

- 对号取品牌前景，标了语气的组取语气字色；实心标签取面配对的那支前景色，置灰标签跟着字一起置灰。
- 悬停、键盘锚点与按下沿用未选中的那条阶梯；forced-colors 下对号用系统高亮色画出，打印时按原样印出。

**破坏性变更**：删除组件槽 `--xh-tag-group-item-bg-selected`、`--xh-tag-group-item-bg-selected-hover`、`--xh-tag-group-item-bg-selected-pressed`、`--xh-tag-group-item-fg-selected` 与 `--xh-tag-group-item-border-selected`；实心标签选中时不再描出那一圈字色描边。
