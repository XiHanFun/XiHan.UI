---
"@xihan-ui/headless": minor
"@xihan-ui/vue": patch
"@xihan-ui/react": patch
"@xihan-ui/web-components": patch
---

Headless 新增纯数据投影 `groupJsonViewerNodesByParent` / `JsonViewerNodesByParent` 与 `diffViewSides` / `DiffViewSides`，供自定义 JsonViewer 和 DiffView 渲染器复用与官方三端保持一致的数据形状。

Vue、React 与 Web Components 删除各自重复的父路径分组和差异列序实现，改为调用 Headless 投影；DOM 结构、渲染顺序和公开组件 API 保持不变。
