---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

`tour` 以 Headless 的 Presence 租约作为退出生命周期真源：逻辑关闭立即让内容 `inert` 并退出可访问树，Layer、DismissableLayer 与焦点域会等气泡、遮罩和聚光灯的全部有限退场完成后才释放。退场期间不会再次接受 Escape 或层外交互；中途重开会结清旧租约、复用原 Layer 并重新激活焦点域，卸载立即释放资源。

三端均把真实的 content、backdrop 与 spotlight 接入同一份 Presence。Tour 不新增滚动锁、背景失活、退出完成事件或回调。
