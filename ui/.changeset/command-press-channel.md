---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Command 命令接入按压通道：Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增
`pressedValue`（命令 value），根级事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }` 两个状态都认；守卫
`canPress` 在加载中不进，命令自身禁用（部件声明或清单）时不进；`endPress` 只松开 value 对应的那一条，open 态 exit 时随
面板收起一并松开，按住途中转入加载时由机器自行松开。焦点恒在检索框，命令的键盘按压由检索框代发（Enter 按住时锚点命令
投影），命令自己只接触屏。Collection Item（overlay 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；
键盘表新增 `command.kbd.press`。三端公开 props 与事件不变。
