---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Sortable 拖动把手接入按压通道：触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增 `pressedId`
（按项 id 记住正被按住的把手），事件 `PRESS.START` / `PRESS.END`；整体禁用或该项禁用时不进。把手的 pointerdown 同时是拖动起点：
触屏那一下先进按压面、拖动会话同时起步，走够激活距离升级成拖动时由机器撤下，拖动中的回执只剩 `data-dragging`；键盘的
Space / Enter 在 keydown 即拾起转拖动、按压面随即撤下。按住途中整体转禁用或该项离开 `ids` 时同样松开。键盘表新增
`sortable.kbd.press`。三端公开 props 与事件不变。
