---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Form 增加独立的 validationError 状态和校验执行异常事件，保留原始 cause、值快照及触发字段。
同步抛错和异步拒绝都会结束当前快照的校验，不再产生未处理拒绝或卡在忙碌态，也不伪装成字段错误。
已启动异步规则后再遇到同步异常时，仍将整批 Promise 纳入拒绝处理，不遗漏随后失败的任务。
新校验、变值和重置清除旧异常，重试由业务显式触发。
三端均提供异常状态读取；Vue/Web Components 发出 validation-error，React 使用 onValidationError。
