---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

`image-viewer` 现在以 Headless 的 Presence 租约为退出生命周期真源：逻辑关闭立即让内容 `inert` 并退出可访问树，内容和遮罩的全部有限退场完成后才释放 Layer、焦点域、滚动锁与背景失活。退场期间不会再次响应 Escape 或外部交互；重开撤销旧租约并重新激活原焦点域，卸载立即释放资源。

三端均追踪 content 与 backdrop 的退出租约，避免一侧提前完成就提前卸载；不新增 ImageViewer 的退出完成公开事件或回调。
