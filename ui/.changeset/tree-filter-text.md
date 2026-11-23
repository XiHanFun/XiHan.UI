---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 树的关键词过滤 `filterText`（自定义元素写 `filter-text`）与 `filter`：检索词非空时树按它裁到只剩命中的那几枝——命中的节点连同整棵子树留下，祖先保留并自动展开；搜索里的展开单独记，不改写 `expandedValue`，清空检索词即回到原来的展开态。匹配规则缺省是标签大小写不敏感包含，`filter` 可换。手写的整棵树里没命中的节点由连接层带 `hidden` 收起，标准结构只铺留下的那几枝；一枝都没命中时空态露面。搜索时节点不可拖。连接层 API 与插槽载荷新增 `searching`，`@xihan-ui/headless` 新增类型 `TreeFilter`。此前要自己裁 `collection`、重铺标记并另记一份展开集合，现在把输入框的值交给 `filterText` 即可。
