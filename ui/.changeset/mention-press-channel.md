---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Mention 候选接入按压通道：触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增
`pressedValue`（候选 value），根级事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }` 两个状态都认；守卫
`canPress` 在禁用、只读或加载时不进，候选自身禁用（部件声明或 collection）时不进；`endPress` 只松开 value 对应的那一条，
open 态 exit 时随浮层收起一并松开，按住途中转入禁用 / 只读 / 加载时由机器自行松开。焦点恒在输入框，Enter 在同一次
keydown 里插入候选并收起浮层，键盘那一路没有可见的按住帧，候选只接触屏。Collection Item（overlay 语境）家族配方的
按压选择器已是 `:is(:active, [data-pressed])`。三端公开 props 与事件不变。
