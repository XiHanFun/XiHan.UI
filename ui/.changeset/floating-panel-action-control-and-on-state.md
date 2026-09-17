---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**FloatingPanel 三种按钮接入 Action Control 与按压通道，当前形态钮改品牌淡底。** 连接层的 trigger 新增
稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
`data-xh-action-size="md"` / `data-xh-action-variant="outline"`；window-state-trigger 与 close-trigger 新增
`data-xh-action-profile="icon"` / `data-xh-action-size="sm"` / `data-xh-action-variant="ghost"`。机器新增按压
通道（`context.pressed` 记正被按住的那颗：`trigger` / `close-trigger` / `window-state:<形态>`，导出类型
`FloatingPanelPressedPart`），Space / Enter 与触屏按住期间该按钮投影 `data-pressed`（形态钮禁用时不进入，
按住途中被禁用由机器收面；开合与关闭不受禁用影响），键盘表新增 `floating-panel.kbd.press`。

视觉默认变化：trigger 删除自写盒型与只缩放不换底的 `:active`，改由家族配方按 outline 列给出——静息底由
`--xh-bg-surface` 改为透明（描边不变），悬停
`--xh-bg-subtle`（100）→ 按下 `--xh-bg-subtle-hover`（200）并 0.97 缩放；作者塞入的图标由随文 1em 改为
随档 20px。形态钮与关闭钮删除自写的悬停 200 / 按下 300、聚焦铺 `--xh-material-frosted-focus-surface` 实体底
与禁用面，改由配方 ghost 列给出（悬停 100 → 按下 200，焦点面透明吃库环，禁用 `--xh-fg-disabled`）；当前形态
的按钮（`data-state="on"`）由 `--xh-bg-subtle-active` + `--xh-fg-default` 改为品牌淡底 `--xh-bg-brand-subtle`
+ `--xh-fg-on-brand-subtle`（悬停 20% → 按下 28%），on 态的 currentColor 环规则删除；图标由 1em 改为
随档 16px。标题字重 `--xh-text-label-weight` 500 → `--xh-font-weight-semibold` 600。root / content 的
`--xh-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`。body 新增
`overscroll-behavior: contain`。

公开槽 `--xh-floating-panel-trigger-h / -px / -radius / -bg / -fg / -border`、
`--xh-floating-panel-action-fg / -fg-hover / -fg-active / -bg-hover / -bg-active / -size / -radius`、
`--xh-floating-panel-close-size / -radius` 改为桥接到配方之前（`-action-fg-active` / `-action-bg-active`
现指按下态）；新增 `--xh-floating-panel-action-bg-on / -bg-on-hover / -bg-on-active / -fg-on`。
