---
'@xihan-ui/core': patch
---

**修复** 悬停展开的浮层：指针按正常速度从触发器移向浮层时不再半路收起。离开触发器后，浏览器紧接着派出的那次指针移动正好落在安全三角的顶点上，原先只把水平边上的点算在内，这一点被判成走岔，浮层当即收起；`pointInPolygon` 现在把任一条边与顶点上的点都算在内。受影响的是开了 `openOnHover` 的 Menu、各菜单的子菜单（Menu、ContextMenu、Menubar）与 SideNav 收起时的悬停浮层。
