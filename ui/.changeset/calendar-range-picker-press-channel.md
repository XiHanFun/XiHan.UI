---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**CalendarRangePicker 翻页钮、标题两截与日期格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针
`:active` 同一副按压面。** 机器 context 新增 `pressed`（`CalendarRangePickerPressedKey`：`prev-year` / `prev` / `next` /
`next-year` / `heading-year:面板` / `heading-month:面板` / `cell:ISO`，类型进公开面），根级事件 `PRESS.START { key, disabled? }`
/ `PRESS.END { key }`；守卫 `canPress` 在整张禁用、到界 / 到顶 / 不可选的部件上不进，只读只挡日期格（翻页与钻层照常）；
按住途中转入禁用或只读、钻层换视图、视窗挪动、拖选结束时由机器自行松开对应的那一个。触屏按下先投影按压面，拖选起点仍按
延时落下，两者互不打断；手指滑到另一格抬起时松开先前按住的那一格。DateRangePicker 内嵌的日历复用同一份 connect，随之接上。
皮肤按压面由 Action Control 家族配方给出；键盘表新增 `calendar-range-picker.kbd.press`。三端公开 props 与事件不变。
