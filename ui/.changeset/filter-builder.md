---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `filter-builder` 组件（条件编辑器）：可视化编辑一棵 `@xihan-ui/viz` 的条件树（`FilterGroup`），交给 `compileFilter` 即可按它筛选。Vue、React 与 Web Components 三端同时可用。

- 组里是条件与子组，组头切「全部满足 / 任一满足」；每个条件是字段、运算符与值。运算符按字段类型给出（字段可自带运算符），值的控件随运算符换：单值、区间两端、一组值（有候选值时多选下拉，没有时标签输入）、不要值。字符串运算符旁有「忽略大小写」开关，`ignoreCase` 设为 false 可关掉。
- 换运算符时能保留的值保留，换字段而类型变了时清空；组与条件上不认识的键原样保留。`maxDepth`（缺省 2）限定子组嵌套层数，到上限时「加条件组」收起。
- 给了 `parameters` 时每个条件可以在「值 / 参数」之间切换，只列类型相同、且多值与运算符相容的参数，值写成 `{ parameter: 名字 }`。
- 给了 `createId` 时新建的条件与组带 `id`；带 `id` 的条件行尾可以放宿主自己的控件：Vue 用 `condition-extra` 作用域插槽、React 用 `renderConditionExtra`，参数是条件与路径；Web Components 在宿主的直接子节点上写 `slot="condition-extra:<条件 id>"`。
- 不完整的条件（字段已不存在、运算符与类型不合、该有值却没有、参数已不存在或类型不符）照常留在值里，行上带 `aria-invalid` 与行内说明，根标无效。
- 键盘：行里 Alt+Shift+↑ / ↓ 在同组内挪这一行，Ctrl+Delete 删除这一行；增删与挪动后焦点落到合适的位置，播报区读出「已添加条件 3」这类说明。
- 根、每个组与每个条件都是 `role=group`，组以逻辑为名、条件以「条件 n」为名；行内的每个控件都有名字（「条件 2 的字段」「条件 2 的运算符」「条件 2 的值」，区间两端分「起始值」「结束值」）。根收 `ariaLabel`，放进字段时用字段的标题与说明。
- 里面的下拉、输入框、数字框、日期框、标签输入、分段切换与开关都是库内组件的实例，结构由 `filterBuilderStructure` 一份给出：Web Components 不写部件（或只写 root）时元素按值生成整棵树，Vue / React 不写默认插槽时三端铺出同一棵树；按需注册 `xh-filter-builder` 时连带注册这几个元素。元素上的删除方法叫 `removeNode`（`remove` 是元素自己的移出文档）。
- 皮肤只管排布：子组缩进一段、起始缘一条细线标出层级；条件行放不下时折行，操作数占满余下的宽度，区间两端等分；加条件、加条件组是虚线描边的文字钮，删除钮是 xs 的叉，悬停转危险色。
- 十种内建语言包新增 `filter-builder` 一桶。
