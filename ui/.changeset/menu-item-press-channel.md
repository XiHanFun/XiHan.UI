---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Menu 条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
context 新增 `pressedValue`（正被按住的条目 value），根级事件 `PRESS.START { value, disabled }` /
`PRESS.END { value }` 两个状态都认；守卫 `canPress` 在整张菜单禁用或条目自身禁用（部件声明或 collection）时不进，
`endPress` 只松开 value 对应的那一条，open 态 exit 与按住途中整张菜单被禁用时由机器自行松开。条目与子菜单触发条目的
getter 投影 `data-pressed`，Collection Item 家族配方的按压选择器已是 `:is(:active, [data-pressed])`，键盘与触屏按住
呈现与指针一致的 pressed 底；键盘表新增 `menu.kbd.press`。三端公开 props 与事件不变。
