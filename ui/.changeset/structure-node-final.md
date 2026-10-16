---
'@xihan-ui/headless': minor
---

`StructureNode` 定稿：新增 `component`（委派给内嵌组件的部件）与 `slot`（内容归作者的部件，类型 `StructureSlot`），`tag` 放宽为 `StructureTag`（div、span、button、label、input、textarea、p、ul、li、fieldset、legend，以及组合进来的 `xh-*` 库内元素），并按组件结构会产出的部件名带类型参数；`attrs` 只放作者会写的身份属性。新增 `StructureTakeoverPosition`（trailing / portal）与热力图的 `HEATMAP_STRUCTURE_TAKEOVER`。
