---
'@xihan-ui/styles': patch
---

Tabs line 档页签接入 Collection Item 后，家族基础块的 `min-inline-size: 0` 让横排页签在 `flex: 1 1 0` 等分带宽排不下时被压到文字之下再横向顶出容器，标签带的 `flex-wrap` 永远等不到折行。页签皮肤收回 `min-inline-size: auto`，下限按文字算，排不下仍按原契约折行。
