---
'@xihan-ui/styles': patch
---

**修复** 浮动面板（FloatingPanel）头部的横向内衬是 12px，正文是 16px，标题的左缘比正文靠外 4px。头部改取与正文同一支 `--xh-surface-px-sm`（16px，紧凑 12px），两条起始线对齐，与 Dialog、Drawer、Card 三段同一内衬的做法一致。要保留原先的 12px，设 `--xh-floating-panel-header-px`。
