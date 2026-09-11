---
"@xihan-ui/core": major
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

Dialog 与共用机器的 Drawer 在退出期间立即失活内容，保持模态资源直到内容和遮罩实际完成退出，并提供 onExitComplete/exit-complete 通知。重开撤销旧退出且恢复原焦点域，卸载立即清理。

Presence.claimExit 删除 timeoutMs 参数，CSS 退出不再猜测声明时长或首个事件完成，而等待全部实际有限动画对象完成或取消；自定义租约必须由创建方完成或取消。FocusScope 增加 reactivate()，供保留中的焦点域恢复域内焦点。
