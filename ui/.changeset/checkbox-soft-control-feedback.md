---
'@xihan-ui/styles': minor
---

Checkbox 保持实体表单控件。未选中盒迁入 M1 Soft Surface 的实体背景、顶部高光与接触影，同时保留达到
控件边界对比的真实描边；选中与半选改用 tone 的 control 色作为实心底和边界，六种 tone 在明暗主题下
都让盒与页面、勾或短横与盒达到 3:1。高对比轴提升未选中边界，未引入 backdrop 或透明玻璃。

indicator 不再在 unchecked 时 `display:none`，而是常驻控制盒，以 120ms opacity / scale 进入或离开有值态；
兜底勾和半选横杠使用同一个随控制盒缩放的光学盒，sm / md / lg 与 compact 密度不再沿用固定文字图标尺寸。
整行标签 hover 会反馈到控制盒，按下撤掉高光与海拔；disabled / readonly 分别使用不可用/默认光标并撤掉
交互阴影。forced-colors 移除装饰层，用真实边界、CanvasText / GrayText 与系统状态环保持三态可辨。

标签字号和间距现在跟随三尺寸及密度轴，控制盒设为不可压缩，RTL 与长标签下仍停在行内起点。
新增 `--xh-checkbox-highlight`、`--xh-checkbox-shadow`、`--xh-checkbox-shadow-hover`、
`--xh-checkbox-shadow-pressed`、`--xh-checkbox-shadow-disabled`、`--xh-checkbox-shadow-readonly`、
`--xh-checkbox-border-hover` 与 `--xh-checkbox-label-leading` 覆写槽；既有槽未删除，因此 Styles 按 minor 记录。

去注释与空白后的皮肤体积由 5283 增至 8587 字节；增量来自 M1 表面、indicator 状态动画、整行反馈、
三尺寸标签节奏以及高对比/forced-colors 的显式通道。

皮肤体积（去注释、压空白）：前一提交源码 5283 字节，当前 8617 字节；登记基线 5283 → 8617，只更新本组件，10% 容差保持不变。
