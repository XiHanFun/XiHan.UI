---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

NavigationMenu 逻辑关闭后不再立刻释放 Layer 与消解层：三端当前面板的退出 presence 完成前，
资源继续保持；退场中重开会撤销旧完成订阅并复用原 Layer。该修正不改变 NavigationMenu 的
公开 props、事件、Portal 或视觉环境轴。
