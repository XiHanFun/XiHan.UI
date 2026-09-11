---
'@xihan-ui/core': minor
'@xihan-ui/headless': patch
---

新增 `createEscapeFallback(options)` 与 `EscapeFallbackOptions`，让不登记为 Layer 的覆盖界面使用显式 RuntimeConfig 参与 Document Hub 的 Escape 层级仲裁。每份 LayerRegistry lane 在 capture 阶段冻结 Layer 与 fallback token 快照；当时存在任意 Layer 即消费该 lane 的本次按键，空栈时才在 bubble 阶段复核并调用最近注册且启用的一个 fallback。目标节点取消或阻断原生事件、fallback 注册/启用换代、token ABA 与 Layer 空栈 ABA 都不会提交过期计划。

Layout 覆盖式侧栏改用该 fallback。相同 LayerRegistry 下同时展开多个侧栏时按最近展开顺序一键收一个；受控侧栏未写回时持续占位，inline 档动态跳过，上层 Layer 即使同步退栈也不会让同一次 Escape 继续关闭侧栏。
