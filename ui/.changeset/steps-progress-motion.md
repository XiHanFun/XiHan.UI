---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

Steps 推进时三个通道一起走：连接线沿行向从这一步填到下一步（rtl 翻转、回退时反向收回），标题换色淡变，走过那一步的对号淡入；首帧就走过的步（序号圆点投影 `data-instant`）直接呈现。
