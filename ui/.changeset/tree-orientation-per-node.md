---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": patch
---

树的排布方向可以逐层判定。

`orientation` 除了收 `'horizontal' | 'vertical'`，还能收一个函数：
收到的是**分支节点**（`TreeNodeMeta`），答的是它那层子节点怎么排；根层收到 `null`，
答 `undefined` 即退回竖排。

菜单授权那类树正是它的用武之地——目录与菜单竖排、按钮横排，一行铺开就选完，
省掉大量纵向翻找：

```ts
orientation: node => (node?.level === 2 ? 'horizontal' : 'vertical')
```

同时修一处混排下才暴露的皮肤缺陷：叶子行「补出箭头那一格」的规则原先用后代选择器
匹配 `[data-orientation='vertical']`，混排时横排层里的叶子仍会被外层的竖排祖先命中，
每个按钮前面多出一段空白。改成直接子代——排布方向由行盒**所在的那层容器**说了算。
