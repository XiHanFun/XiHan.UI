---
'@xihan-ui/core': minor
---

新增子入口 `@xihan-ui/core/svg-export`：`standaloneSvg` 把页面上的 SVG 克隆成能单独打开的一份，计算出的填充、描边、字体等写成属性，设计令牌与 `currentColor` 换成具体值；`serializeSvg` 写成 `.svg` 文本；`rasterizeSvg` 按倍率与底色栅格化成 PNG `Blob`。图表、流程图这类用 SVG 画的内容导出图片共用这一套。
