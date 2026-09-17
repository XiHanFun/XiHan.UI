---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**FloatButton 触发器接入 Action Control floating 档与按压通道。** 连接层的 trigger 新增稳定属性
`data-xh-action-control` / `data-xh-action-profile="floating"` / `data-xh-action-display="always"` /
`data-xh-action-size`（随 `size`，缺省 `md`）/ `data-xh-action-variant`（缺省 `outline`，只有 `solid` 才品牌
实心），root 的 `data-variant` 不传时显式落 `outline`；机器新增按压通道，Space / Enter 与触屏按住期间
trigger 投影 `data-pressed`（禁用不进入），键盘表新增 `float-button.kbd.press`。

视觉默认变化：触发器直径由 `--xh-control-h-lg` 40px 改为 floating 档 md 的 `--xh-control-box-lg` 48px
（compact 44px；sm 40px、lg 56px），图标由随文 1em 改为随档 24px（sm 20 / lg 32）；缺省磨砂面的悬停 /
按下由 200 / 300 档改为画布承载阶梯 `--xh-bg-subtle`（100）→ `--xh-bg-subtle-hover`（200），ghost 同。
皮肤删除触发器自写的盒型、四态面、hover / active / focus-surface / disabled 规则与粗指针命中区（改由家族
配方给出），公开槽 `--xh-float-button-bg / -bg-hover / -bg-active / -fg / -border / -border-hover / -shadow /
-radius / -size / -icon-size` 改为桥接到配方之前；`--xh-_float-button-radius` 私有槽删除。展开列表里的原生
动作项不是 Headless 部件，仍由皮肤按同一张 floating 档尺寸表与形态表画面。皮肤体积随桥接槽增加约 16%。
