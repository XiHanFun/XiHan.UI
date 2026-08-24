---
"@xihan-ui/vue": patch
---

thread 补导出 provideThread / useThreadContext，与孪生组件 log 对称。

thread 与 log 结构完全同构，log 一直导出着这一对，thread 却漏了。
后果是「用 useThread 自己起一份上下文、再拿官方部件铺 DOM」这条组合路径在 thread 上走不通——
拿不到 provideThread，XhThreadViewport / XhThreadContent 就 inject 不到东西。
