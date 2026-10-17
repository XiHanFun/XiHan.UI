---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

下拉的标准结构补上浮层里的空态、在途、取数失败的提示与重试钮：铺在列表之后，露哪一种按 `loading`、`error` 与条数收放，文字取 `translations`。语言包新增 `empty`（暂无数据）与 `loading`（加载中）。新增 `empty` 给空态文字（Web Components 是同名属性，React 给节点时整块接管），Vue 的 `empty` 插槽与 Web Components 的 `slot="empty"` 接管空态。手写的空态与在途占位留空时也填 `translations` 里的文字，与取数失败的提示、重试钮一致。
