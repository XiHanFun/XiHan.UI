---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**CheckboxGroup 条目与全选格接入按压通道：Space 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行换面、方框随行换底）。**
机器 context 新增 `pressedPart`（`item` / `select-all-trigger`，类型 `CheckboxGroupPressedPart`）与 `pressedValue`（按住的条目
value，全选格为 null），事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }`；守卫 `canPress` 在整组禁用、
只读或条目自身禁用时不进；`endPress` 只松开 part + value 对应的那一个；按住途中整组转入禁用或只读时由机器自行松开。
`role=checkbox` 只有 Space 是激活键，Enter 不进按压面；选中与按压互相独立，Space 在 keydown 那一刻照旧翻转。皮肤的按压选择器
已是 `:is(:active, [data-pressed])`（缩放归零，只换面）；键盘表新增 `checkbox-group.kbd.press`。三端公开 props 与事件不变。
