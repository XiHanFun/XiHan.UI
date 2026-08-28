---
"@xihan-ui/pointer": patch
"@xihan-ui/headless": patch
"@xihan-ui/vue": patch
---

**修复** `createMultiPointerSession` 只能用一次：最后一根指针抬起就把会话整个闩死，
`add()` 从此空转。会话是根级效应建的、整个生命周期只建一次，于是 `tabs` / `tree` /
`carousel` 三处的拖动**第二次彻底起不来**。「本场收尾」与「会话作废」现在是两件事。

**修复** `XhTableRoot` 丢掉作者写在它上面的 `class` / `aria-*` / 监听器。它渲的是
Fragment（表格本体 + 播报区），而 Vue 只在单个元素根上自动透传 attrs——改成 Fragment
那一批把这条通道弄断了，示例里已经有两处在用（分组表头传 `aria-rowcount`、
虚拟滚动示例传 `@scroll`）。

**修复** RTL 下指针与键盘互相矛盾：键盘三处早就跟着文字方向翻，指针这一路漏了。
RTL 横排的 DOM 首项在最右，它的几何左半是逻辑末侧，而 `hitAlong` 一律按几何判。
现在它收 `rtl`，横轴两处（列、横排标签）接上；行与树是纵轴，与文字方向无关。

**修复** 禁用的项仍是拖动源，六处：`tabs` 的整块起手 / `data-draggable` / `Alt` 方向键、
`tree` 的 `Alt` 方向键、`table` 行的整块起手 / `data-row-draggable` / `Alt` 方向键。
判据统一成「这一项自己禁用了就不是拖动源」。

**改动** `tree` 对禁用节点的落点判定收窄成只拦 `inside`。往一个禁用的分支里塞东西说不通，
但在它前后插只是绕着它排序——`table` 与 `tabs` 那边本来就是这个口径，三处现在一致。
