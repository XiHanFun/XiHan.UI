---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/web-components': patch
---

让 Vue 与 Web Components 的 Popconfirm 将真实 Presence 句柄交给共享 Popover 状态机。

逻辑关闭后内容立即失活，但 Layer、消解层与焦点域会继续保留到有限退场动画实际完成；
退场中重开复用同一组行为资源，卸载仍立即完整释放。
