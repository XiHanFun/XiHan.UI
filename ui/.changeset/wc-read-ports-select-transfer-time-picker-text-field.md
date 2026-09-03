---
"@xihan-ui/web-components": minor
---

**四个元素补上作者取数用的口子：`<xh-select>` 的 `tags` / `overflowCount`、`<xh-transfer>` 的 `visibleItems(side)`、`<xh-time-picker>` 的 `columns`、`<xh-text-field>` 的 `canClear` / `setValue()` / `clear()`。**

Vue 侧把 connect 的派生值与命令式方法经插槽作用域交给作者，自定义元素这边没有对等物，作者只能把库里那段逻辑自己再写一遍：标签的截断点与余数、穿梭框的分侧与搜索过滤、时间列按 min/max 与已选的时收窄，全都得在页面脚本里复刻一份——库里口径一变，外面静默走样。这几个只读属性与方法直接把 connect 的答案透出来，语义与形状同 `SelectApi` / `TransferApi` / `TimePickerApi` / `TextFieldApi` 上的同名成员一致。

机器还没建起来时给的是安全空值（数组空、布尔假、命令式方法空操作），不抛错，作者可以在连接前就读。

文档站四份示例改用这些口子：`select/14-tags` 不再自己 `slice` 截断，`transfer/06-grouped-list` 与 `07-long-list` 不再自己分侧与过滤，`time-picker/06-range` 不再用 CSS 把标了 `aria-disabled` 的格子藏起来，`text-field/08-programmatic` 不再靠派发原生 `input` 事件模拟写值、也不再借组件自带的清空钮代理。
