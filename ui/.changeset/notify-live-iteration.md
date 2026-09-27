---
"@xihan-ui/core": patch
"@xihan-ui/motion": patch
"@xihan-ui/chat-stream": patch
"@xihan-ui/web-components": patch
---

订阅通知改为直接遍历订阅表，不再先拷一份快照：`setMotionOverride`、视觉环境控制器、`onXhConfigChange`、对话线程仓库的订阅者，在通知途中退订、还没轮到的不再收到这一轮；通知途中新订阅的在同一轮里也会收到。回调里退订自己照旧安全。
