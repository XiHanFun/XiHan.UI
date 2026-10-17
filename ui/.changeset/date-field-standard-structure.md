---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

日期输入框改用标准结构：新增 `dateFieldStructure` 与 `DateFieldStructureOptions`，三端新增 `label`（标题文字；Vue 另有 `label` 插槽，React 可传任意节点）。Vue 不写默认插槽、React 不给 children 时照结构铺出标题、段组与清空按钮、表单影子，段按当前段序铺、段间分隔符从 `locale` 现取，原先这种写法什么都不渲；Web Components 的 `<xh-date-field>` 不写部件或只写 `root` 时按它生成，换 `locale` 或精度时段序与分隔符跟着换。标准结构新增装饰文字节点 `StructureLiteralNode` 与 `isStructureLiteral`：段间分隔符这类不是部件的文字，三端都渲成只装这段文字的 `span`。
