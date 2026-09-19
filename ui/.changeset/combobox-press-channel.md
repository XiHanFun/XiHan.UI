---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Combobox 候选、展开按钮与清空按钮接入按压通道：Enter / Space 与触屏按住投影 `data-pressed`，与指针 `:active`
同一副按压面。** 机器 context 新增 `pressedPart`（`item` / `trigger` / `clear-trigger`）与 `pressedValue`（候选
value，两个按钮记 null），根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }` 两个
状态都认；守卫 `canPress` 在禁用、只读或加载时三者都不进，候选自身禁用（部件声明或 collection）时不进，清空按钮没有
东西可清时不进；`endPress` 只松开 part + value 对应的那一个，open 态 exit 时候选随浮层收起一并松开，按住途中转入
禁用 / 只读 / 加载或值与输入串都被清空时由机器自行松开。焦点恒在输入框：候选的键盘按压由输入框代发（Enter 按住时
高亮候选投影），候选自己只接触屏；两个按钮在焦点落到自己身上时由 Enter / Space 按住投影。Collection Item（overlay
语境）与 Action Control（field-inset 档）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增
`combobox.kbd.press`。三端公开 props 与事件不变。
