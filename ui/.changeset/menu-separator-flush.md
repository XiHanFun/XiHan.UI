---
'@xihan-ui/styles': patch
---

**修复** Menu、ContextMenu、Menubar 的分隔线与条目的面齐平，上下各留 2px。此前三份皮肤绕过了 Collection Item 配方，线的两端又各缩进 12px，比悬停面短出两截，读起来是一段装饰而不是分段。现在几何、颜色与强制色档都由配方画，三份皮肤只把 `--xh-<c>-separator-thickness / -my / -radius / -color` 桥到配方的 `--xh-collection-separator-*`，原有的槽照旧可写。
