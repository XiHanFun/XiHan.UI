---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

TreeSelect 新增浮层内搜索：`searchable` 打开 `input` 部件（放在 content 中、tree 之前），展开时焦点先落在搜索框上；输入即按 `filter`（缺省为标签大小写不敏感包含）把树裁到只剩命中节点，命中节点保留整棵子树、祖先自动展开，搜索中的展开单独记、不改写 `expandedValue`。手写的整棵树里没命中的节点由连接层带 `hidden` 收起，键盘导航只走命中的那几枝；无命中时空态改说新文案 `translations.noMatch`，搜索框可及名取 `translations.searchInput`。树里打可打印字符接到检索词末尾并把焦点交回搜索框，下方向键从框进树，Escape 先清空检索词，收起浮层即清空。新增 `api.searching` / `inputValue` / `setInputValue` 与 `getInputProps()`；Vue / React 新增 `XhTreeSelectInput`，自动结构在 `searchable` 时铺出搜索框；Web Components 新增 `searchable` 属性、`filter` property、`input` 角色、`searching` / `inputValue` 读口与 `setInputValue` 方法。样式槽 `--xh-tree-select-input-*` 与 `--xh-tree-select-search-divider`。浮层的滚动面从整块 content 改为 tree（与 Select 的 list 同一做法）：content 只作外壳，搜索框与底部操作区钉在树的上下沿不随行滚走，三端的自绘滚动条改接在树上。
