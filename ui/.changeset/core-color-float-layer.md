---
'@xihan-ui/core': minor
'@xihan-ui/tokens': major
'@xihan-ui/headless': patch
---

`@xihan-ui/core/color` 新增不取整的浮点层：`colorSrgbToLinear`、`colorLinearToSrgb`、`colorLinearRgbToOklch`、`colorOklchToLinearRgb` 在 sRGB 编码、线性光与 OKLCH 之间换算，不取整到 8 位、不截断；`colorParseOklch` 把颜色串解析成 OKLCH，写法与越界规则同 `colorParse`，解析不了返回 `null`；`colorInSrgbGamut` 与 `colorClampChroma` 固定明度与色相、只收彩度，把颜色收进 sRGB 色域；`colorFormatOklch` 写出收过彩度的 `oklch()` 串。8 位那一层（`colorParse`、`colorRgbaToOklch`、`colorOklchToRgba` 等）改为建在浮点层上，结果不变，超出色域照旧按通道裁剪。

`colorParse` 与 `colorParseOklch` 按 CSS Color 4 的语法认写法：rgb、hsl 的旧式写法分隔符全是逗号，rgb 三路同为数或同为百分数，hsl 的饱和度与明度写百分数；新式写法分量之间用空白、透明度写在 `/` 后面，数与百分数可混用，分量可写 `none`；oklch、oklab、color() 只有新式写法；色相写数或 `deg`、`grad`、`rad`、`turn`；十六进制要带 `#`。浏览器不认的写法返回 `null`，此前 `colorParse` 认下的分隔符混写（`rgb(1, 2 3)`）、逗号写法里数与百分数混用（`rgb(50%, 0, 0)`）、不带 `#` 的十六进制、色相写百分数、分量带别的单位与 `0x` 写法都不再认；取色器、颜色字段与颜色滑块收到这类写法照旧当作解析不出，保留草稿。颜色字段（`colorFieldNormalize`）的输入框仍认不带 `#` 的十六进制（`f00`、`ff0000`）。

`@xihan-ui/tokens` 的颜色换算改用 core 这一份，删掉自带的那套，根入口与 `./runtime` 不再导出下表左列的名字：

| 4.x（`@xihan-ui/tokens`） | 5.0（`@xihan-ui/core/color`） |
| --- | --- |
| `srgbToLinear` | `colorSrgbToLinear` |
| `linearToSrgb` | `colorLinearToSrgb` |
| `linearRgbToOklch` | `colorLinearRgbToOklch` |
| `oklchToLinearRgb` | `colorOklchToLinearRgb` |
| `parseColorToOklch` | `colorParseOklch` |
| `inSrgbGamut` | `colorInSrgbGamut` |
| `clampChroma` | `colorClampChroma` |
| `formatOklch` | `colorFormatOklch` |
| `Oklch`（类型） | `ColorOklch`（字段相同） |

随之变化的行为：

- `colorParseOklch` 解析不了时返回 `null`，原 `parseColorToOklch` 是抛错。
- 分量越界的写法（如 `oklch(120% 0.1 30)`、`rgb(300 0 0)`、透明度小于 0 或大于 1）不再夹回范围：`colorParseOklch` 返回 `null`，令牌里其余颜色函数（`contrastRatio`、`relativeLuminance`、`mixColors`、`deriveBrandScale` 等）抛错。
- 无彩色（白、灰、黑）的色相取 0，不再是一个无意义的角度：白色写出 `oklch(1 0 0)`，原先是 `oklch(1 0 89.88)`，颜色本身不变。`colorLinearRgbToOklch` 的明度夹进 0–1，并多一个可选参数 `hueHint`。
- 写法按 CSS Color 4 校验（见上文），多认 `oklab()`、`color(srgb …)` / `color(srgb-linear …)`、新式写法里的 `none` 与新式 hsl 里写数的饱和度、明度；浏览器不认的写法照旧抛错。

迁移：把上表左列的导入改成从 `@xihan-ui/core/color` 引入右列；用到 `parseColorToOklch` 抛错的，改为判断 `colorParseOklch` 的返回值是否为 `null`。令牌的合成、亮度、对比度、择色、混色与深浅函数（`compositeColors`、`relativeLuminance`、`contrastRatio`、`meetsContrast`、`pickOnColor`、`pickAwayColor`、`mixColors`、`lighten`、`darken`、`withAlpha`、`CONTRAST_MIN`、`ON_COLOR_CROSSOVER`）照旧从 `@xihan-ui/tokens` 引入。
