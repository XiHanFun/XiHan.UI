---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Select 条目与清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压
面。** 机器 context 新增 `pressedPart`（`item` / `clear-trigger`）与 `pressedValue`（条目 value，清空按钮记 null），
根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }` 两个状态都认；守卫 `canPress` 在
禁用或只读时两者都不进，条目自身禁用（部件声明或 collection）时不进，清空按钮没有值可清时不进；`endPress` 只松开
part + value 对应的那一个，open 态 exit 时条目随浮层收起一并松开，按住途中转入禁用 / 只读或值被清空时由机器自行
松开。item 与 clear-trigger 的 getter 投影 `data-pressed`，Collection Item（overlay 语境）与 Action Control
（field-inset 档）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `select.kbd.press`。三端公开
props 与事件不变。
