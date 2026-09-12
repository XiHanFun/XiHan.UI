---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

新增框架无关的 LoadingBarService controller，统一管理并发在途计数、正常与错误语气、确定进度值，以及 finish、error、finishAll 和 dispose 的状态转换。

Vue、React 与 Web Components 的命令式 LoadingBar 服务改为消费同一份状态快照；公开 API 和进度条爬升、收尾及淡出视觉语义保持不变。
