---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

日期范围选择器改用标准结构：新增 `dateRangePickerStructure` 与 `DateRangePickerStructureOptions`，次序是标题、盒（起止两组段位、分隔符、清空钮与日历钮）、起止两份表单影子、浮层（快捷选项列、每个面板一份日历、`showTime` 的起止两组时间列与底栏的确认钮）；段与表单影子按 `component` 委派给分段输入，日历各部件委派给日历范围选择器。Vue 不写默认插槽、React 不给 children 时照它铺，原先这种写法只渲出空的根；Web Components 的 `<xh-date-range-picker>` 不写部件或只写 `root` 时生成整套节点，翻月、换层级与选中变化时随之重铺，标题可用 `slot="label"` 接管。三端新增 `label`：Vue 是标题文字与 `label` 插槽，React 可传任意节点，Web Components 是 `label` 属性，只在不写结构时使用。Vue / React 新增 `XhDateRangePickerColumnGroup`（`index`）、`XhDateRangePickerColumnGroupLabel`、`XhDateRangePickerTimeColumn`（`unit`）与 `XhDateRangePickerTimeItem`（`value`），时间列可以逐组、逐列写，不写内容时按这一端的列与可选值铺。headless 另增 `DateRangePickerTranslations.confirmTrigger`（确认钮文字，十种语言包都已补上）与 `DateRangePickerApi.translations`（解析后的文案）。
