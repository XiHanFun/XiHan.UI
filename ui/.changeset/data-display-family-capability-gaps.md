---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
"@xihan-ui/tokens": minor
---

**数据展示族补能力：描述列表补跨列、统计数补涨跌、时间线补坐标列、JSON 视图补空态、树与 JSON 视图补形态轴、无限滚动补取下一页的按钮。** 纯新增，公开面一个名字都没删。

**描述列表的跨列。** `descriptions` 的 `getItemProps` 从零参改成收一个可选的 `DescriptionsItemProps`（`{ span?: number }`），产出 `style.gridColumn`；`span` 钳在 1 与当前 `columns` 之间——跨出网格的格子会另起一行，比截断更难看。旧的零参调用照样成立。Vue 侧 `XhDescriptionsItem` 补 `span` prop，Web Components 侧从格子自己的 `span` 特性上读。

**统计数的涨跌。** `statistic` 补 `trend` 部件与 `trend` prop（`up` / `down` / `flat`），方向落成部件上的 `data-direction`，皮肤据它出兜底箭头——示例里不必再手打箭头。`trend` 与 `tone` 保持正交，方向与颜色互不联动：跌也可以是好事（差错率、退货率），要不要联动由作者自己定。新增令牌 `--xh-glyph-mark-arrow-down`（`arrow-up` 与 `minus` 早已在册）。

**时间线的坐标列。** `timeline` 补 `label` 部件：与内容对置的那一列，装这一条的日期或版本号。竖排三种侧别各给它一条轨道——结束侧占线之前那列、起始侧占线之后那列、逐条交替时恒在内容对面，时间戳因此不再跟着内容左右横跳。`time` 留在 `content` 里不动，两者语义不同：`label` 是这一条的坐标，`time` 是内容的一部分。横排不为它单开轨道。

**JSON 视图的空态。** `json-viewer` 补 `empty` 部件与 `api.isEmpty` / `api.emptyText`：一行也摊不出来时（`value` 没给或给的是 `undefined`）由它说话，有行可摊时组件给它打 `hidden`。文案走新增的 `translations.empty`（缺省 `No data`），Vue 侧另有一个 `empty` 插槽，Web Components 侧由元素铺兜底文案。**这一件会改 DOM**：两个适配器都会在根里多渲一个 `[data-part='empty']` 节点，有数据时它带 `hidden` 不占位置；写了 `:last-child` 一类结构选择器的使用者要复核。

**两条形态轴。** `tree` 与 `json-viewer` 各补 `variant`（`'plain' | 'surface'`），落成根上的 `data-variant`。**缺省是 `surface`，逐值与从前相同**；`plain` 是新增档，边框留着但转成透明——去掉外框不会让行的位置跳一格。皮肤同批把那两条边框与底色的声明改成「使用者令牌 → 私有槽 → 语义令牌」三级，使用者写的 `--xh-tree-border` / `--xh-json-viewer-bg` 仍排在形态之前。

**无限滚动的键盘等价通路。** `infinite-scroll` 补 `load-more-trigger` 部件：一颗真按钮，点它与哨兵进可视区走同一段（机器新增 `LOAD` 事件，取数中与关掉两段同样不响应），按钮在这两段自动 `disabled` 并带 `data-loading` / `data-disabled`。读屏在虚拟光标模式下不产生滚动事件，只靠哨兵那条路取不到第二页——这颗按钮是它的等价入口。**文案由作者写在按钮里，组件不代填可及名字**：写死一句英文会与可见文字对不上，读屏念的与眼睛看的就分了家。部件是可选的，不写它的页面 DOM 一字不变。文档首段同批改口径：本组件是「取下一页」的通用触发器，滚动只是默认的触发方式。

体积（去注释压空白后）：`statistic.css` 2190 → 3559 字节、`timeline.css` 9561 → 11643 字节、`json-viewer.css` 7740 → 8710 字节、`tree.css` 13253 → 13455 字节、`infinite-scroll.css` 447 → 2123 字节；`descriptions.css` 未动。涨的是新增部件的排版块与两条形态轴的槽赋值。
