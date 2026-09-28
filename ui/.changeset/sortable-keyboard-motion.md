---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

Sortable 键盘重排时被拖那一项与让位的邻项同一段一起逐格滑（根投影 `data-drag-mode`）；放下或取消之后各项从原处滑回自己的排布位，取消时不再瞬间回位；指针放下的那一项仍由弹簧收进。
