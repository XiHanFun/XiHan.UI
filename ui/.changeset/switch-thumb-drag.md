---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Switch 的滑块可以拖：按住横向移动过 3px 即接管，滑块跟手，拖出两端越拉越沉（24px 橡皮筋）；松手按落点投影 0.06s，过中点即切换，滑块由弹簧带着松手速度落到那一端，期间投影 `data-dragging` / `data-animating`。纵向为主的划动留给页面滚动（轨道 `touch-action: pan-y`），不拖的点按照常切换，拖完浏览器补派的那次点击不会再切一次；RTL 下往左拖是打开。
