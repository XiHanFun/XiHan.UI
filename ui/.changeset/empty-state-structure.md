---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 空状态的标准结构：不写结构时（Vue 不写默认插槽、React 不给 children、Web Components 不写部件或只写 `root`）照 `emptyStateStructure` 铺出插画、图标、标题、说明与操作，给了哪段才铺哪段，只写 `title` 与 `description` 两个属性就是一块完整的空状态。标题与说明取 `title`、`description` 或同名插槽，插画、图标与操作区来自 `media`、`indicator`、`action` 插槽（React 是同名属性，可以是任意节点）。Web Components 的标题文字写作 `title-text`（宿主上的全局 `title` 会出浏览器原生提示），插槽内容写在宿主直接子节点的 `slot="<名>"` 上。

React 的 `XhEmptyStateRoot` 与 Vue 的 `XhEmptyStateRoot` 上的 `title` 从此是标题内容，不再作为原生 `title` 特性落到根节点上。
