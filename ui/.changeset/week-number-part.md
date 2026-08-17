---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

周序号成为一等部件 `week-number`，不再由使用者自己拼一列出来。

上一版只把数字算出来（`panel.weekNumbers`），列宽得作者用行内 `grid-template-columns` 自己撑，
库不管它的皮——同一份东西在不同项目里会长得不一样，这不是组件库该留的样子。

- 解剖新增 `week-number`（可选部件，不写即不渲染），语义是这一行的表头（`role=rowheader`）：
  在 `role=grid` 里，一行的标号本就该是 rowheader，而不是又一个可选的格子
- `getWeekNumberProps` / `getWeekNumberText` 两条，文字由两个适配器各自填，保证同构；
  表头那一格是占位、不带值，解析不了不抛、给空串占住列宽
- 皮肤接管列宽与字样：摆了周序号格的行自动让出行首一列
  （`--xh-calendar-week-number-w`，默认 2.25rem），数字比日子小一号、颜色压下去、不跟着选中态走
- 新增 `XhCalendarWeekNumber` / `XhDatePickerWeekNumber`；WC 侧写
  `<span data-xh-part="week-number" value="行首那天">` 即可

选择器那条列宽规则写的是 `:not([hidden]):has(...)`——同特指度的规则谁在后面谁赢，
不带这一道的话收起态会被这条 `display` 掀开（上一轮刚栽过一次，已有门禁拦着）。
