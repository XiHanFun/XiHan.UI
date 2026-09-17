---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
---

**Tree 接入 Collection Item 配方，页内选中改品牌淡底行面 + 前导标记，行补按下面。**

- 叶子（`item`）与分支行（`branch-control`）投影 `data-xh-collection-item` / `-size='md'` / `-context='page'`，文字、对号、箭头、勾选把手与拖拽把手各带 `data-xh-collection-slot`；行布局保持 flex（一行可并排多个前导部件与作者内容），间距仍由行的 gap 给。
- 选中行由「品牌深字 + 中字重」改为 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景、字重不变，叶子的对号（或勾选档的前导方框）是唯一标记；selected + hover 20%、+ pressed 28%；悬停 100、按下 200 只换面（此前按下零反馈）。分支行的选中面与禁用守卫按连接层同步的 `data-selected` / `data-disabled` 命中。公开槽名不变，`--xh-tree-row-fg-selected` 缺省改 `--xh-fg-on-brand-subtle`、`--xh-tree-row-selected-font-weight` 缺省改 regular；新增 `--xh-tree-row-bg-pressed` / `--xh-tree-row-bg-selected` / `--xh-tree-item-check-fg`。
- 拖放「放进节点里」的落点面由品牌淡底改为 `--xh-bg-subtle-hover`：品牌淡底专属选中。
- 根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md`；箭头 / 对号盒与叶子占位随家族字形尺，勾选方框里的勾按边长比例取尺。
- 容器形态由 root 的 `data-variant` 向 `tree` 下发描边与底（删私有槽 `--xh-_tree-border` / `--xh-_tree-bg`），outline 面与 List / Descriptions 同源；外观逐值不变。
