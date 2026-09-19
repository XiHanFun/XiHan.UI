---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Editable 编辑 / 提交 / 撤销三颗按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
按压面。** 机器 context 新增 `pressed`（按 part 键记住正被按住的那颗，新增导出类型 `EditablePressedPart`），事件
`PRESS.START` / `PRESS.END`：预览态只认编辑按钮（禁用 / 只读时不进），编辑态只认提交 / 撤销按钮；进出编辑态时由机器
自行松开（Enter 在 keydown 即激活，随后按钮藏起不再有 keyup），按住编辑按钮途中转入禁用 / 只读同样自行松开。
提交 / 撤销按钮的 pointerdown 仍把焦点摁在输入框里。键盘表新增 `editable.kbd.press`。三端公开 props 与事件不变。
