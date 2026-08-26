---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

date-picker 补上 `defaultFocusedValue`，决定展开时先落在哪一页。

日历一直有这个 prop，date-picker 没往外露：它的聚焦日单元格默认值写死为 `null`，只能退回首个选中值、再退回今天。没有初始值又想让面板先停在某个月（报表默认看上个月、排期表默认看下个月）此前没有出口。

补上之后三路收口不变：写过的聚焦日 → `defaultFocusedValue` → 首个选中值 → 今天。表单重置回到 `defaultFocusedValue`，与其余 `default*` 一致。Web Components 那侧是 `default-focused-value`。

顺带说明一处已有的误用：`defaultFocusedValue` 此前不是 date-picker 的 prop，测试里写了也不生效，那几条其实是靠「今天」恰好落在同一个月才通过的。现在它们真的按写的那一天算。
