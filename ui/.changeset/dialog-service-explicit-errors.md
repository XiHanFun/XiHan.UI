---
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

命令式对话框服务用独立 actionError 与 onActionError({ cause }) 暴露同步/异步动作异常，提供可本地化的 actionErrorText 实时提示；false 只表示业务阻止关闭。重试、取消、卸载和请求切换隔离过期动作与通知。

宿主初始化/挂载或正文渲染失败现明确 reject 原始原因，不再仅记录日志、解析成 false 或留下悬空 Promise；通知处理器失败拒绝所属请求。调用方必须处理服务 Promise 拒绝，并提供当前文档中已连接的 target。固定退场窗口将在独立任务中移除。
