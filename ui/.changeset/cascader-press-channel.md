---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Cascader 列内条目、检索候选与清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
同一副按压面。** 机器 context 新增 `pressedPart`（`item` / `search-item` / `clear-trigger`）与 `pressedValue`（条目
value 或候选整条路径的键，清空按钮记 null），根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part,
value? }` 两个状态都认；守卫 `canPress` 在禁用、只读或加载时三者都不进，条目或候选自身禁用时不进，清空按钮没有值可清
时不进；`endPress` 只松开 part + value 对应的那一个，open 态 exit 时随浮层收起一并松开，按住途中转入禁用 / 只读 /
加载或值被清空时由机器自行松开。列内条目自己接键盘与触屏；检索视图里焦点恒在检索框，候选的键盘按压由检索框代发
（Enter 按住时高亮候选投影），候选自己只接触屏。trigger 与 control 是字段外壳，不接。Collection Item（overlay 语境）
与 Action Control（field-inset 档）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增
`cascader.kbd.press` 与 `cascader.kbd.search.press`。三端公开 props 与事件不变。
