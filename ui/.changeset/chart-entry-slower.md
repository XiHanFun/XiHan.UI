---
'@xihan-ui/tokens': minor
'@xihan-ui/motion': patch
'@xihan-ui/headless': patch
---

图表入场放慢：`--xh-motion-duration-reveal` 由 640ms 调到 960ms，柱长出、扇区扫开与漏斗、雷达、桑基、关系、层级图的入场曲线由 `enter-strong` 换成平缓的 `enter`。原来的强减速把位移压在头一两百毫秒，一张图一闪就画完；现在位移摊在整段里，看得清标记是长出来的。折线描出仍取 `continuous`，数据更新（`morph`，400ms）不变。数值动画不写 `easing` 时首次滚动与图表里的数字同一口径，一起换成 `enter`。
