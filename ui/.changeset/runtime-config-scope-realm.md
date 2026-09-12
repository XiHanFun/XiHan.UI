---
'@xihan-ui/core': patch
---

`createRuntimeConfig({ scope })` 的默认 locale、LayerRegistry、PortalRoot 与 reduced-motion 改从显式 Scope 所属的 document/window 派生，不再错误使用主页面全局对象。显式配置仍具有最高优先级。

无全局 DOM 时必须提供 root/document/window 一致的有效 Scope；只提供 layer registry 不再构造不可用的空 Scope。默认 PortalRoot 缺少 Document.body 时会抛出稳定错误。

DOM 类型守卫在顶层构造器缺失时改用节点所属 Window 的 Web IDL getter，因此有效的外部 Scope 在真实 SSR 宿主中仍能通过严格品牌检查。
