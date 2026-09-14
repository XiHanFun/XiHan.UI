---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** `color-slider` 组件（颜色滑块）：一条只推颜色某一路的滑杆，值是整个颜色串。

- `channel` 七选一：`hue`（0-360）、`saturation` / `brightness` / `alpha`（0-100）、`red` / `green` / `blue`（0-255）；`format` 决定写法，`alpha` 决定串里带不带透明度（缺省时推透明度那一路带、其余不带）。
- 轨道渐变由连接层按当前颜色现算写成内联 `background-image`（其余分量不动，只让本通道从 min 走到 max），拇指填当下那一档的颜色；透明度那一路皮肤垫棋盘格。
- 拖动、键盘（方向键 / PageUp / PageDown / Home / End）、RTL 掉头与竖直排布整份取自内嵌的 `slider` 机器；`onValueChange` 拖动中连发，`onValueChangeEnd` 松手只发一次；灰度处色相靠锚保住。
- Vue `XhColorSlider*` 与 `useColorSlider`；React 同名组件与 hook；自定义元素 `<xh-color-slider>`（`value` / `default-value` / `channel` / `format` / `alpha` / `orientation` / `dir` / `size` / `name` 等 attribute，`translations` 只走 property）；皮肤 `@xihan-ui/styles/color-slider.css`，覆盖槽前缀 `--xh-color-slider-*`。
