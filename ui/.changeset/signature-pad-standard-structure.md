---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

签名板改用标准结构：新增 `signaturePadStructure` 与 `SignaturePadStructureOptions`，次序是标题、画布（基准线与笔迹）、清空按钮、状态，给了 `name` 再带表单影子；清空按钮的字与状态句取 translations，撤销与重做按钮不在其中。Vue / React 不写默认插槽时照它铺；Web Components 的 `<xh-signature-pad>` 不写部件或只写 `root` 时生成整套节点，标题可用 `slot="label"` 接管。三端新增 `label`：Vue 是标题文字与 `label` 插槽，React 可传任意节点，Web Components 是 `label` 属性，只在不写结构时使用。`SignaturePadApi` 新增 `translations`（合上覆盖后的文案）。标准结构的标签新增 SVG 图元 `svg`、`line`、`path`，Web Components 按 SVG 命名空间生成，作者手写的 SVG 部件也算作者写了结构。
