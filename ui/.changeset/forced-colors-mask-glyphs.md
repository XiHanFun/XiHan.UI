---
'@xihan-ui/styles': patch
---

高对比档（`forced-colors: active`）里皮肤画的兜底字形不再消失。关闭钮的叉、翻页与展开箭头、选中对号、单选圆点、下载与播放暂停等字形都是伪元素上的一块底色（用 mask 挖出形状，或者就是一块 `currentColor` 实心点），这一档里底色被系统换成 Canvas，与所在的面同色，只剩空按钮。现在这些伪元素退出强制换色、直接写系统色，按身下那块面在这一档里的实际底色取值：

- 按钮面上取 `ButtonText`，悬停与按下时按钮被涂成 `Highlight`，字形跟着换 `HighlightText`；禁用取 `GrayText`。
- 集合条目上取 `CanvasText`，按下与没被键盘或指针高亮时的悬停条目被涂成 `Highlight`，字形换 `HighlightText`；禁用取 `GrayText`。
- 字段里的下拉箭头、页面上的趋势与提示字形取 `CanvasText`；落在勾选盒实心面上的对号与圆点取 `CanvasText`。
- Watermark 的印子改取 `GrayText`：印子是防泄露的标记，开了高对比也照印，深浅仍由图样自带的透明度压着。

涉及 Accordion、Alert、Approval、BackTop、Breadcrumb、CalendarPicker、CalendarRangePicker、Carousel、Cascader、Checkbox、Citation、CodeView、Collapsible、ColorField、ColorSwatchPicker、Combobox、ContextMenu、DateField、DatePicker、DateRangePicker、Dialog、DiffView、DownloadTrigger、Drawer、Editable、FieldArray、FileUpload、FloatButton、FloatingPanel、ImageViewer、JsonViewer、Listbox、Log、Marquee、Menu、Menubar、MessageFeed、NavigationMenu、Notification、NumberField、Pagination、PasswordInput、Popover、PromptInput、QuestionFlow、Rating、Reasoning、Select、SideNav、Statistic、Steps、Table、Tabs、Tag、TagGroup、TagsInput、TextField、TimeField、TimePicker、TimeRangePicker、ToolCall、Toolbar、Tour、Transfer、Tree、TreeSelect、Watermark，以及勾选标记与菜单选择标记两份家族配方。只改高对比档，常态渲染不变；这几份皮肤的体积基线随补救块上调。
