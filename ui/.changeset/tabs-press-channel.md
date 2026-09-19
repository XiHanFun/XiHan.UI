---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Tabs 页签接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressedValue`（按住的 trigger value），事件 `PRESS.START { value, disabled? }` /
`PRESS.END { value }`；守卫 `canPress` 在条目禁用时不进（Tabs 没有整组禁用，条目自身的禁用由 connect 判定后随事件
带入）；`endPress` 只松开 value 对应的那一个。选中（`aria-selected` / `data-current`）与按压互相独立，确认语义照旧由
同一次按键承担；同一个 pointerdown 先过按压跟踪器再判拖动起手（触屏归按压、鼠标归拖动）。line 档的 Collection Item
nav 语境与 card / segment 皮肤的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `tabs.kbd.press`。
三端公开 props 与事件不变。
