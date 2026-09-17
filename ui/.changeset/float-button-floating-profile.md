---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**FloatButton 触发器接入 Action Control floating 档与按压通道。** 连接层的 trigger 新增稳定属性
`data-xh-action-control` / `data-xh-action-profile="floating"` / `data-xh-action-display="always"` /
`data-xh-action-size`（随 `size`，缺省 `md`）/ `data-xh-action-variant`（缺省 `outline`，只有 `solid` 才品牌
实心），root 的 `data-variant` 不传时显式落 `outline`——缺省与显式 `variant="outline"` 从此是同一档，见下；
机器新增按压通道，Space / Enter 与触屏按住期间 trigger 投影 `data-pressed`（禁用不进入），键盘表新增
`float-button.kbd.press`。

视觉默认变化：触发器直径由 `--xh-control-h-lg` 40px 改为 floating 档 md 的 `--xh-control-box-lg` 48px
（compact 44px；sm 40px、lg 56px），图标由随文 1em 改为随档 24px（sm 20 / lg 32）；缺省磨砂面的悬停 /
按下由 200 / 300 档改为画布承载阶梯 `--xh-bg-subtle`（100）→ `--xh-bg-subtle-hover`（200），ghost 同。
显式 `variant="outline"` 自身的观感也变了：迁移前它是磨砂底 + `--xh-_tone-border-control`（缺省
`--xh-border-control`，悬停升 `--xh-border-control-hover`）描边、无顶光无 backdrop，`tone` 作用在描边上；
迁移后它与缺省合流为同一份 M2 磨砂面——描边取 `--xh-material-frosted-border`（悬停不变）、前景取
`--xh-material-frosted-fg`、带顶光与 backdrop。`tone` 不再作用于 outline 的静息描边与前景，只在悬停 /
按下的底上仍走 `--xh-_tone-subtle` 阶梯；要一支带语气的描边浮钮，用 `solid` / `subtle` 或写
`--xh-float-button-border` 覆盖。文档「变体」示例随之去掉与 outline 重复的缺省项。
皮肤删除触发器自写的盒型、四态面、hover / active / focus-surface / disabled 规则与粗指针命中区（改由家族
配方给出），公开槽 `--xh-float-button-bg / -bg-hover / -bg-active / -fg / -border / -border-hover / -shadow /
-radius / -size / -icon-size` 改为桥接到配方之前；`--xh-_float-button-radius` 私有槽删除。展开列表里的原生
动作项不是 Headless 部件，仍由皮肤按同一张 floating 档尺寸表与形态表画面。皮肤体积随桥接槽增加约 16%。
