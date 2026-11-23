---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**改进** 树（`selectionMode="multiple"`）与树选择（`multiple`）的多选改为行首勾选框，不再在行尾打勾：行尾对号看不出是多选，点一下本想换选这一项，结果是又勾上了一项。勾选框排在展开箭头之后、文字之前，分支行同样摆一枚，级联半选在方框里画横杠；方框与勾由勾选标记配方画，与 Checkbox 同一副样子（静息 strong 描边透明底，勾上与半选填品牌实心面，条目的语气不改它）。单选与树的 `extended` 档照旧是行尾对号。

- `item-indicator` 在多选时投影 `data-xh-check-mark`（`checked` / `indeterminate` / `unchecked`）、`data-xh-check-mark-profile="box"`，集合槽由 `indicator` 换成 `check`；不改结构，手写的部件写在行里哪一格都会排到前面。
- 集合行家族网格多一列 `check`（`prefix` 之后、`text` 之前），没有勾选框的行这一列宽 0、不占位。
- 新增覆盖槽：`--xh-tree-item-checkbox-*` 与 `--xh-tree-select-item-checkbox-*`（`border`、`border-hover`、`bg`、`bg-checked`、`fg`、`radius`、`border-disabled`、`bg-disabled`）。
- `tree.css` 与 `tree-select.css` 单独引入时多带一份勾选标记配方（`family/check-mark.css`），体积分别涨约 3 kB 与 2 kB。
