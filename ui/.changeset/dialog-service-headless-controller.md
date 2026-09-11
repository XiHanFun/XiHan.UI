---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

新增框架无关的 DialogService controller，统一管理请求排队、单次结算、真实退出身份、动作 attempt 与宿主失败或卸载时的队列清场。

Vue、React 与 Web Components 的 DialogService 改为共享该控制器；各端公开 API、Promise 结算时点、动作错误语义及渲染结构保持不变。
