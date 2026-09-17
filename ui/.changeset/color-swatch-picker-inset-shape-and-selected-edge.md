---
'@xihan-ui/styles': minor
---

ColorSwatchPicker 按设计真源归位形状、选中标记、阶梯与标签：格子与色块面的圆角由 control 改 inset（`--xh-color-swatch-picker-item-radius` 缺省 `--xh-shape-inset`），选中徽标的正方盒由 pill 改 circle；选中不再在格子外画 outline 环（外圈留给焦点环独占），改为色块自己的品牌描边（`--xh-color-swatch-picker-ring` 改映射到选中态的色块描边，缺省 `--xh-fg-brand`、语气组取语气色）加正中的徽标；悬停描边由 `--xh-border-strong` 改 `--xh-border-control-hover`，按下在缩放之外以描边换品牌色作第二通道（新增 `--xh-color-swatch-picker-swatch-border-pressed`，底是展示色不换）；标题走复合单字段标签角色：14px / 500 / `--xh-fg-default`、贴控件 `--xh-space-1`（新增 `--xh-color-swatch-picker-label-gap`），禁用标签新增 `--xh-color-swatch-picker-label-fg-disabled`。ColorPicker 内嵌色板同步撤掉不再消费的字号私有槽。
