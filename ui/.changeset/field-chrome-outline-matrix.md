---
"@xihan-ui/styles": major
"@xihan-ui/headless": minor
---

Field Chrome 家族的静息形态回到描边式：`--xh-bg-canvas` 底、`--xh-border-control` 描边、control 圆角、无阴影，
不再消费 `--xh-elevation-raised`；配方新增 `outline` / `subtle` / `ghost` 三档 × 七态矩阵，由
`[data-xh-field-chrome][data-variant]` 命中，disabled 一律 `--xh-border-default` + `--xh-bg-subtle`，readOnly 只换底色，
聚焦描边一律 `--xh-border-control-focus`。Text Field 与 Color Field 的默认外观随之变化（默认即 `outline`），
`--xh-text-field-control-*` / `--xh-color-field-control-*` 的默认来源改为家族形态槽。

Text Field 与 Color Field 的 control 部件新增 `data-variant` 投影。
