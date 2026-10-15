---
'@xihan-ui/designer-kit': minor
---

新增网格布局，供看板、工作台这类按整数格排布卡片的设计器使用：`GridItem` 是 `{ id, x, y, w, h }`，单位是格。

- `clampToGrid(item, columns)`：取整并夹到网格内。
- `gridCollides(a, b)`：两项是否重叠，边相接不算。
- `compactLayout(items, columns)`：自上而下向上压实，原本重叠的项向下推开。
- `setGridItemRect(items, id, target, columns, { compact? })`：拖动或改大小，压到的项向下推开；向下拖过下方项的顶边时两者对调。
- `placeGridItem(items, placement, columns, { compact? })`：放到指定位置并推开碰撞的项，或放到第一个放得下的空位。
- `removeGridItem(items, id, columns, { compact? })`：移除一项。

都返回新数组、次序不变；调整之后缺省整体压实，`{ compact: false }` 不压实。位置大小不是有限数、id 不存在或重复时抛 `RangeError`。
