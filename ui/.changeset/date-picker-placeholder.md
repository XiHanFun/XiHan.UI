---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

DateField / DatePicker 的 `placeholder` 接受字符串：一段都没填、焦点也不在段上时，输入行显示这句整条占位（「请选择生效时间」），段位与分隔符淡出让位，焦点一进到段上就换回 yyyy / mm / dd 段位；给对象仍是逐段的占位串。DatePicker 此前不转发 `placeholder`，现在两种写法都转给内嵌的分段输入。DateRangePicker 新增 `startPlaceholder` / `endPlaceholder`（两组各自的整条占位）与两端共用的逐段 `placeholder`。整条占位以段位组上的 `data-placeholder-shown` 与 `data-placeholder-text` 表出，由皮肤用生成内容画，前景走新增的 `--xh-date-picker-placeholder-fg` / `--xh-date-range-picker-placeholder-fg`（DateField 沿用 `--xh-date-field-placeholder-fg`）；headless 新导出类型 `DateSegmentPlaceholders`。
