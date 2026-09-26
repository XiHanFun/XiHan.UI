---
'@xihan-ui/styles': patch
---

Accordion、Collapsible、Reasoning、ToolCall 的展开内容不再挂 `will-change: grid-template-rows`：行高不可合成，提前声明换不来任何收益。
