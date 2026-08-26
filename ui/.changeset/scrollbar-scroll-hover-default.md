---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

滚动条新增 `scroll-hover` 档，并把它定为缺省档。

**新增 `'scroll-hover'`**：滚动时露出，指针进入滚动容器或滚动条时也露出；指针占着容器时滚动只重画滑块、不起收起倒计时，指针离开或停手满 `hideDelay` 才收起。它是 `hover` 与 `scroll` 两档显形条件的并集，与那两档一样浮在内容之上——`data-lane-*` 的判据只认 `auto` / `always`，视口宽度一点不减（横条同理不占高度）。

**缺省档由 `'hover'` 改为 `'scroll-hover'`**：`scrollbar` 与 `scroll-area` 不写 `type` 时都走新档。显形集合是原缺省档的严格超集，没有一条本来看得见的滚动条会消失；占道与否、触屏交给原生滚动那一路都不变。

**需要跟着改的代码**：对 `ScrollbarType` 做穷尽 `switch` / 映射表的地方要补 `'scroll-hover'` 分支；读 `ScrollbarApi.type` 或 `data-type` 并按值分派的代码会收到这个新值。

状态机的两个判据改了名：`isHoverType` → `showsOnHover`、`isScrollType` → `showsOnScroll`（原名在新档下会读成谎话）。判据名只在机器内部与文档的「状态机」小节露面，不进公开 API。

日志的视口那条 `scrollbar-gutter` 收窄到「还在用原生条」的情形：带 `data-xh-scrollbar` 的容器原生条已被藏成零宽，空道对它没有布局作用。没挂自绘条时空道照留，原生滚动条出现与消失仍不推动文字。
