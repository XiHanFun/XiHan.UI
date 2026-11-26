---
'@xihan-ui/core': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

**新增** `@xihan-ui/core/presence` 的 `createExitGate`：退场闸门（presence 租约、退场节点的 CSS 探测对账、首次展开等浮层按需块）收进 core。Vue 的 `useOverlayExit`、React 的 `useOverlay` / `useOverlayExit` 与 Web Components 的浮层元素都改用它，各端只管几时调 `track` / `update`，行为不变。
