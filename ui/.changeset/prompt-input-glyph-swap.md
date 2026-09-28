---
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
---

PromptInput 发送钮在发送与停止两种身份间切换时，兜底字形不再瞬换：换上来的那一枚淡入（停止的方块从略小处浮出 `xh-pop-in`，发送的箭头 `xh-fade-in`），与按钮换面同一拍；首帧就在的字形直接呈现，减弱动效下只剩淡入。按钮新增 `data-instant`（身份换过之前投影），机器新增 context `modeChanged`。粗指针下按钮的 `::after` 是家族命中区，字形只有 `::before` 一层，旧字形随身份切换当即换下。
