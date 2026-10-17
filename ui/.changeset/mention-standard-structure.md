---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

提及改用标准结构：新增 `mentionStructure` 与 `MentionStructureOptions`，次序是标题（原生 `<label>`）、单行输入框、浮层，浮层里是 `collection` 的候选（文字、有副文本时的副文本，行首行尾只在给了对应插槽时才铺）与空态（文字取 `translations.empty`）。Vue / React 不写默认插槽时照它铺，没给 `collection` 时也铺出输入框与浮层（原来什么都不渲）；Web Components 的 `<xh-mention>` 不写部件或只写 `root` 时生成整套节点，标题、空态、候选文字与行首行尾可用 `slot="label"`、`slot="empty"`、`slot="item:<值>"`、`slot="item-prefix:<值>"`、`slot="item-suffix:<值>"` 接管。三端新增 `label`：Vue 是标题文字与 `label` 插槽，React 可传任意节点，Web Components 是 `label` 属性；只在不写结构时使用。
