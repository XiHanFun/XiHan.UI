---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

InfiniteScroll 新增 `edge`：缺省 `end` 在列表末尾往后取；`start` 在列表开头往前取（聊天历史、时间线往回翻），哨兵摆在列表开头。往前取数期间（`loading` 为 true 起、写回 false 之后再守两帧）组件盯住滚动容器，新内容插在前面时补上插入的高度，可视区离内容底部的距离不变，视口不跳。新增导出类型 `InfiniteScrollEdge`。
