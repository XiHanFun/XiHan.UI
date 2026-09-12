---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

ContextMenu、Menu 与 Menubar 现在由 Headless Presence 生命周期持有行为资源：根菜单与各级子菜单分别等待自己的退出，Menubar 按菜单 value 精确配对当前 Layer owner；逻辑关闭立即令 content `inert` 并退出可访问树，退场中重开复用行为资源。
