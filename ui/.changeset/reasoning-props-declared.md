---
'@xihan-ui/headless': patch
---

`ReasoningProps` 补上三端早已支持的 `open`、`defaultOpen`、`autoDisclosure`、`disabled` 与 `onOpenChange`（与 tool-call 共用的状态机属性），类型与各适配器的实际接口一致；`disabled` 由此进入全局配置与逐实例等价的一致性检查。
