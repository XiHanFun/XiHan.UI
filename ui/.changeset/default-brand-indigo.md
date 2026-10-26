---
'@xihan-ui/tokens': major
'@xihan-ui/designer-shell': minor
---

**调整** 缺省品牌色从 OKLCH 色相 258 的蓝换成色相 277 的靛蓝：`--xh-color-brand-50 … 950` 每一档都换了值，主按钮、选中、焦点环、品牌字色与图表的主题单色方案随之变色。各档明度按原缺省品牌那一档的 WCAG 相对亮度反求（与 `data-brand` 预设同一做法），对比度与原来逐档相当，600 档实心底上的白字是 5.08:1。要保留原来的蓝，在主题根上写 `data-brand="indigo"`。

**新增** 预设品牌 `indigo`（色相 258，即原缺省品牌）：`BRAND_PRESETS` 与 `BRAND_PRESET_COLORS` 多了这一项，设计器设置里的主题色色板随之多一格「靛蓝」，十种语言都已提供名字（`brandIndigo`）。
