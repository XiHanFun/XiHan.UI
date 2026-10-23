---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 分页的标准结构 `paginationStructure`：Vue / React 不写默认插槽、Web Components 不写部件（或只写 root）时，按它铺出上一页、按当前页折叠后的页码序列（被折叠的一段是省略位）与下一页，翻页后按页码复用节点，`<XhPaginationRoot :count="196" :page-size="10" />` 一行即可用。Web Components 不必再监听 `page-change` 手动重排页码按钮。首末页钮、跳页框、每页条数与省略位的展开面板不在标准结构里，要用时照旧整棵手写。
