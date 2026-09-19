---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**TreeSelect 叶子行、分支行与清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
同一副按压面。** 机器 context 新增 `pressedPart`（`item` / `branch-control` / `clear-trigger`）与 `pressedValue`
（节点 value，清空按钮记 null），根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }` 两个
状态都认；守卫 `canPress` 在禁用、只读或加载时三者都不进，节点自身禁用时不进，清空按钮没有值可清时不进；`endPress`
只松开 part + value 对应的那一个，open 态 exit 时随浮层收起一并松开，按住途中转入禁用 / 只读 / 加载或值被清空时由
机器自行松开。叶子行自己接键盘与触屏；分支行的焦点落在 branch 上，键盘按压由 branch 代发（只认落在自己身上的按键与
失焦，子树里冒泡上来的不算），`branch-control` 投影 `data-pressed` 并只接触屏；同一个值按住分支行时叶子不亮。
Collection Item（overlay 语境）与 Action Control（field-inset 档）家族配方的按压选择器已是
`:is(:active, [data-pressed])`；键盘表新增 `tree-select.kbd.press`。三端公开 props 与事件不变。
