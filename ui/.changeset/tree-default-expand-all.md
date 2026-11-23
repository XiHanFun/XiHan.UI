---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 树与树选择的 `defaultExpandAll`（自定义元素写 `default-expand-all`）：一挂上就展开全部已有子项的分支；数据是后取的（挂载时 `collection` 还是空的）就等第一份数据到了再展开，只此一次。还没取回子项的懒分支不算在内，不会一挂上把每个懒分支都请求一遍；同时给了 `defaultExpandedValue` 时以它为准，受控时无效。运行中用 `expandAll()` / `collapseAll()`：连接层 API 上有，Vue 默认插槽与 React 函数式 children 的载荷里有，`<xh-tree>` / `<xh-tree-select>` 是同名方法。`@xihan-ui/headless` 另导出 `expandableBranches(collection)`，受控时把它的结果写进 `expandedValue` 即全部展开。
