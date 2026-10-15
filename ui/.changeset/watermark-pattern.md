---
'@xihan-ui/headless': minor
---

`@xihan-ui/headless` 公开纯函数 `planWatermark(options)`：不经状态机、不碰 DOM，按文字、图片与几何算出一块平铺图样（SVG data URI 与尺寸，单位像素）。输入 `WatermarkPatternOptions` 在组件 props 之外支持分轴间距 `gapX` / `gapY` 与填色 `color`，缺省填纯黑供组件当遮罩用；图片只收内联图片，地址形式的图片须先取回。新增类型 `WatermarkPattern`、`WatermarkPatternOptions`。

Watermark 组件改为调用它，两轴间距都取 `gap`，颜色仍由皮肤的 `--xh-watermark-fg` 提供，图样与此前逐字相同。
