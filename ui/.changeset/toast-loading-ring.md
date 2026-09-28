---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

新增加载环家族配方 `@xihan-ui/styles/loading-ring.css`：连接层在承载者上投影 `data-xh-loading-ring`，配方把它的 `::before` 画成与 Spinner 环档同一副加载环（一整圈 `--xh-border-default` 轨道、起始边取私有槽 `--xh-_loading-ring-fg`，缺省 `currentColor`），随同一部件上的 `data-loading` 淡入淡出、转与停；减弱动效与打印下停成点线环，强制色下轨道 `CanvasText`、起始边 `Highlight`。伪元素的有无与尺寸仍由皮肤给。

Toast 接上这份配方：
- 加载中不再转箭头字形，改画加载环，起始边取语气色（`--xh-toast-icon-fg`）。root 与 indicator 新增 `data-xh-loading-ring`。
- 行首那一格叠两层：`::before` 是环，`::after` 是语气字形。加载落定时环停在当前角度淡出、语气字形淡入，同一格里交叉淡变（此前瞬换）；减弱动效下淡变照常。
- indicator 的兜底字形按根上的 `data-tone` 换（此前按 indicator 自身的 `data-tone` 换，连接层不在 indicator 上发语气，四档都画成信息字形）。
