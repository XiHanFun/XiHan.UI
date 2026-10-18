---
"@xihan-ui/core": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** 字段数组开了 `movable` 时每行多一颗拖动把手 `item-drag-trigger`，按住把这一行拖到别处换位。

- 拖动由排序（sortable）的状态机驱动：其余各行实时让位，拖到边缘自动滚动，松手后这一行从松手处收进新位置，值按 `{ type: 'move', from, to }` 换位，与上移、下移走同一条路径，同受 `movable`、禁用与只读约束。列表与表格两种排布都能拖。
- 把手只接指针：不占 Tab 位、对读屏隐藏，键盘与读屏照旧用上移、下移。
- 删掉的行在原处淡出时照常拖别的行：淡出的替身不算一项，照样播完退场。
- 新部件：Vue / React 的 `XhFieldArrayItemDragTrigger`，Web Components 的 `item-drag-trigger` 部件。标准结构开了 `movable` 时把手依次是拖动、上移、下移、删除。`FieldArrayApi` 加 `dragging` 与 `getItemDragTriggerProps`，`FieldArrayItem` 加 `canDrag`。
- 自己组装时：`connectFieldArray(service, normalize, drag)` 的第三个参数是按 `fieldArrayDragProps(service)` 跑的 sortable 机器，容器与项用 `fieldArrayDragContainer`、`fieldArrayDragItems` 接到它的 refs 上。
- sortable 的 refs 加 `getItemEls`：嵌在别的组件里、项是那个组件的部件时由适配器给出项节点；离场替身一律不算一项。
- core 的 `trackListMotion` 的 `reflow` 可以给函数，每批变更现问一次：拖动放下的那一批换位由拖动那一套滑过去，列表动效这一批不再补偿。
- 皮肤：`field-array.css` 加拖动把手的抓手字形与手型、拖着的那一行（承载面底色、lifted 海拔，高对比档描一圈 Highlight 轮廓）与让位过渡，新增覆盖槽 `--xh-field-array-item-bg-dragging`、`--xh-field-array-item-shadow-dragging`、`--xh-field-array-drag-grip-w`、`--xh-field-array-drag-grip-h`。这份皮肤去注释压空白后从 14463 字节涨到 16690 字节。
