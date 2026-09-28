---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

ColorPicker、ColorField 与 ColorSlider 的值串新增 `oklch` 写法（`format="oklch"`）。

- 输出形如 `oklch(62.8% 0.2577 29.23)`，半透明时带 `/ a`；明度两位百分数、彩度四位、色相两位，8 位 sRGB 往返不丢一档。
- 三个组件都能解析 `oklch()`：明度写百分数或 0-1 的数，彩度写数或百分数（100% 即 0.4），色相写角度，透明度跟在斜杠后面；只认空白分隔。工作色在 sRGB 内，超出 sRGB 的值按通道夹回。
- 不收 HSB 作值串格式：它不是 CSS 颜色写法，写进样式或表单都会静默失效；需要 HSB 数值时读取色器的 `hsva`。此前把 `oklch` 当作未知格式报 `format` 错误的写法现在改为正常工作。
- headless 导出 `colorRgbaToOklch`、`colorOklchToRgba` 与类型 `ColorOklch`；`ColorFormat` 新增 `'oklch'`。
