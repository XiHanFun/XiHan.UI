---
'@xihan-ui/styles': major
---

**调整** Slider、ColorSlider、ColorPicker 的拇指改成平面圆：不投影、不走 raised，悬停与拖动都不放大。拇指的边界是一道 2px 描边，聚焦与拖动画同一道环，收进描边以内（`calc(var(--xh-ring-offset) - var(--xh-stroke-thick))`），仍在拇指自己的盒内；ColorSlider 与取色区的拇指面是任意颜色，环内侧再衬一道 `--xh-ring-gap` 底色间隔线。值气泡不再反向缩放。ColorPicker 取色区的白环拇指在环内侧补一道 1px `--xh-border-default-opaque` 装饰边（inset），新增覆盖槽 `--xh-color-picker-thumb-edge`。ColorPicker 的盒补上字段家族的无效态描边映射，新增覆盖槽 `--xh-color-picker-control-border-invalid`，与 Select 等同族成员一处对一处。

删除的组件覆盖槽：`--xh-slider-thumb-shadow`、`--xh-slider-thumb-shadow-dragging`、`--xh-slider-thumb-shadow-disabled`、`--xh-slider-thumb-scale-dragging`、`--xh-color-slider-thumb-shadow`、`--xh-color-slider-thumb-shadow-dragging`、`--xh-color-slider-thumb-shadow-disabled`、`--xh-color-slider-thumb-scale-dragging`、`--xh-color-picker-thumb-shadow`、`--xh-color-picker-thumb-scale-dragging`。
