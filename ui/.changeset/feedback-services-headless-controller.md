---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

新增 Toast 与 Notification 命令式服务共享的框架无关 controller，统一管理服务级暂停、Toast id、行内动作回调、create/update/dismiss、真实退场回收、Promise 三态和 dispose 生命周期。

记录数组、max、priority 与 dedupe 继续由既有 notificationMachine 统一处理，没有新增第二套队列。三端公开 API、id、顺序、合并、挤条与渲染语义保持不变。
