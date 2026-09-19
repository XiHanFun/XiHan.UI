---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Anchor 链接接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context
新增 `pressedValue`（正被按住的链接，按 value 记），事件 `PRESS.START { value }` / `PRESS.END { value }` 挂根级（按住
Enter 点过去后机器在 `scrolling`，抬起在那里到达）；锚点没有禁用，守卫 `canPress` 恒放行。激活项与按压互相独立。键盘表
新增 `anchor.kbd.press`。三端公开 props 与事件不变。
