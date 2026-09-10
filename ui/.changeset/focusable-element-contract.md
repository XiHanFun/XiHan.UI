---
'@xihan-ui/core': major
'@xihan-ui/headless': patch
---

新增公开 `FocusableElement = Element & HTMLOrSVGElement`，并统一 Scope、FocusScope、tabbable 工具与 `focusItem` 的焦点目标类型。`getTabbables` 的返回类型从不准确的 `HTMLElement[]` 修正为 `FocusableElement[]`，可聚焦 SVG/MathML 成为正式合同。

MessageFeed 的流外焦点候选同步采用 `FocusableElement`，不会再把原生查询可能返回的 SVG 强制断言成 HTMLElement。
