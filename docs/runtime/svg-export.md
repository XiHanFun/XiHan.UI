# SVG 导出

`@xihan-ui/core/svg-export` 把页面上的 SVG 导出成文件：克隆成能单独打开的一份，序列化成文本，再按倍率与底色栅格化成 PNG。图表、流程图这类用 SVG 画的内容，导出图片都走这三步；产品只管把自己的场景画成一份 SVG。

只在浏览器里用：克隆要读计算样式，栅格化要用 `Image` 与 `canvas`。零第三方依赖。

```ts
import { rasterizeSvg, serializeSvg, standaloneSvg } from "@xihan-ui/core/svg-export";

const copy = standaloneSvg(chart.querySelector("svg")!, {
  include: element => element.getAttribute("data-part") !== "hit", // 只供命中的透明粗线不导出
});
const svgFile = new Blob([serializeSvg(copy)], { type: "image/svg+xml" });
const pngFile = await rasterizeSvg(copy, { scale: 2, background: "#ffffff" });
```

## 独立的 SVG

页面上的 SVG 靠样式表上色：颜色、线宽、字体来自皮肤与设计令牌，离开页面单独打开就全没了。`standaloneSvg(source, options?)` 逐个元素读计算样式，把一张白名单里的表现属性写成属性：

- `fill`、`stroke`、`stroke-width`、`stroke-dasharray`、`stroke-linecap`、`stroke-linejoin`；
- `opacity`、`fill-opacity`、`stroke-opacity`、`visibility`；
- `font-family`、`font-size`、`font-weight`、`font-style`、`text-anchor`、`dominant-baseline`。

令牌、`currentColor` 与继承来的值都换成算好的具体值，白名单以外的计算样式不抄。写哪些、不写哪些：

- 根上等于初始值的不写。会继承的属性（除 `opacity` 与 `dominant-baseline` 外都是）与父元素的值相同时不写，交给继承；与父元素不同时照写，哪怕等于初始值。一张图里成百上千个文字元素的字体、字号不再逐个重复。
- `fill` 与 `stroke` 的颜色一律换成 sRGB 的 `#rrggbb`，办公软件与矢量编辑器这类只认 sRGB 的工具也能打开。换算用 [`@xihan-ui/core/color`](/npm-package-dependency) 的 `colorParse`：认 `#hex`、`rgb()`、`hsl()`、`oklch()`、`oklab()` 与 `color(srgb …)` / `color(srgb-linear …)`，本库令牌与 `color-mix()` 算出来的颜色都在其中；超出 sRGB 色域的颜色按通道裁剪，每一路夹回 0–255，不做感知映射。颜色自带的透明度乘进 `fill-opacity` / `stroke-opacity`。认不出的写法（`lab()`、`lch()`、`color(display-p3 …)` 等）原样保留。

另外：

- 去掉 `class`、`style`、`data-*`、事件属性（`on*`）与 ARIA、`role`、`tabindex`，不再依赖页面的样式表与脚本；`id` 留着，渐变、裁剪与遮罩靠它引用。
- 计算出 `display: none` 的元素与 `include` 返回 `false` 的元素连同子树不进克隆。
- 不支持 `foreignObject`：带它的 SVG 画进画布后导不出 PNG，遇到时抛 `TypeError`，把其中的内容画成 SVG 元素再导出。
- 克隆的元素都建在 SVG 命名空间里，`xmlns` 由序列化时写出，根上不手写。`source` 必须在文档里；返回的克隆不在文档里，可以再改再拼。

只处理 SVG 子树。HTML 画的部分（如节点的方框与文字）由产品读它的计算样式自己画成 SVG 元素，再与克隆拼在一起。

## 序列化

`serializeSvg(svg)` 把 SVG 写成能单独存成 `.svg` 文件的文本，`xmlns` 由序列化器按命名空间写出一份。只收 SVG 命名空间里的元素，别的抛 `TypeError`。自己拼 SVG 时用 `createElementNS` 建元素，不要再手写 `xmlns` 属性：有的序列化器会因此写出两份，得到的文本不是合法的 XML。

## 栅格化成 PNG

`rasterizeSvg(svg, options?)` 把 SVG 元素或文本画成 PNG，返回 `Blob`：

| 选项 | 说明 |
| --- | --- |
| `width` / `height` | 输出图在 SVG 里的宽高；缺省取 `viewBox` 的宽高，没有 `viewBox` 再取根的 `width` / `height` 属性 |
| `scale` | 倍率，PNG 的像素宽高是宽高乘它，缺省 1；导出给高分屏看时写 2 |
| `background` | 先铺满的底色，任何 CSS 颜色；不给即透明 |
| `oversize` | 宽高乘倍率超过浏览器画布上限（单边 32767 像素、总数 268435456 像素）时怎么办：`error`（缺省）以 `RangeError` 拒绝；`shrink` 把倍率降到正好放得下，图按比例缩小 |

- SVG 当作图片画，不加载外部资源与网页字体：文字按 `font-family` 用本机的系统字体画，页面上用网页字体的文字在 PNG 里会换成系统字体。
- 宽高算不出、倍率不是正数、超过画布上限（`oversize` 为 `error` 时）以 `RangeError` 拒绝；带 `foreignObject` 的以 `TypeError` 拒绝；图载不进来、画布导不出时也以错误拒绝，不返回空白图。
