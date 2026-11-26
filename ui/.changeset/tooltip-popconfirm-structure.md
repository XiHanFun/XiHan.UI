---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Tooltip 与 Popconfirm 的标准结构：不写结构时（Vue 不写默认插槽、React 不给 children、Web Components 不写部件，Popconfirm 也可以只写 `root`）照 `tooltipStructure` / `popconfirmStructure` 铺出整套部件。Tooltip 只写 `trigger-text`（React 是 `trigger`）与 `content` 就是一条提示，content 里铺 `text` 与箭头；Popconfirm 写 `trigger-text`、`title`、`description` 与 `confirmText` / `cancelText`，铺出标题、说明、取消在确认之前的两颗钮与箭头，按钮文字缺省取新增的 `translations.popconfirm`（`ok` / `cancel`）。插槽内容写在同名插槽（React 是同名属性，Web Components 是宿主直接子节点上的 `slot="<名>"`）；Web Components 的 Popconfirm 标题写作 `title-text`。

React 与 Vue 的 `XhPopconfirmRoot` 上的 `title` 从此是标题内容，不再作为原生 `title` 特性落到根节点上。
