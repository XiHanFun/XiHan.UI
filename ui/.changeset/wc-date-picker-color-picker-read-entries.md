---
"@xihan-ui/web-components": minor
---

**`<xh-date-picker>` 补三个取数口、`<xh-color-picker>` 补一个命令式写值入口；日历那几层从只接线第一个改成逐个接线。**

Vue 侧的 `XhDatePickerRoot` 在插槽里交出 `panels` / `segments` / `endSegments`，`<xh-date-picker>` 只有 `weeks` / `weekDays` / `headingLabel` 三个，粗粒度格子与并排第二页都取不到，输入行铺几段也只能作者自己按 view 数。现在补上：

- `panels` —— 并排展示的面板，长度即此刻铺了几页。每页自带日期矩阵（`weeks`）、粗粒度格子（`cells`）与标题（`headingLabel` / `headingYear` / `headingMonth`），月 / 季度 / 年三档的网格与区间跨页时的第二页照它渲染。
- `fieldSegments` / `fieldEndSegments` —— 输入行此刻该铺哪几段（段名、当前文字、占位与读屏名），段数与段序按 `view` 与 `locale` 推出来；后者是区间终点那一组，非区间模式为空数组。名字不叫 `segments`：那个名字已经是「作者指定铺哪几段」的入参属性，两回事不共用一个名。

四个都在机器建起来之前给空值（数组给 `[]`），作者在元素进文档之前读到的不再是异常。

`<xh-color-picker>` 新增 `setValue(value)`：按当前 `format` 重新序列化后落值，与点预设色板走同一条路径，照常发 `value-change`。从前元素只有受控的 `value` 属性，而 `format` 只在落值那一刻起作用、单独改它不重排已有的值串——想让当前颜色改按新写法产出，只能把原值写回去，可写回去的是同一个串，一条事件都不发。Vue 侧插槽里一直有这个句柄，这次两侧对齐。

日历那几层从 `getPart` 改成 `getParts`：`calendar` / `header` / `grid-head` / `grid-body` 与上下一页、大步翻那四个钮，从前只有文档序第一个拿得到属性与处理器。并排两页时第二页的这些节点既没有 `data-scope` / `data-part`（皮肤整块失效），也没有点击处理器。现在逐个接线，每页各写一份即可。
