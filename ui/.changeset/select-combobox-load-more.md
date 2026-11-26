---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Select、Combobox 的触底加载 `onLoadMore`（Vue `@load-more`，Web Components `load-more` 事件）：浮层里的列表滚到末端时请求下一页，开了虚拟化时认视口。只在跨进末端那一下派发，停在末端不重复；在途、取数失败（Select）、禁用时不派发；新一页接上、内容变长之后再滚到底才派发下一次。内容不溢出时不派发，取下一页期间照旧只报 `aria-busy`。
