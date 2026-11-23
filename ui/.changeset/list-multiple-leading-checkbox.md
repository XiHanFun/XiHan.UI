---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**改进** 列表框（`selectionMode="multiple"`）与级联选择（`multiple`）的多选改为行首勾选框，与树、树选择一致：行尾对号看不出是多选，点一下本想换选这一项，结果是又勾上了一项。勾选框排在一行的最前面（在 `item-prefix` 的图标、头像之前），级联半选在方框里画横杠；方框与勾由勾选标记配方画，静息 strong 描边透明底，勾上与半选填品牌实心面。列表框的单选与 `extended`、级联选择的单选仍是行尾对号；级联选择的搜索候选是整条路径的一行，仍在行尾标勾。

- `item-indicator` 在多选时投影 `data-xh-check-mark`、`data-xh-check-mark-profile="box"`，集合槽由 `indicator` 换成 `check-lead`；不改结构，手写的部件写在行里哪一格都会排到最前面。
- 集合行家族网格再多一列 `check-lead`（`prefix` 之前）：行首是内容（图标、头像）时勾选框落这一列，行首是结构性前导（树的展开箭头）时仍落 `prefix` 之后的 `check` 列；这两列只在带勾选框的行里才有，没有勾选框的行照旧是五列。
- 新增覆盖槽：`--xh-listbox-item-checkbox-*` 与 `--xh-cascader-item-checkbox-*`（`border`、`border-hover`、`bg`、`bg-checked`、`fg`、`radius`、`border-disabled`、`bg-disabled`）。
- `listbox.css` 与 `cascader.css` 单独引入时多带一份勾选标记配方（`family/check-mark.css`），体积各涨约 2 kB。
