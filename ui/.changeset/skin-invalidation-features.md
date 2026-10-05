---
'@xihan-ui/styles': patch
---

皮肤里挂在运行期状态后面的后代与兄弟规则，主体都带上了组件特征。浏览器按属性名 / 伪类全局登记「某个属性一变要重算哪些节点」，不看取值也不看同一节里的组件限定：主体只靠 `[data-part]`（或 `> *` 这类没有特征的主体）时，页面上任何元素翻转 `data-state`、`data-current`、`data-disabled`、`data-instant` 等，都会把它整棵子树一起标脏。3500 个组件节点的容器上翻一次 `data-state` 由 150ms 降到 4ms，`data-current` 152ms → 2ms，`data-disabled` 155ms → 8ms，`data-instant` 80ms → 11ms。

本组件的部件补 `:where([data-scope='x'])`（产物里成为 `:where(.xh-scope-x)`，不加特异性，层叠不变）；作者放进来的任意子节点（按钮加载环与色板徽标里的图形、组合框展开钮的箭头、日期输入的段位、浮动按钮的动作项）改为由父节点写私有槽、子节点只读槽。浮动按钮动作项的冒出与缩回交错改由名次与收起标记算出，收起时的指针关闭挪到 list 上继承。
