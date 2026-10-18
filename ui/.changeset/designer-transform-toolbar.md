---
'@xihan-ui/designer-shell': minor
---

变换覆盖层 `<xh-designer-transform>` 新增上下文工具条：写 `slot="toolbar"` 的子节点浮在选中框上方居中（有旋转柄时让开它，贴顶时翻到下方，左右夹在覆盖层里），有选中才显示，只读、手势进行中或没有内容时收起；新增 `focusToolbar()`，各款在画布的 Alt+F10 里调用，在工具条里按 Esc 焦点回到交之前的位置。覆盖层宿主不再整块 `aria-hidden`，改为画的框、线、控制柄与度量标签各自 `aria-hidden`，工具条可被读屏读到。
