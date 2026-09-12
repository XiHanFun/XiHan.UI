---
'@xihan-ui/vue': patch
---

删除普通类型 Vue prop 中与框架缺省行为等价的 `default: undefined`，保留 Boolean
三态转换所需的显式 undefined。组件 prop 值、公开类型与运行时行为不变，减少完整适配器
和按需组件产物中的重复选项字段。
