---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

字段数组改用标准结构：新增 `fieldArrayStructure` 与 `FieldArrayCellSlotData`。列表排布下每行是行号（第几行）、内容格与把手（开了 `movable` 时先是上移与下移，再是删除），表格排布下是表格本体里的表头（每列一个列头）与各行、行里每列一格，最后是新增把手，文字取新加的 `translations.addTrigger`（十种语言包都已补上）。Vue 不写默认插槽、React 不给 children 时照它铺，原先这种写法什么都不渲：每行的内容由 Vue 的 `item-content` 插槽（载荷 `{ item }`，类型 `FieldArrayItemContentSlotProps`）与 `item-cell` 插槽（载荷 `{ item, column }`，类型 `FieldArrayItemCellSlotProps`）、React 的 `renderItemContent(item)` 与 `renderItemCell(item, column)` 给出。Web Components 的 `<xh-field-array>` 不写部件或只写 `root` 时生成整套节点，每行的内容写在宿主的直接子节点上：`slot="item-content:<行 key>"`，表格排布 `slot="item-cell:<行 key>:<列 id>"`，行 key 从新增的只读属性 `items` 读，换序时内容跟着行走；没给内容的行就空着。headless 另增 `FieldArrayApi.translations`（解析后的文案）；`items` 在 `value-change` 派发的那一刻就带上随后落定的行 key（原先这一刻新行拿的是兜底 key），处理函数里能当场按 key 补上这一行的内容。
