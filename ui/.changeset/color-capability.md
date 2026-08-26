---
"@xihan-ui/tokens": minor
---

颜色能力收成一处：亮度、对比度、择色、混色与深浅，从 `@xihan-ui/tokens` 导出。

这套数学此前在四个地方各写了一份：`runtime/brand.ts` 的私有换算、令牌层的对比度用例、语气对比度门禁，以及消费方自己的主题钩子。四份互不知道对方存在，判据也就各走各的——消费方那份把「白字还是深字」的交叉点写成了相对亮度 0.55，而正确的交叉点是 0.179，等于恒选白字。

新增 `runtime/color.ts`，`brand.ts` 改成建在它之上（`deriveBrandScale` 的产出逐值不变）：

- `relativeLuminance` / `contrastRatio` / `meetsContrast` / `CONTRAST_MIN`
- `pickOnColor`：压在某个底色上读得清的那一档。判据是 WCAG 相对亮度而不是 OKLCH 的 L——后者不含通道权重，同一个 L 上黄与蓝的实际亮度差得很远，按 L 分派会挑错边
- `pickAwayColor`：交互态该往哪一侧挪，恒取前景的反面
- `ON_COLOR_CROSSOVER`：白字与黑字对比度相等的那一点，`√0.0525 − 0.05 ≈ 0.179`，解析解
- `mixColors`：与 CSS 的 `color-mix(in oklab, …)` 同一条路（在 oklab 里插值，不走 oklch 的极坐标）
- `lighten` / `darken` / `withAlpha`
- 换算与色域那几样一并转正：`parseColorToOklch`、`formatOklch`、`clampChroma`、`inSrgbGamut` 等

CSS 那侧做不成同样的共享槽：相对颜色语法的 `r` / `g` / `b` 只在色函数被解析时存在，而自定义属性是之后才替换的——把配方放进槽再 `var()` 进通道位，两种形态都实测失败（整条无效，六族退化成同一个颜色）。所以配方仍写在使用处（`tone.css`），由 `check-tone-contrast` 逐字对账它的形态，`check-css-floor` 管住「必须包 @supports」，令牌包的 `color.spec.ts` 再把那条配方里的交叉点与通道权重读出来与本模块对账——三道合起来保证两边算的是同一件事。
