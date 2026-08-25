---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

树补一条 `leafOrientation`：末端那一层可以横排。

只作用于「子节点全是叶子」的那一层——菜单授权里就是按钮那层。一个菜单下十几个按钮，
横排一行铺完，省掉大量纵向翻找：

```vue
<XhTreeRoot :collection="menus" leaf-orientation="horizontal" />
```

**中间层与整棵树恒是竖排，不提供开关。** 它们承载的是层级本身，横过来层级就读没了。
判据是「这一层不再往下分」而不是「深度等于几」：同一棵树里各枝深浅不一，
按深度判会把浅枝的中间层也横过来。

**方向键不跟着改。** 树上左右是层级操作（收起 / 展开、回父层 / 进子层）、上下走可见行，
这是 treeview 的规范语义，横排只是排布。

顺带修一处：叶子行在竖排下会自己补出「箭头那一格」与同级分支对齐，横排下补出来的
是节点之间的空隙而不是层级，那条规则因此按行盒**所在的那层容器**判定方向。
