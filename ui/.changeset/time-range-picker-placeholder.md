---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

时间区间选择器（TimeRangePicker）新增 `startPlaceholder` / `endPlaceholder`，与日期区间选择器（DateRangePicker）同名同义：起点、终点两组段位各自一句整条占位。Web Components 为 `start-placeholder` / `end-placeholder` 属性。

- 这一端一段都没填、焦点也不在这一端的段上时，那一组段位显示这句文字，段位与分隔符淡出；焦点进到这一端的段上即换回段位，另一端不受影响。段组带 `data-placeholder-text` 与 `data-placeholder-shown`。
- 文字由皮肤以生成内容画出，新增覆盖槽 `--xh-time-range-picker-placeholder-fg`（缺省 `--xh-fg-subtle`）；强制色下取系统弱色。
