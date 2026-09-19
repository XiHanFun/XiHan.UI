---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Table 七个可按部件接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
行（`row`）、全选把手、行选把手、展开把手、列显隐把手、排序把手与取下一页按钮共用一个机器，context 新增
`pressed`（`TablePressedKey`：`select-all` / `load-more` / `row:<id>` / `row-select:<id>` / `expand:<id>` /
`column-visibility:<id>` / `sort:<id>`），根级事件 `PRESS.START { key, disabled? }` / `PRESS.END { key }` 四个状态
都认；守卫 `canPress` 在加载中不进，部件自身禁用（行禁用、不可展开、列不可排序、选择关停、只剩最后一列）时不进；
`endPress` 只松开键对应的那一个，按住途中转入加载时由机器自行松开。行的按压只认落在行自己（含普通格子）上的
事件，行里两颗把手与作者放进格子的控件各有自己的按压面。Space / Enter 的选中、排序与展开语义照旧。Action
Control（icon / row 档）与 Collection Item（page 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；
键盘表新增 `table.kbd.press`。三端公开 props 与事件不变。
