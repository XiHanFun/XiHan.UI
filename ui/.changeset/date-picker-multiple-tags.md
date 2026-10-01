---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

DatePicker 多选（`selectionMode="multiple"`）的选中值在输入行里排成标签：新增 `tag-list` 部件与 `XhDatePickerTagList` / `XhDatePickerTag` / `XhDatePickerTagLabel` / `XhDatePickerOverflowTag` / `XhDatePickerItemDeleteTrigger`（Vue / React 的标签行不写子节点即按 `tags` 铺好；Web Components 按 `tags` 渲染 `tag` 节点），与 Select 多选同一套库内标签。段位在多选时收起，日历钮常驻并成为键盘入口：退格摘掉最后一个、点标签上的叉摘掉那一个；超过新增的 `maxTagCount`（默认 3）的折进 +N，`translations` 新增 `deleteItem` / `overflowTag`；没有选中时整条 `placeholder` 落在标签行上；表单一个选中值一份同名隐藏输入（`field.getHiddenInputProps({ value })`）。此前多选时输入行只显示、只编辑第一个日期，隐藏输入也只提交第一个。
