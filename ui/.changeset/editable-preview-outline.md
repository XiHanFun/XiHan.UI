---
'@xihan-ui/headless': major
---

就地编辑的预览态不再恒为无壳：control 在预览态与编辑态都取 root 的形态（缺省 `outline`），与别的字段同一副外壳，一眼看得出这是个能改的字段。要沿用「读起来像一段文字、悬停才浮出描边」的观感，显式写 `variant="ghost"`。
