---
"@xihan-ui/styles": major
---

级联选择皮肤全面翻修：展开路径改品牌淡底加粗、分支条目补右向箭头、列改内容撑宽定高、条目度量放宽。

破坏性：4 个覆盖槽改名（不留旧名）：

- `--xh-cascader-row-bg-highlight` → `--xh-cascader-row-bg-active`：展开路径的底色从中性灰二档改为品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）并加 `--xh-cascader-row-active-font-weight`（缺省 600）；悬停与键盘锚点保持中性灰轻档，两档靠色相分家。
- `--xh-cascader-column-w` → `--xh-cascader-column-min-w`：列从定宽 11rem 改为内容撑宽 + 下限 7rem。
- `--xh-cascader-column-max-h` → `--xh-cascader-column-h`：列高从内容撑（上限 16rem）改为定高 11.25rem，切换展开路径浮层不再上下跳动。
- `--xh-cascader-indicator-size` → `--xh-cascader-item-indicator-size`：与既有 `--xh-cascader-item-indicator-fg` 配对，避免与触发器 indicator 部件混名。

新增：

- 分支条目行尾自动画右向小箭头（`data-branch`，纯 CSS，`--xh-cascader-branch-arrow-size/-fg/-stroke` 可覆写，rtl 自动翻转，禁用同灰）。
- 触发器箭头与勾选标记的 `:empty` 兜底字形（▾ / ✓），与 select 同约定；级联勾选半选态皮肤自绘横杠。
- 条目 padding 放宽为 6px / 12px（行内走 `--xh-control-px-md`，紧凑密度自动收窄）、上限宽 25rem、背景与文字色过渡。
- 搜索候选与列内条目共用同一套行度量槽；搜索视图规则移入 `xihan.components` 层。
- 三处聚焦环改固定 `--xh-ring-focus`（不再随语气）；浮层入场横移 rtl 翻转。
