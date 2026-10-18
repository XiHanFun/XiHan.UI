---
'@xihan-ui/tokens': minor
---

令牌新增预设品牌：几档有名字的品牌，清单是 `BRAND_PRESETS`（如 `blue`、`green`、`orange`、`pink`），类型是 `BrandPreset`。

- 每档在 `tokens.css` 里是一个 `[data-brand='<id>']` 取值块，只换品牌原语，不必 `registerBrand`：`setPreference({ brand: brandId('green') })` 即可。`registerBrand` 注入的同名取值块压过预设。
- 各档取基础色板里同名的色相，每一级按缺省品牌那一级的 WCAG 相对亮度派生，彩度取基线彩度、收进 sRGB 色域。品牌参与的对比度（实心底上的字、品牌字色、品牌淡底与上面的字、聚焦环）与缺省品牌同样达标；浅色、深色与两档高对比由语气对比度门禁与令牌单测逐档核对。
- `data-brand` 要与 `data-theme` 写在同一个元素上才换得动品牌（可视环境控制器的根就是这样），主题指南写明了这一点。
