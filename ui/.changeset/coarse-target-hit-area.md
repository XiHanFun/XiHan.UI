---
"@xihan-ui/styles": minor
---

**新增** 九个独立触控目标在粗指针下的命中区外扩：`button` 本体、`clipboard` 的复制钮、`download-trigger` 本体、`pagination` 的页码格与前后翻页钮、`tabs` 的标签、`toggle-group` 的条目、`toggle` 本体。此前这些部件登记为「手指直接落上去」的目标，皮肤里却没有 `@media (pointer: coarse)` 块，触屏下命中区就是视觉盒本身——最矮的 sm 档只有 28px。

外扩一律走绝对定位的伪元素 `inset-block: -8px`，视觉盒与布局占位一寸不动：这些部件多数排在整行控件里（最高 40px），直接加高盒子会把同一行的控件顶得高低不齐，标签带还会连着基线与滑条一起被顶下去。只扩块轴、不扩行内轴：页码格之间只隔一格间距、切换组条目靠负外边距共边相接、标签在行内轴上首尾相接，往两侧扩会与相邻目标的命中区叠上。实测 28px 档到 44px、32px 档到 48px。

伪元素挑当前空着的那一颗，不覆盖已被占用的：`tabs` 用 `::before`（`::after` 是换位时的落点线），`clipboard`、`pagination`、`button`、`toggle`、`toggle-group` 用 `::after`，`download-trigger` 按取数在途与否在两颗之间轮换（在途时 `::before` 是那枚圆环、此外 `::after` 是兜底字形）。

`carousel` 的指示点仍留在待做名单里：圆点直径 8px、点间距 4px，外扩到 44 要每侧 18px，相邻两点的命中区会大幅叠上；只扩块轴则得到 8×44 的一条竖带，行内那一边仍是 8px。
