---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 的文字度量补齐打印等版面排版要用的三样：

- `FontSpec` 新增可选的 `style`（`'normal'` | `'italic'`），Canvas 度量器把斜体写进 font 串，估算器不区分。
- `wrapText` 的 `WrapOptions` 新增 `letterSpacing`（px），与 CSS `letter-spacing` 一样加在每个字符之后、可为负，折行与末行省略都计入。
- 公开 `createCanvasMeasurer(document)`，返回带 `refresh()` 的 `CanvasMeasurer`；拿不到 2D 上下文时返回 `null`。此前它只在 headless 的图表内部使用，现在由 viz 统一提供，图表改为引用这一份。
