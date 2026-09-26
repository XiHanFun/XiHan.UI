---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Carousel 拖拽松手改由弹簧接住松手速度：落点按速度投影 0.2s，轻甩也能翻页，往回甩到起点另一侧则收回原页；翻页后轨道从松手位置带着速度落到目标页，期间投影 `data-animating`、样式层让开过渡。不循环时首末页往外拖越拉越沉（60px 橡皮筋），松手硬弹簧弹回；落定途中再按下从此刻的位置接着拖。

修正纵向轮播拖拽按 clientX 取坐标；指针被系统收走时不再翻页，弹回原页。状态机新增上下文 `dragBase`、`settleOffset`、`settling` 与 refs `settle`，`DRAG.END` 带 `velocity` 与 `canceled`。
