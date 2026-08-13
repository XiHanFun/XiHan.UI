---
"@xihan-ui/styles": major
---

下拉/列表族条目度量与高亮档位统一（select / menu / listbox / combobox / popselect / tree / tree-select，向级联选择的两档制看齐）。

破坏性：7 个覆盖槽改名或移除（不留旧名）：

- `--xh-select-item-bg-highlight` → `--xh-select-item-bg-hover`、`--xh-combobox-item-bg-highlight` → `--xh-combobox-item-bg-hover`、`--xh-popselect-item-bg-highlight` → `--xh-popselect-item-bg-hover`、`--xh-menu-item-bg-highlight` → `--xh-menu-item-bg-hover`：悬停与键盘锚点统一为中性灰轻档（缺省 `--xh-bg-subtle`），不再随语气换色。
- `--xh-listbox-item-bg-highlight`、`--xh-tree-row-bg-highlight`、`--xh-tree-select-row-bg-highlight` 移除：键盘锚点并入轻档，与悬停共用 `-bg-hover` 一个槽（键盘位置由聚焦环表达，选中仍是文字色 + ✓ 标记，互不挤占）。

新增（menu）：

- 打开子菜单的触发条目升为强档：品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）+ 600 字重，新增 `--xh-menu-item-bg-active` 与 `--xh-menu-item-active-font-weight` 槽；两档靠色相分家，与级联选择的展开路径同一套词汇。
- 条目行高从 none 抬到 normal，新增 `--xh-menu-item-leading` 槽。

度量：

- 七家条目 padding 统一为 6px / 12px（`--xh-space-1_5` / `--xh-control-px-md`，行内随密度轴收窄），底色与文字色补 micro 过渡。
- menu 尺寸阶梯重排：sm = `--xh-space-1` / `--xh-control-px-sm`，lg = `--xh-space-2` / `--xh-control-px-lg`。
- listbox / combobox 分组标题行内内缩跟随条目改为 `--xh-control-px-md`，与条目文字保持同一条竖线。
