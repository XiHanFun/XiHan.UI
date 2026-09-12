---
'@xihan-ui/tokens': major
---

颜色运行时完整保留十六进制、RGB、HSL 与 OKLCH 的透明度，并新增 `compositeColors` 计算 CSS sRGB source-over 合成。

`Oklch` 新增必填的 `a` 通道；`formatOklch`、混色、提亮和压暗不再丢失透明度。`relativeLuminance` 与 `contrastRatio` 遇到半透明背景时要求显式提供最终不透明底色，避免玻璃表面的对比度假通过；`contrastRatio` 参数语义明确为前景、背景和可选最终底色。透明品牌种子不再被静默当作实体品牌色。

`PickColorOptions` 增加 `backdrop`；`pickOnColor` 与 `pickAwayColor` 会在透明背景合成后比较两个候选的真实对比度，不再套用只对黑白候选成立的固定交叉点。
