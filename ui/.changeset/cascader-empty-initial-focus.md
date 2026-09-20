---
"@xihan-ui/headless": patch
---

**修复** `cascader` 集合为空（首次取数、无数据）时展开的初始焦点。此前焦点域先去落根列，而皮肤在空态下把根列 `display:none` 让位给占位面，浏览器不让它接住 `focus()`，焦点要等焦点域逐帧重试到最后一帧才兜底落到 content 上。现在与连接层「集合为空时由 content 兜底进 Tab 序列」同一口径，初始焦点直接落到 content。
