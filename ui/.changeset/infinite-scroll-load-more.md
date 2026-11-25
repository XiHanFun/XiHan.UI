---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** InfiniteScroll「该取下一页了」的通知从 `onLoad` 改叫 `onLoadMore`：旧名与原生 `load` 事件同名，Web Components 上列表里图片冒泡上来的 `load` 会混进来，React 的根也因此占掉了原生 `onLoad`。

| 旧名 | 新名 |
| --- | --- |
| `onLoad`（Vue `@load`，WC 事件 `load`） | `onLoadMore`（Vue `@load-more`，WC 事件 `load-more`） |
