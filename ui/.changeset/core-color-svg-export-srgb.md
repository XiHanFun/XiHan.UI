---
'@xihan-ui/core': minor
'@xihan-ui/headless': major
---

新增子入口 `@xihan-ui/core/color`：颜色换算的纯函数从 headless 挪到 core，`colorParse`、`colorToString`、`colorCss`、`colorSameColor`、`colorSameRgba`、`colorHexToRgba`、`colorRgbaToHex`、`colorRgbaToHsva`、`colorHsvaToRgba`、`colorRgbaToHsla`、`colorHslaToRgba`、`colorRgbaToOklch`、`colorOklchToRgba`、`colorNormalizeRgba`、`colorNormalizeHsva` 与类型 `ColorFormat`、`ColorRgba`、`ColorHsva`、`ColorHsla`、`ColorOklch` 改从这里导入，headless 不再导出它们。`colorParse` 另外认 `oklab()`、`color(srgb …)` 与 `color(srgb-linear …)`，分量写 `none` 时取 0；超出 sRGB 色域的颜色照旧按通道裁剪。取色器专用的通道、工作色与兜底色（`COLOR_CHANNELS`、`colorChannelRange`、`colorResolveHsva`、`colorHueCss`、`COLOR_FALLBACK` 等）留在 headless。

`standaloneSvg` 导出的 SVG：会继承的表现属性与父元素的值相同时不再逐个重复，交给继承（与父元素不同时照写，哪怕等于初始值）；`fill` 与 `stroke` 的颜色换成 sRGB 的 `#rrggbb`，颜色自带的透明度乘进 `fill-opacity` / `stroke-opacity`，办公软件与矢量编辑器也能打开；认不出的颜色写法原样保留。

迁移：从 `@xihan-ui/headless` 导入上面那些颜色函数与类型的，改为从 `@xihan-ui/core/color` 导入，函数名与行为不变。
