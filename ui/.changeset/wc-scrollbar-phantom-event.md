---
'@xihan-ui/web-components': patch
---

**修复** `<xh-scrollbar>` 的自定义元素清单里多出一个叫 `name` 的事件：它从不派发，是清单分析器把派发辅助函数的形参名当成了事件名，编辑器的事件补全里因此多一条假的。现在清单只列 `scroll-start`、`scroll-end`、`drag-start`、`drag-end` 四个，元素的行为没有变化。
