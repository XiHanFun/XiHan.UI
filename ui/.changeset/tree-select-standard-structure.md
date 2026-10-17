---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

树选择改用标准结构：新增 `treeSelectStructure` 与 `TreeSelectStructureOptions`，次序是标题、盒（触发器与可选的清空钮）、浮层里的树（可选的搜索框在前），多选时触发器里铺标签行。Vue / React 不写默认插槽时照它铺，不再要求先给 `collection`；Web Components 的 `<xh-tree-select>` 不写部件时连 `root` 生成整套节点，只写 `root` 时生成在它里面，标题可用 `slot="label"` 接管，并新增 `label` 与 `clearable` 两个属性，与 Vue / React 对齐。
