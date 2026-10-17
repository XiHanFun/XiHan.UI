---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

时间选择器（TimePicker）新增 `placeholder`，整条占位，与日期选择器（DatePicker）的字符串占位同义。Web Components 为 `placeholder` 属性。

- 单选：一段都没填、焦点也不在段上时，输入行显示这句文字，段位与分隔符淡出；焦点进到段上即换回段位。段组带 `data-placeholder-text` 与 `data-placeholder-shown`。
- 多选：没有选中值时标签行显示这句文字，同一对状态属性落在 tag-list 上。
- 文字由皮肤以生成内容画出，新增覆盖槽 `--xh-time-picker-placeholder-fg`（缺省 `--xh-fg-subtle`）；强制色下取系统弱色。
