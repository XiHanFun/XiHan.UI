---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

级联选择改用标准结构：新增 `cascaderStructure` 与 `CascaderStructureOptions`，次序是标题、盒（触发钮，`clearable` 时带清空钮）、浮层。触发钮里是值串、多选的标签行（只作展示，摆不下的折进 +N）与展开箭头；浮层里开了 `searchable` 时先是搜索框与候选列表，再是当前展开的各列（懒分支那一列末尾带在途、失败与重试三块），末尾是空态与在途占位。Vue / React 不写默认插槽时照它铺，表单影子仍由根按选中路径装配；Web Components 的 `<xh-cascader>` 不写部件或只写 `root` 时生成整套节点，标题可用 `slot="label"` 接管。三端新增 `label` 与 `clearable`：Vue 的 `label` 是标题文字与 `label` 插槽，React 可传任意节点，Web Components 是 `label` 属性；两者只在不写结构时使用。
