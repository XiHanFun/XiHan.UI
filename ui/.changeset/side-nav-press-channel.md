---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**SideNav 链接行与分支行接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressedPart`（`link` / `branch-trigger`）与 `pressedValue`（入口 value），根级事件
`PRESS.START { part, value, disabled? }` / `PRESS.END { part, value }` 平铺与弹出两个状态都认；守卫 `canPress` 在整个侧栏
禁用时不进，入口自身禁用时不进；`endPress` 只松开 part + value 对应的那一个，弹出面板收起（exit）时一并松开，按住途中
侧栏转入禁用时由机器自行松开。导航当前（`aria-current`）与按压互相独立；激活与展开语义照旧由同一次按键承担。
Collection Item（page 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `side-nav.kbd.press`。
三端公开 props 与事件不变。
