---
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
---

FloatingPanel 进出最大化补上几何过渡：位置与尺寸按指示档（`--xh-motion-duration-move` + `continuous`）补过去，圆角同步收放，描边与投影淡去（此前位置尺寸瞬切，只有投影淡变，圆角与描边硬切）。只在这一段挂过渡：定位层投影 `data-animating`，过渡播完即撤，拖动与改尺寸照旧跟手；减弱动效下即刻到位；最小化与常规之间不补间。

- 机器新增 context `windowAnimating` / `settledWindowState` 与事件 `WINDOW_STATE.SETTLED`。
- 最大化时描边改为只撤颜色（`border-color: transparent`）、不撤宽度，进出时盒子不跳一像素。
- 定位层的 `left` / `top` / `width` / `height` 过渡登记为布局动画例外。
