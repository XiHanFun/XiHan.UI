---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** 三个拖动把手：`table` 的 `row-drag-trigger`、`tree` 的 `node-drag-trigger`、
`tabs` 的 `tab-drag-trigger`。它们是**触屏那一路的入口**。

三处的「整块起手」此前都不认触屏：纵向手势在按下那一刻就归了浏览器滚动，
`touch-action` 事后改不回来；而把整行 / 整个节点设成 `touch-action: none`
又会让长列表在上面完全滚不动。把手是一小块专门让出去的地方，自带 `touch-action: none`，
手势从按下那一刻就是拖动的——同仓的 `column-resize-trigger` 早就是这个机制。

把手**不占 Tab 位**（`aria-hidden` + `tabindex=-1`）：键盘那一路早就由容器上的
`Alt` + 方向键承担，把手只是指针侧的第二个入口。整块起手（鼠标与笔）原样保留。

按下即拖，不等激活距离——把手是专门的入口，意图无歧义。三处的 `*_DRAG.START` 事件
因此多一个 `activate` 旗标，整块起手仍走激活距离那条路。

把手常挂即可：开关关着或这一项拖不动时它自报 `data-disabled`、也不再让出滚动。
按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。

**修复** `tabs` 的 Web Components 侧：把手此前只收 `value`，漏了「没给 `collection`、
禁用写在标记上」那条来路，于是标签禁着而把手仍判可拖。现在与 `trigger` 走同一条判定。

抓手字形按「线的走向与能拖的方向垂直」转了向：列是横排所以画竖线，行与树节点是纵排
所以画横线，`tabs` 跟着 `orientation` 两种都给。
