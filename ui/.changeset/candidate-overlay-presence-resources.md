---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

Cascader 与 Combobox 的 Layer、DismissableLayer 及 Cascader FocusScope 现在由 Headless 共享 Presence 资源控制器持有：逻辑关闭立即令 content `inert` 并退出可访问树，行为资源延后到全部有限 CSS 退场完成后释放；退场中重开会复用原 Layer，并重新激活 Cascader 焦点域。
