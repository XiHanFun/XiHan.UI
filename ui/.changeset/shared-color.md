---
'@xihan-ui/headless': minor
---

颜色换算纯函数从 `color-picker` 迁到共享的 `shared/color`，并改用 `color*` 前缀，供即将到来的颜色色块 / 颜色滑块 / 颜色字段 / 色块选择器与取色器共用：`colorParse`、`colorToString`、`colorCss`、`colorHueCss`、`colorSameColor`、`colorSameRgba`、`colorHexToRgba`、`colorRgbaToHex`、`colorRgbaToHsva`、`colorHsvaToRgba`、`colorRgbaToHsla`、`colorHslaToRgba`、`colorNormalizeRgba`、`colorNormalizeHsva`、`colorResolveFormat`、`colorResolveHsva`、`colorToRgba`、`COLOR_FALLBACK`，类型 `ColorFormat`、`ColorRgba`、`ColorHsva`、`ColorHsla`、`ColorAnchor`、`ColorChannelRange`。原 `colorPicker*` / `ColorPicker*` 同名导出不再保留（它们属于版本政策里不受约束的内部算子与伴生类型）。

通道模型扩到七路：新增 `ColorChannel`（`hue` / `saturation` / `brightness` / `alpha` / `red` / `green` / `blue`）、`COLOR_CHANNELS`、`colorToChannel`、`colorChannelRange`、`colorChannelValue`、`colorWithChannel`；取色器自己那两路（`ColorPickerChannel`）与数值框那几路（`ColorPickerInputChannel`）留在 `color-picker` 里。
