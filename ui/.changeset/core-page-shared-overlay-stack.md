---
'@xihan-ui/core': patch
---

浮层层级栈（`getLayerRegistry`）、Esc 与外部点击的派发、焦点域与焦点哨兵、滚动锁、`aria-hidden` 引用计数改为页面级单例：实例挂在 Document 上，页面上同时装了几份 `@xihan-ui/core`（应用与设计器各自打包、或装了两个版本）时，Vue、React 与 Web Components 的浮层仍在同一个栈里，谁后打开谁在上面，焦点与 Esc 只作用在最上层，滚动锁与 `aria-hidden` 不会被另一份提前放开。此前每份 core 各有一份，各自从 0 数层级，后开的对话框可能被先开的盖住。
