---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 警告提示的标准结构：不写结构时（Vue 不写默认插槽、React 不给 children、Web Components 不写部件或只写 `root`）照 `alertStructure` 铺出图标、文本列、操作区与关闭钮，只写 `title` 与 `description` 两个属性就是一条完整的提示。文本列恒铺，里面给了标题、说明才铺对应一段，root 的名字与描述只指向铺出来的那几段；图标与操作区来自 `indicator`、`action` 插槽（React 是同名属性，可以是任意节点）；写了 `closable` 才在末尾铺关闭钮，不写不替你添一颗叉。Web Components 的标题文字写作 `title-text`（宿主上的全局 `title` 会出浏览器原生提示），插槽内容写在宿主直接子节点的 `slot="<名>"` 上。

React 的 `XhAlertRoot` 与 Vue 的 `XhAlertRoot` 上的 `title` 从此是标题内容，不再作为原生 `title` 特性落到根节点上。
