---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**Dialog 触发器与关闭按钮接入 Action Control 与按压通道，说明文字改说明档，模态正文滚动归档。** 连接层的
trigger 新增稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
`data-xh-action-size="md"` / `data-xh-action-variant="outline"`；close-trigger 新增
`data-xh-action-profile="icon"` / `data-xh-action-size="sm"` / `data-xh-action-variant="ghost"`。作者以 asChild
换成自己的按钮时，家族标记不落到它身上。机器新增按压通道（`context.pressed` 记正被按住的那颗：`trigger` /
`close-trigger`，导出类型 `DialogPressedPart`；Drawer 跑的是同一台机器，其事件表同步多出 `PRESS.START` /
`PRESS.END`），Space / Enter 与触屏按住期间该按钮投影 `data-pressed`，面板收起时一并松开；键盘表新增
`dialog.kbd.press`。

视觉默认变化：trigger 此前是 UA 裸按钮，现由家族配方按 outline 列给出 md 档盒型、中性描边、悬停
`--xh-bg-subtle`（100）→ 按下 `--xh-bg-subtle-hover`（200）并 0.97 缩放。close-trigger 删除自写的悬停 200 / 按下
300、聚焦铺 `--xh-material-elevated-focus-surface` 实体底，改由配方 ghost 列给出（悬停 100 → 按下 200，焦点面透明吃
库环）；作者塞入的图标由随文 1em 改为随档 16px。description 字号缺省 `--xh-text-body-size` 14 →
`--xh-text-secondary-size` 13。content 的 `--xh-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`。
body 新增 `overscroll-behavior: contain` 与带 `:not([data-xh-scrollbar])` 守卫的 `scrollbar-gutter: stable`。

公开槽 `--xh-dialog-close-size / -radius / -fg / -fg-hover / -bg-hover / -bg-active / -bg-focus / -fg-focus` 改为桥接
到配方之前（`-bg-focus` / `-fg-focus` 桥到配方的 focus-visible 面，缺省不再铺实体底而是透明底 + 悬停字色，槽本身
保留）。
