---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Splitter 面板折叠 / 展开（Enter、命令式）改为沿过渡让出空间，与 Layout 侧栏折叠同一种节奏：折叠途中根投影 `data-animating`，面板上浏览器实际起播的 `flex-basis` 过渡播完即撤下。拖拽、方向键步进与整份赋值跟手、不带过渡，并当场打断正在播的折叠。
