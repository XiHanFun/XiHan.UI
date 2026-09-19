---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Steps 触发器接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行与圆点一起
换面）。** 机器 context 新增 `pressedStep`（按住的那一步的下标），事件 `PRESS.START { step, disabled? }` /
`PRESS.END { step }`；守卫 `canPress` 在整组禁用、作者自报禁用或 linear 未解锁时不进；`endPress` 只松开 step 对应的那
一个；按住途中整组转入禁用时由机器自行松开。切步与按压互相独立，Enter / Space 在 keydown 那一刻照旧切步。皮肤按压规则
已是 `:is(:active, [data-pressed])`（换面落在行与 `indicator`）；键盘表新增 `steps.kbd.press`。三端公开 props 与事件不变。
