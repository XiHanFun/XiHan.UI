---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**Drawer 面板改 M4 sheet 三件套并走 slide 入场，触发器与关闭按钮接入 Action Control 与按压通道。** 连接层的
trigger 新增稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
`data-xh-action-size="md"` / `data-xh-action-variant="outline"`；close-trigger 新增
`data-xh-action-profile="icon"` / `data-xh-action-size="sm"` / `data-xh-action-variant="ghost"`。作者以 asChild
换成自己的按钮时，家族标记不落到它身上。Space / Enter 与触屏按住期间该按钮投影 `data-pressed`（记在与 Dialog 共用的
机器 `context.pressed` 里，抽屉收起时一并松开），键盘表新增 `drawer.kbd.press`。

视觉默认变化：content 由 `--xh-bg-surface` 底 + `--xh-elevation-sheet` 影、无描边，改为
`--xh-material-elevated-border` 1px 描边 + `--xh-material-elevated-bg` 底 + `--xh-material-elevated-shadow`
（新增公开槽 `--xh-drawer-border`；`--xh-drawer-bg / -shadow / -fg` 缺省随之改为 elevated 令牌）；四向入场由
`--xh-motion-duration-enter` + `--xh-motion-ease-enter-strong` 改为 `--xh-motion-duration-slide`（320ms）+
`--xh-motion-ease-slide`，退场不变；blur 遮罩补 `-webkit-backdrop-filter`。trigger 删除自写的描边盒型（静息
`--xh-bg-canvas` 底、悬停 200、按下 300、只缩放）改由配方 outline 列给出（静息透明底，悬停 `--xh-bg-subtle` 100 →
按下 `--xh-bg-subtle-hover` 200 并 0.97 缩放）；展开期间的压住面由 `--xh-bg-subtle-active` 改为悬停同档的
`--xh-bg-subtle`，该态的 currentColor 环规则与 `:disabled` 置灰规则删除；作者塞入的图标由随文 1em 改为随档 20px。
close-trigger 删除自写的悬停 200 / 按下 300，改由配方 ghost 列给出（悬停 100 → 按下 200）；图标改随档 16px。
description 字号缺省 14 → `--xh-text-secondary-size` 13。root / content 的 `--xh-icon-size` 缺省改
`--xh-glyph-size-md`。content 与 body 新增 `overscroll-behavior: contain`，body 新增带 `:not([data-xh-scrollbar])`
守卫的 `scrollbar-gutter: stable`。

公开槽 `--xh-drawer-trigger-gap / -h / -px / -radius / -font-size / -bg / -fg / -border / -bg-hover / -border-hover /
-bg-active / -bg-open / -border-open`、`--xh-drawer-close-size / -radius / -fg / -fg-hover / -bg-hover / -bg-active`
改为桥接到配方之前；新增 `--xh-drawer-close-bg-focus` / `--xh-drawer-close-fg-focus`，桥到配方的 focus-visible 面
（与 Dialog 关闭钮同名同缺省：透明底 + 悬停字色）。
