---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**RadioGroup 条目接入按压通道：Space 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行与圆圈一起换面）。**
机器 context 新增 `pressedValue`（按住的条目 value），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
守卫 `canPress` 在整组禁用、只读或条目自身禁用时不进；`endPress` 只松开 value 对应的那一个；按住途中整组转入禁用或
只读时由机器自行松开。`role=radio` 只有 Space 是激活键，Enter 不进按压面；选中与按压互相独立，Space 在 keydown 那一刻
照旧选中。皮肤的按压选择器已是 `:is(:active, [data-pressed])`（换面落在行与 `indicator`）；键盘表新增
`radio-group.kbd.press`。三端公开 props 与事件不变。
