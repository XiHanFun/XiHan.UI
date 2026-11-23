---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 表格的 `defaultExpandAll`（自定义元素写 `default-expand-all`），与树同一套规则：一挂上就展开全部可展开的行——有子行的，与声明了 `expandable` 的详情行；数据是后取的（挂载时 `rows` 还是空的）就等第一份数据到了再展开，只此一次。同时给了 `defaultExpandedValue` 时以它为准，受控时无效。运行中用 `expandAll()` / `collapseAll()`：连接层 API 上有，Vue 默认插槽与 React 函数式 children 的载荷里有，`<xh-table>` 是同名方法。`@xihan-ui/headless` 另导出 `expandableTableRows(rows)`，受控时把它的结果写进 `expandedValue` 即全部展开。
