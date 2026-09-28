---
'@xihan-ui/pointer': minor
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Sortable 支持跨列表拖放：写了同一个 `group` 的几个列表组成一组（每个列表另写组内不重复的 `listId`），条目能从一个列表拖进另一个列表并落在指定位置。

- 指针：被拖项的中心进了组里别的列表，那个列表的根投影 `data-drop="inside"`，插入点及其后的项让出一格，末尾垫出同样大的一段让容器长高，落点线画在让出那一格的起始缘上；源列表里被拖项之后的各项合拢。中心落在列表之间的空白里时落点留在上一个列表。
- 键盘：拿起后本轴方向键在列表内移动，另一条轴上的方向键在相邻列表间移动（竖排列表左右键、横排列表上下键，rtl 下竖排的左右键对调），Escape 取消。键盘表新增 `sortable.kbd.next-list` / `sortable.kbd.prev-list`。
- 事件：落进别的列表时由源列表发一次 `transfer`（`onTransfer`），载荷 `{ id, fromList, toList, from, to, fromIds, toIds }` 给出两个列表各自的新顺序，写不写回归宿主；不写回时条目收回原位。入组时 `drag-end` 另带 `fromList` / `toList`。宿主接下转移后，落进来的那一项由目标列表从松手处以弹簧收进新位置。
- 读屏：挪进别的列表时播报列表名、它在组里排第几与新位次，落下时播报落进了哪个列表；`translations` 新增 `movedToList` / `droppedInList`。列表名取列表容器的可及名（`aria-labelledby` 优先）。
- 非法组合立即报错：写了 `group` 不写 `listId`、换行网格（`orientation="both"`）入组、组内 `listId` 重复。
- `@xihan-ui/pointer` 新增跨列表插入的几何原语 `projectInsertion`、`insertionOffsets`、`insertionSlot`。
- 高对比档里落点线改画系统高亮色，不再随底色一起消失。
- Web Components：连接层写在角色节点上的内联样式改为「写过才撤」对账，下一帧不再给的一条会被撤掉，节点被作者挪进另一台同类宿主时由接管方撤掉前一台留下的位移；此前给 `undefined` 的内联样式会一直钉在节点上。
