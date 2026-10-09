---
'@xihan-ui/styles': patch
---

Carousel 分页点不再 `overflow: hidden` 裁切自己：细指针下 `::after` 外扩的 24px 命中区此前被一并裁掉，只点得到 6px 的点。自动播放的进度条改为自己带圆角、以 `clip-path: inset(… round …)` 从行尾裁着长满（rtl 从右往左、纵轨从上往下），不再靠缩放与点的盒子来裁。
