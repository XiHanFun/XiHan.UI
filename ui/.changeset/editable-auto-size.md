---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

**破坏性** Editable 的「输入框宽度跟着内容走」从 `autoResize` 改叫 `autoSize`，与 TextField、ExpressionInput 同一个词；投影到输入框上的 `data-auto-resize` 随之改成同名的 `data-auto-size`。

| 旧名 | 新名 |
| --- | --- |
| `autoResize`（WC attribute `auto-resize`） | `autoSize`（WC attribute `auto-size`） |
| 自写样式里的 `[data-scope='editable'][data-auto-resize]` | `[data-scope='editable'][data-auto-size]` |
