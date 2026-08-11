---
"@xihan-ui/headless": patch
---

popconfirm 与 float-button 的组件文档页第一次有了 Props 表。

这两个组件没有自己的机器，props 写成 `Omit<PopoverSchema['props'], …> & …` 这样的类型别名；
文档生成器只认 `interface`，于是 102 页里这两页的 Props 小节整段缺席——不是「暂缺」，是压根
没生成，页面上看不出少了东西。生成器改走类型检查器解析，其余 100 页产出逐字不变。
