---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**`table` 补出列设置区与工具条两块，`page-header` 补出形态轴与面包屑 / 头像两个位。**

排序（`sort` / `sortPriority`）、列宽（`resizable` / `setColumnWidth`）、显隐与列序（`COLUMN_PREF.PATCH`）这三样表格内部一直都有，缺的只是把它们摆出来的那两个部件——于是每个用它的应用都自己长一层几百行的设置面板壳。现在两块都在库里：

- `toolbar` 是搜索、筛选、密度与列设置这些**对整张表下手**的控件的位置。它是 root 的兄弟不是子节点——root 是 grid 系角色，子节点只能是 row 与 rowgroup，所以 Vue 侧另开一个 `toolbar` 插槽（不写就一个节点都不渲），Web Components 侧照旧由作者写在元素里、摆在 root 之外。它不带 `role`：一条控件带要不要 `role=toolbar` 连同那套方向键 roving 归作者，要就往里放一个 Toolbar。
- `column-list` + `column-visibility-trigger` 是列设置区与它的显隐把手（`role=checkbox`，勾着＝这一列显示着）。渲什么照新增的 `api.columnSettings` 走：作者定义的那些列按偏好排过序，**藏起来的也在其中**——生效列（`api.columns`）把它们滤掉了，而设置区正是把它们放回来的地方。只剩最后一列显示着时那颗把手转 `aria-disabled`：全藏起来的表是一张没有列的网格，而设置区里的把手都长在列上，用户从那里再也点不出一个把手把列放回来。
- 冻结档补上写入口：`COLUMN_PREF.PATCH` 收 `sticky`，`api.setColumnSticky(columnId, sticky)` 与显隐、列宽、列序并列。此前 `TableColumnPreference.sticky` 只读得出、改不了，只能整份 `setColumnPreference` 换掉。
- `columnSettings` 与 `setColumnSticky` 两侧都露：Vue 在两个插槽的载荷里，Web Components 上是 `el.columnSettings` 与 `el.setColumnSticky()`。

`page-header` 这一侧：

- 新增 `variant`（`plain` / `surface` / `raised`）。不写即不发 `data-variant`，与写 `plain` 长一个样，既有页头逐值不变；`surface` 加底色、圆角与左右内衬，`raised` 再加一层抬起投影。`bordered` 在有面的两档改画整圈描边——一块切了圆角的面底下横一条直线，两头会露在圆角外面。
- 新增 `breadcrumb`（整行排在标题之上）与 `media`（头像 / 图标位，排在返回位与标题之间）两个部件，都可缺省。此前面包屑只能塞进 `footer`，而那是标题**下方**的位置。
- `XhPageHeaderTitle` 收 `as`（默认仍是 `div`）：这一块在页面大纲里确实是一级标题时写 `as="h1"`，组件自己照旧不往文档大纲里插标题。
