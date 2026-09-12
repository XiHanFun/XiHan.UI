---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Pagination 的省略位面板与 SideNav 的折叠弹出面板现由 Headless 按视觉 Presence 管理真实退出资源。
逻辑关闭立即令内容 `inert` 并退出可访问树，Layer、DismissableLayer 与 SideNav 可选 FocusScope
在对应退出完成前保持；SideNav 按分支身份登记 Presence，换枝时两份资源并存，旧层退出就绪后等待
重新成为栈顶再安全释放，旧完成信号不会误拆新会话。
