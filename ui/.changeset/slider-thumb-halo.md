---
'@xihan-ui/styles': major
---

**调整** Slider、ColorSlider、ColorPicker 的拇指改成平面圆：不投影、不走 raised，悬停与拖动都不放大；拖动中画与聚焦同一副光环（从描边外沿起铺 `--xh-ring-width` + `--xh-ring-halo-width`，颜色 `--xh-ring-halo`），键盘聚焦时 `focus.css` 的光环也不再被拇指自己的影压住。值气泡不再反向缩放。ColorPicker 取色区的白环拇指在环内侧补一道 1px `--xh-border-default-opaque` 装饰边（inset），新增覆盖槽 `--xh-color-picker-thumb-edge`。ColorPicker 的盒补上字段家族的无效态描边映射，新增覆盖槽 `--xh-color-picker-control-border-invalid`，与 Select 等同族成员一处对一处。

删除的组件覆盖槽：`--xh-slider-thumb-shadow`、`--xh-slider-thumb-shadow-dragging`、`--xh-slider-thumb-shadow-disabled`、`--xh-slider-thumb-scale-dragging`、`--xh-color-slider-thumb-shadow`、`--xh-color-slider-thumb-shadow-dragging`、`--xh-color-slider-thumb-shadow-disabled`、`--xh-color-slider-thumb-scale-dragging`、`--xh-color-picker-thumb-shadow`、`--xh-color-picker-thumb-scale-dragging`。要改拖动光环的颜色改 `--xh-ring-halo`。
