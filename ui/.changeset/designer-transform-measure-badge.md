---
'@xihan-ui/designer-shell': major
---

变换覆盖层 `<xh-designer-transform>` 的尺寸标签改为尺寸徽标：新增 `measure`（`gesture` 只在拖动、缩放中只读显示，`selection` 选中即常驻）与 `measureOptions`（模型单位、显示单位、单位文字、小数位与步长），单选能缩放时宽高各一个数字框，加减钮、方向键、输入后确认都派发 `measure-change { id, rect, axis, source }`，由设计器改模型；新增 `focusMeasure()`、文案桶 `xh-designer-transform`。上下文工具条翻到下方时排在徽标下面。

升级须知：去掉了 `formatMeasure`。原来用它写「宽 × 高 单位」的，改为给 `measureOptions`（如 `{ unit: 'mm' }`），文字由覆盖层按 locale 与 `xh-designer-transform` 的 `measureText` 写出。
