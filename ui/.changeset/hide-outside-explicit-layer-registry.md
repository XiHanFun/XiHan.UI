---
'@xihan-ui/core': major
'@xihan-ui/headless': patch
---

`hideOutside(getTargets, config, options)` 现在要求 `config` 同时提供 Scope 与 `LayerRegistry`，并只订阅显式传入的注册表。调用方必须从 `config.layerRegistry` 查询 `elementsAbove`；自定义注册表的登记、释放与失败登记补偿现在都会立即重算背景失活状态，不再错误监听 Scope Document 的默认注册表。

LayerRegistry 新增只读 `ownerDocument`，注册表公共记录在创建后被冻结。`createRuntimeConfig` 与 `hideOutside` 都会拒绝注册表归属和 Scope Document 不一致的配置。Command、Dialog、Drawer 与 ImageViewer 已直接传入各自 RuntimeConfig；双注册表回归测试锁定只响应显式实例的行为，默认注册表、自定义注册表和跨 Document Scope 共用同一份明确合同。
