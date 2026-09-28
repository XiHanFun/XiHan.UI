---
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Slider 新增反向 `inverted`、整段拖动 `draggableRange` 与不填充轨道 `trackFill`。

- `inverted`（Web Components 属性 `inverted`）：min 落在轨道末端（横排在行尾、竖排在顶端），拇指、已选区间与刻度都从末端量起，指针换算与方向键跟着对调，方向键跟随屏幕方向。插槽里的 `thumbs[i].percent` 与 `range` 仍按值的位置报。
- `draggableRange`（属性 `draggable-range`）：多拇指时按住两端拇指之间的轨道拖动，整段一起平移、宽度不变，挪到头就停；按在拇指上仍只推那一个，按在区间外照旧抓最近的拇指；只认刻度落点时不生效。range 部件投影 `data-draggable`，皮肤给出抓取光标；整段拖动时两端拇指都投影 `data-dragging`。
- `trackFill`（默认 `true`，属性 `track-fill`，写 `"false"` 关掉）：关掉后 range 部件收起（`hidden`），刻度不再按区间上色。
- headless 导出 `displayPercent`、`shiftThumbValues` 与类型 `SliderDragMode`、`SliderRangeDragOrigin`；`AxisOptions` 新增可选 `inverted`；机器 context 新增 `dragMode` / `rangeOrigin`，`DRAG.START` 事件新增可选 `onThumb`。
