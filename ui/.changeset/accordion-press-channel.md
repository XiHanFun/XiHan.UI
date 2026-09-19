---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Accordion 的 trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
机器 context 新增 `pressedValue`（正被按住的条目 value），事件 `PRESS.START` / `PRESS.END`；整组或条目禁用时不进，按住途中整组转禁用
时由机器松开。trigger 的方向键导航与按压跟踪合成为同一个 keydown 处理器。键盘表新增 `accordion.kbd.press`。三端公开 props 与事件不变。
