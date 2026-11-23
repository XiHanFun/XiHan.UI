---
'@xihan-ui/vue': patch
'@xihan-ui/web-components': patch
---

**修复** 模态的 Popover（`modal`）在 Vue 与 Web Components 里锁的是页面，没有读配置里的 `scrollRoot`：宿主把滚动搬进内容容器时页面本身不滚，这把锁是空操作，浮层开着照样能把底下的内容滚走。现在与 Dialog、Drawer、Command 以及 React 的 Popover 一致，锁配置给的那一层（Web Components 沿祖先链取最近的 `<xh-config>`）。
