---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `tabs` 的标签拖拽换位：`reorderable` 打开后整个标签都是拖动源，拖到别的标签上换位；
焦点在标签带里时 `Alt` + **主轴**方向键挪一位。搬完发 `onTabMove`，载荷是
`{ value, from, to, values }`，`values` 是重排好的整份标签序，可直接写回数据源。

**新增** `live-region` 部件、标签上的 `data-dragging` / `data-drop` / `data-draggable`、
`translations` prop，以及 `api.dropTarget` / `api.announcement`。

轴向跟随 `orientation`：横排量横轴、竖排量纵轴，键盘也只认主轴那两个键——
另一轴的方向键照常放行给页面滚动与读屏。横排 rtl 下左右对调。

禁用的标签**仍进落点快照**。它自己挪不动，但别人可以落在它前后；把它摘掉的话，
指针划过它那一段会没有落点，指示线一闪一闪。

顺序不进机器：`collection` 是 prop，库没有一份自己的标签序可写，只发意图、写回归宿主。

**重构** 一维重排的三件算术提到 `shared/drag`：`reorderFlat`、`flatMoveCommand`、
`flatMoveIntentFromKey`（后者收轴向与文字方向两个参数）。`table` 的行拖拽改指共享实现，
`moveRowIds` / `rowMoveCommand` / `rowMoveIntentFromKey` 三个行专用名字随之删除——
它们与本批同属一个未发布的系列，现在合并是免费的。三个组件从此共用同一份重排语义，
往后要改「先摘后插」这类算术只有一处。
