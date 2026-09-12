---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Mention 与 TreeSelect 现在复用 Headless Presence 行为资源控制器：逻辑关闭立即令 content
`inert` 并退出可访问树，Layer、DismissableLayer 与 TreeSelect FocusScope 延后到全部有限 CSS
退场完成后释放；退场中重开复用原资源并重新激活 TreeSelect 焦点域。
