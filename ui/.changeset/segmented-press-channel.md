---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Segmented 分段接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressedValue`（按住的段 value），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
守卫 `canPress` 在整组禁用、只读或段自身禁用时不进；`endPress` 只松开 value 对应的那一个；按住途中整组转入禁用或
只读时由机器自行松开。选中与按压互相独立，选中语义照旧由平台把这两个键翻成 click。皮肤的按压选择器已是
`:is(:active, [data-pressed])`（`--xh-action-scale-pressed: none` 保接缝）；键盘表新增 `segmented.kbd.press`。
三端公开 props 与事件不变。
