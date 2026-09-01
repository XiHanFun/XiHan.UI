---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": patch
---

**新增**连续缓动令牌 `--xh-motion-ease-continuous`（原语 `--xh-ease-standard` = `cubic-bezier(0.2, 0, 0, 1)`）。此前语义层只有 `-enter` / `-enter-strong` / `-exit` 三档，描述的都是元素与视口的进出关系；循环动画没有起终点，被推到新位置的元素起终点又都在屏内，两类都不属于进出，于是只能下探到原语。这一档说的是「两端都在屏内」这层关系：起步就带速度，收尾再减速。

`segmented` 的滑块位置过渡与 `table` / `skeleton` / `progress` 的循环动画共 7 处，从直引 `--xh-ease-standard` 改走这一档。取值同源，视觉零改动。

JS 侧不动：`@xihan-ui/motion` 的 `easing.standard` 就是同一条原语，两边由门禁对账。
