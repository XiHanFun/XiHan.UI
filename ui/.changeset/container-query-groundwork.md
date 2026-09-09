---
"@xihan-ui/styles": patch
---

**容器查询的前置就位（还没有任何组件用它）。**

`check-breakpoints` 此前只扫 `@media` 的 `min/max-width` 冒号写法。一旦有人写 `@container xxx (min-width: …)`，那些宽度字面量**一条都扫不到**，四档断点令牌立刻形同虚设。现在两种查询都扫，冒号写法与区间写法（`(width >= 768px)`、`(768px <= inline-size < 1024px)`）全收；顺带补了原正则的一个洞——同一条前奏里有多个宽度条件时，老写法只查第一个。

新门禁 `check-container-scope`：只有登记在册的部件才许写 `container-type`，两侧反查。判据是「这个根是不是库自己渲的、宽度由外面给的**块级**根」——收缩包裹的根加上 `container-type` 会当场塌宽。

**一处实测推翻了此前的判断。** 此前认为 `container-type: inline-size` 会施加 layout containment、让元素成为其 `absolute` 后代的包含块（`navigation-menu` 的 content 面板首当其冲）。在 Chromium 151 上带对照组量过：同一个根写 `contain: layout` 时 absolute 与 fixed 探针从 (0,0) 跳到 (24,40)，写 `container-type: inline-size` 或 `size` 时两枚探针纹丝不动、`getComputedStyle(root).contain` 恒为 `none`。六个候选 × 5 种外层 × 三档共 63 条恒等断言全绿。

**真正会咬人的是另一条**：`container-type` 施加行内轴的尺寸限制，**收缩包裹的盒宽度当场归零**——把这六个根放进「没写 flex-basis 的 flex 项」或 `inline-block` 父里，实测宽度 169→0、181→0、192→0，高度同时炸开。库内自己的布局（块级父 / `flex: 1` / grid `1fr`）三种都无变化，但使用者今天完全可以把这些组件塞进一个 flex 工具条里。这条静态门禁看不见使用者的外层，只能写死在登记表判据与报错文案里。

登记表六条初始成员全带 `pending`（皮肤里还没写换档）。真正落地时逐条删 `pending`，删晚了同样判红。
