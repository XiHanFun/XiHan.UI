---
'@xihan-ui/headless': minor
---

`StructureNode` 定稿：新增 `component`（委派给内嵌组件的部件）与 `slot`（内容归作者的部件，类型 `StructureSlot`），`tag` 放宽为 `StructureTag`（div、span、button、label、input、textarea、p、ul、li、fieldset、legend），并按组件结构会产出的部件名带类型参数；`attrs` 只放作者会写的身份属性。新增组合节点 `StructureInstanceNode`（结构里生成另一个库内组件的实例，带它的 props 与 `onXxx` 回调）与 `StructureChild`、`isStructureInstance`，以及按组件名收窄 props 的 `structureInstance(key, instance, props)` 与 `StructureInstanceProps`。新增 `StructureTakeoverPosition`（trailing / portal）与热力图的 `HEATMAP_STRUCTURE_TAKEOVER`。
