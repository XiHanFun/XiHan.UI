---
'@xihan-ui/styles': patch
---

**修复** 树选择（TreeSelect）候选面板里的行比 Select 的选项矮一截：sm 档 27.5px 对 32px，md 档 33px 对 36px，两个下拉并排时一高一矮。树选择的面板同样是锚定浮层里的集合，现在按档定高，与 Select、Combobox、Cascader 同一把尺（32 / 36 / 40px，紧凑 28 / 32 / 36px）；带说明的行照常撑高。新增覆盖槽 `--xh-tree-select-item-h`。
