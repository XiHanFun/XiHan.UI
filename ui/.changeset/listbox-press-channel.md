---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Listbox 条目与「取下一页」接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
按压面。** 机器 context 新增 `pressedPart`（`item` / `load-more-trigger`）与 `pressedValue`（条目 value，取下一页记
null），事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }`；守卫 `canPress` 在整列禁用时
两者都不进，条目在只读或自身禁用（部件声明或 collection）时不进，取下一页在取数在途中（`loading`）不进；
`endPress` 只松开 part + value 对应的那一个，按住途中转入禁用 / 只读 / 加载时由机器自行松开。item 与
load-more-trigger 的 getter 投影 `data-pressed`，Collection Item（page 语境）与 Action Control（row 档）家族配方的
按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `listbox.kbd.press`。三端公开 props 与事件不变。
