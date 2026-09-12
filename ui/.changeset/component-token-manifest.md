---
'@xihan-ui/styles': minor
'@xihan-ui/web-components': major
---

新增由 126 份独立组件皮肤实际 `var(public-slot, fallback)` 消费位生成的
`components.tokens.json`，逐项记录组件、部件、CSS 属性、状态、缺省来源、可见性与说明；
`@xihan-ui/styles/component-tokens` 同步提供可导入的 TypeScript 名称联合与 manifest 声明。

组件文档 CSS 变量表、Web Components CEM `cssProperties` 与公开面基线改读同一 manifest。
新门禁会从 CSS 重建 manifest 和类型，并逐组件核对文档与 CEM；未知、无组件归属或没有任何
fallback 事实源的公开覆盖槽直接失败，不使用数量阈值或豁免名单。

Web Components CEM 不再把 16 个全局设计令牌误报为组件 `cssProperties`；这些变量仍由
`@xihan-ui/tokens` 原名提供，应从全局设计令牌清单读取。CEM 同时补齐过去因多行 `var()` 或
跨组件消费而漏掉的 4 个真实组件覆盖槽。
