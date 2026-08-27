---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `table` 的列拖拽排序：列上标了 `reorderable` 才产出拖拽把手，拖到别的列上换位；
把手自占一个 Tab 位，方向键挪一格、Home / End 挪到可拖区段的首末。

**新增** 两个部件 `column-drag-trigger` 与 `live-region`，一个属性名 `data-drop`（落点参照列，
取值 `before` / `after`），以及 `api.draggableColumns` / `api.dropTarget` / `api.announcement`。

**新增** `shared/drag.ts` 的沿轴落点判定（两档与三档）、插入下标折算与拖拽播报，
`table.drag.ts` 的可拖列判定与列偏好下标折算。

拖动中被拖的列**原地不动**，只落 `data-dragging`，落点由参照列上的一条指示线表示。
不写位移是因为冻结列是 `position: sticky` 的后代，祖先一有 `transform` 就掉出吸附；
斑马纹与行间线按 DOM 位置算，跟手让位会让它们在拖动全程与行错开。

键盘不做拾起 / 放下两态：按一下就是一次已过守卫的完整提交，各自播报一句。
列头里已经有排序把手与改宽把手两个 Tab 位，再加一套模态按键会让三者互相抢键。

提交走既有的 `COLUMN_PREF.PATCH`，列序仍然只有一处在改。落点按列 id 认而不是按第几个，
于是隐藏列自然留在原本的邻居旁边，前缀列压根不进落点快照。

不可拖的列与冻结列都是**屏障**：可拖范围被它们切成段，只有最长的那一段能拖。
跨过冻结列去落，落下来那一列会夹在两根钉住的列当中一起悬在滚动之上。

播报区渲在 `root` **之外**。`root` 是 `role=grid`，它的子节点只能是 `row` 与 `rowgroup`，
塞一个活动区域进去是 `aria-required-children`（critical）——不带 role 只留 `aria-live` 也一样，
无角色但带全局 aria 属性的节点照样被算进 owned。两个适配器都自己把它渲成 `root` 的兄弟，
使用者不必操心位置。
