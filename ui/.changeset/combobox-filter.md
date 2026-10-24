---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 组合框的内置过滤 `filter`：给了 `collection` 再写 `filter="contains"`（显示文本包含检索词）或 `filter="startsWith"`（以检索词开头），本地候选就按用户打的字筛，不必再自己接 `inputValue` 写过滤；两种口径都不分大小写，也可以给函数 `(node, query) => boolean` 自己判（Web Components 经 `filter` property 给函数，特性只认两种口径）。检索词是用户打的那段字：选中后输入框回显的选中项文字、`inputBehavior="autocomplete"` 补出的那段都不拿去筛，再展开看到全部候选；选中、提交自定义值、清空、失焦与表单重置时检索词作废。没写 `filter` 时行为不变，候选仍由调用方按 `onInputValueChange` 换，远程搜索照旧这么写。

`api.collection` 给了 `filter` 时是筛过的那份，标准结构、条数、空态、高亮与 Virtualizer 的 `count` 都以它为准；已选项的标签文字仍从全集取。headless 另导出 `filterComboboxNodes` 与 `ComboboxFilter`、`ComboboxFilterMode` 类型。

组合框的标准结构只在给了 `name` 或必填时才铺表单影子：两样都没有时影子既不提交也拦不住空表单，Web Components 只写 `root` 时也就不再留下一个没接线的空节点。
