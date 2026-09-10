---
'@xihan-ui/core': major
---

Scope 不再把无锚点 SSR 或离线 Document 混入主页面 realm。空锚点在读取时没有有效全局 Document 会抛出稳定错误；所属 Document 没有活动 Window 时 `getWin()` 直接失败，不再回退全局 Window。
