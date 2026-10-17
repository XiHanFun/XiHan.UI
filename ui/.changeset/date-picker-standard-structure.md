---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

日期选择器改用标准结构：新增 `datePickerStructure` 与 `DatePickerStructureOptions`，次序是标题、盒（单选是段组，多选是带删除钮的标签行，后面是清空钮与日历钮）、表单影子、浮层（快捷选项列、每个面板一份日历、`showTime` 的时间列与底栏的确认钮）；段、表单影子、标签与日历各部件按 `component` 委派给分段输入、标签与日历选择器。Vue 不写默认插槽、React 不给 children 时照它铺，原先这种写法只渲出空的根；Web Components 的 `<xh-date-picker>` 不写部件或只写 `root` 时生成整套节点，翻月、换层级与选中变化时随之重铺，标题可用 `slot="label"` 接管。三端新增 `label`：Vue 是标题文字与 `label` 插槽，React 可传任意节点，Web Components 是 `label` 属性，只在不写结构时使用。Vue / React 新增 `XhDatePickerTimeColumn`（`unit`）与 `XhDatePickerTimeItem`（`value`），时间列可以逐列写，列里不写内容时按可选值铺格。headless 另增：`DatePickerTranslations.confirmTrigger`（确认钮文字，十种语言包都已补上）、`DatePickerApi.translations`（解析后的文案）、`DatePickerFieldApi.locale`，以及分段输入的 `dateSegmentGroupChildren`（段组里按段序铺段与分隔符，内嵌分段输入的选择器共用）。
