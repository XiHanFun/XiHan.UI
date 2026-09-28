---
'@xihan-ui/styles': patch
---

Popover 面板的缩放原点在交叉轴上按 placement 的对齐取：`*-start` / `*-end` 从与锚点齐平的那一端涨开（上下两侧 RTL 下起始缘在右），居中对齐仍从中线（此前交叉轴恒为 50%，`bottom-start` 贴着小触发器时面板从自己的中线缩放，而不是从触发器）。皮肤体积基线随之上调。
