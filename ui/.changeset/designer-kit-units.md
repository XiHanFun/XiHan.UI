---
'@xihan-ui/designer-kit': minor
---

`@xihan-ui/designer-kit` 新增长度单位换算与纸张预设：

- `convertLength(value, from, to, { dpi? })`：在 `mm`、`cm`、`in`、`pt`、`px` 之间换算，像素缺省按 96 dpi（CSS 像素）；毫米、厘米、英寸与磅之间的换算没有浮点零头。`dpi` 不是正的有限数或单位不认识时抛 `RangeError`。
- `LengthUnit` 与 `LENGTH_UNITS`，常量 `MM_PER_INCH`、`PT_PER_INCH`、`CSS_PX_PER_INCH`。
- `PAPER_PRESETS`：A3–A6、B4、B5（ISO 216）与 Letter、Legal 的纵向毫米尺寸；`PAPER_PRESET_NAMES` 与 `isPaperPresetName`。
