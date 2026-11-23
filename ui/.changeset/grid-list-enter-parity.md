---
'@xihan-ui/headless': patch
---

**修复** 网格列表的 Enter 三端不一致：Vue 与 Web Components 里 Enter 恒为行主操作，React 却在作者没传 `onAction` 时把 Enter 当成选择。现在三端都按文档的约定走：Enter 恒为行主操作（没接 `action` 时什么也不做），选择只归 Space 与点行。只依赖 React 里 Enter 选中的用法，改按 Space。
