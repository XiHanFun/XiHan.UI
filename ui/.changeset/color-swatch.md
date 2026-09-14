---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** `color-swatch` 组件（颜色色块）与 Swatch 色块面家族配方。

- 色块把一个颜色画成一小块给人看，不接交互：认 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`，解析不出时只画棋盘格底并带 `data-invalid`；`label` 给读屏一个有含义的名字，不给就念颜色串，两者都没有时整块视为装饰。
- 家族配方 `@xihan-ui/styles/swatch.css`（`recipes/swatch.recipe.json` 生成）：棋盘格底、颜色填充层、描边与 sm / md / lg 尺寸档只有这一份真源，消费者投影 `data-xh-swatch` / `data-xh-swatch-size` 并经私有槽 `--xh-_swatch-color` 写入颜色；高对比模式退出强制着色保住原色，打印保留底色。色块选择器、颜色字段与取色器里的当前色块随后都改吃它。
- Vue `XhColorSwatch`；React 同名组件；自定义元素 `<xh-color-swatch>`（`value` / `size` / `label` 三个 attribute）；皮肤 `@xihan-ui/styles/color-swatch.css`，覆盖槽前缀 `--xh-color-swatch-*`。
