---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**ColorSwatchPicker 色格接入按压通道：Space 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（换描边并缩放）。**
机器 context 新增 `pressedValue`（正被按住的格子，按颜色串记），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
守卫 `canPress` 在整组禁用、只读与格子自身禁用时不进，按住途中整组转入禁用或只读时由机器自行松开。role=radio 只有
Space 是激活键，Enter 那一路没有按压面。ColorPicker 内嵌的预设色板复用同一份 connect，随之接上。键盘表新增
`color-swatch-picker.kbd.press`。三端公开 props 与事件不变。
