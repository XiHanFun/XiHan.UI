---
'@xihan-ui/styles': patch
---

**修复** Command 的面板圆角从浮层档（8px）改取 sheet 档（10px），与 Dialog 同一把尺：它带遮罩、宽度与 Dialog 同一组令牌，是一张模态面。Tour 的气泡贴着锚点，圆角仍留在浮层档。`--xh-command-radius` 照旧可改。
