---
'@xihan-ui/styles': patch
---

Drawer 的关闭钮行向先让出安全区再距边 16px：面板已按 `env(safe-area-inset-*)` 让出横屏刘海那一段，叉却仍从面板内边距盒的边量 16px，落进了安全区。局部容器里（`contained`）的抽屉安全区归零，仍是 16px；Dialog 补同一组私有槽（恒为 0），落点不变。
