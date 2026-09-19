---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**CalendarPicker 翻页钮、标题两截与日期格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
同一副按压面。** 机器 context 新增 `pressed`（`CalendarPickerPressedKey`：`prev-year` / `prev` / `next` / `next-year` /
`heading-year:面板` / `heading-month:面板` / `cell:ISO`，类型进公开面），根级事件 `PRESS.START { key, disabled? }` /
`PRESS.END { key }`；守卫 `canPress` 在整张禁用、到界 / 到顶 / 不可选的部件上不进，只读只挡日期格（翻页与钻层照常）；
按住途中转入禁用或只读、钻层换视图、视窗挪动时由机器自行松开对应的那一个。DatePicker / DateRangePicker 内嵌的日历复用
同一份 connect，随之接上。皮肤按压面由 Action Control 家族配方给出；键盘表新增 `calendar-picker.kbd.press`。三端公开
props 与事件不变。
