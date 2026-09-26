---
'@xihan-ui/core': minor
---

新增行为原语 `trackAppearance(el, release, { adopted })`：单个节点的出现随页面首屏就在时保持 `data-instant` 直接呈现，页面加载完成之后挂上、挂上时本就不可见、或首屏那一份第一次收起之后调用 `release`，此后每次显出都播进场。页面加载完成取文档的 `readyState`，服务端渲染后水合的节点由 `adopted` 标明。
