---
"@xihan-ui/styles": patch
---

**断点扫描面补齐，外加一道「不许再写 `container-type`」的门禁。**

`check-breakpoints` 此前只扫 `@media` 的 `min/max-width` 冒号写法。现在 `@media` 与 `@container` 两种查询都扫，冒号写法与区间写法（`(width >= 768px)`、`(768px <= inline-size < 1024px)`）全收；顺带补了原正则的一个洞——同一条前奏里有多个宽度条件时，老写法只查第一个。

新门禁 `check-container-scope`：只有登记在册的部件才许写 `container-type`，两侧反查。登记表现在是空的——库里一处 `container-type` 都没有，全部换档走视口断点，所以这道门禁此刻守的是「谁都不许再写 `container-type`」：皮肤里凡出现一处就没有对应登记，立刻判红。要重新启用某个落点，先在登记表里补一条写清判据。

判据本身连同两处实测结论留在登记表与门禁的注释里：

- `container-type: inline-size` **不会**让元素成为其 `absolute` 后代的包含块。在 Chromium 151 上带对照组量过：同一个根写 `contain: layout` 时 absolute 与 fixed 探针从 (0,0) 跳到 (24,40)，写 `container-type: inline-size` 或 `size` 时两枚探针纹丝不动、`getComputedStyle(root).contain` 恒为 `none`。
- 真正会咬人的是行内轴的尺寸限制：**收缩包裹的盒宽度当场归零**——把这样的根放进「没写 `flex-basis` 的 flex 项」或 `inline-block` 父里，实测宽度 169→0、181→0、192→0，高度同时炸开。静态门禁看不见使用者的外层，只能写死在登记表判据与报错文案里。
