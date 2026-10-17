---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

时间范围选择器改用标准结构：新增 `timeRangePickerStructure` 与 `TimeRangePickerStructureOptions`，次序是标题（原生 `label`）、盒（起止两组段位、分隔符、清空钮与触发钮）、起止两份表单影子、浮层（快捷选项列与起止两组时间列，各带小标题）。Vue 不写默认插槽、React 不给 children 时照它铺，原先这种写法只渲出空的根；Web Components 的 `<xh-time-range-picker>` 不写部件或只写 `root` 时生成整套节点，精度、小时制与选中变化时随之重铺，标题可用 `slot="label"` 接管。三端新增 `label`：Vue 是标题文字与 `label` 插槽，React 可传任意节点，Web Components 是 `label` 属性，只在不写结构时使用。headless 另增 `TimeRangePickerApi.translations`（解析后的文案），以及时间选择器的 `timeSegmentGroupChildren`（段组里按段序铺段与分隔符，时间选择器与起止两组共用）。
