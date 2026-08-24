---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

树补一条 `orientation`：子层可以横排。

默认仍是 `vertical`（每行一个）；`horizontal` 让同一层的节点并排铺开，
层级缩进照旧由子层容器自己顶——那是这一层相对上一层的位置，与层内怎么排无关。

**方向键不跟着改。** 树上左右是层级操作（收起 / 展开、回父层 / 进子层）、上下走可见行，
这是 treeview 的规范语义，横排只是排布，不改写它。`tree` 会自报 `aria-orientation`，
但导航轴在 connect 里仍固定竖直。

顺带修一处冲突：叶子行在竖排下会自己补出「箭头那一格」，横排下补出来的
是节点之间的空隙而不是层级，那条规则因此限定在 `data-orientation='vertical'` 下。
