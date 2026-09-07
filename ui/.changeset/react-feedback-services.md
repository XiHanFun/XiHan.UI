---
"@xihan-ui/react": minor
---

**React 侧交出另外三个命令式服务：`createToastService`、`createNotificationService`、`createLoadingBarService`。** 加上此前的对话框服务，四个服务面与 Vue 侧齐平——从组件树之外调起，自带宿主树，命令面与文案配置逐条对齐。

一处 Vue 与 React 的真实差别：`createRoot().render()` 是排队的，而 Vue 的 `app.mount()` 当场渲完。服务建好之后紧接着发的那条命令（`createToastService()` 下一行就 `toast.info(…)`，拦截器里很常见）在 React 这边找不到队列句柄，会被当成「宿主没挂起来」静默丢掉。首帧提交因此由 `flushSync` 包住。十三条用例里当时红了九条，红的正好全是「渲出来了吗」那一类——静默丢消息这件事不会自己冒头。

进度条那三条用例第一版盯的是 `data-loading`，而机器给的是 `data-state`（`idle` / `loading` / `finishing`），`null` 与 `null` 比，三条里有两条一路绿着什么也没核。改成盯 `data-state`，并把「在途计数不是布尔开关」钉进去：两笔并发只回来一笔时不该收。
