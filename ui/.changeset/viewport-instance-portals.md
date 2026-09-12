---
'@xihan-ui/react': minor
'@xihan-ui/vue': minor
---

补齐视口与特殊浮层的实例级 Portal 容器入口。

Vue Dialog、Command、ImageViewer、FloatingPanel 与 SideNav 分支，以及 React/Vue Tour，均可让实例
容器优先于应用配置；React SideNav 同步获得分支实例容器。Tour 的 backdrop、spotlight、positioner
共享根实例目标，避免三张表面被配置到不同容器。
