---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增颜色解析、换算、度量与色板校验。

- `parseColor`：十六进制、`rgb()`、`hsl()`、`oklab()`、`oklch()`，逗号与空格写法都认；越界按 CSS 规则钳制，无法解析返回 `null`，不认颜色关键字。
- 换算：`toOklab`、`toOklch`、`fromOklch`、`fromOklab`、`formatHex`。OKLab 矩阵与令牌运行时同一组；超出 sRGB 色域时固定明度与色相、降低彩度收回，色相不漂移。
- 度量：`relativeLuminance`、`contrastRatio`（WCAG 2.x，半透明前景先叠到背景上）、`deltaEOk`（OKLab 欧氏距离 × 100）、`simulateCvd`（Machado–Oliveira–Fernandes 2009，红 / 绿 / 蓝色弱，严重度 0–1）。
- `validateCategoricalPalette`：分类色板的六项检查——两套色板同一色槽的色相一致、明度带（亮色 0.43–0.77，暗色 0.48–0.67）、彩度 ≥ 0.10、红绿色弱模拟下 ΔE ≥ 8（6–8 需非颜色通道补偿）、正常视觉 ΔE ≥ 15、标记对承载面 ≥ 3:1（不足需标签或数据表补偿）；相邻检查或前 3 个色槽全部两两检查。
- `validateOrdinalRamp`：有序色阶单色相、明度严格单调、对比度最低的一档对承载面 ≥ 2:1。
