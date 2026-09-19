---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**ToggleGroup 条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressedValue`（按住的条目 value），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
守卫 `canPress` 在整组禁用或条目自身禁用时不进；`endPress` 只松开 value 对应的那一个；按住途中整组转入禁用时由机器
自行松开。开关态（`aria-pressed` / `aria-checked`）与按压互相独立，切换照旧由平台把这两个键翻成 click。Action Control
家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `toggle-group.kbd.press`。三端公开 props 与事件不变。
