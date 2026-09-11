---
'@xihan-ui/core': minor
---

`createScope` 新增动态 Element getter 输入，供框架在 setup 阶段创建稳定 Scope、待真实组件根节点就位后再解析 DOM realm。
Scope 的 `id` 与部件 ID 在节点变化时保持不变；root、Document、Window、ID 查询、活动焦点与计算样式每次从当前真实节点解析，不缓存旧 realm。

静态 `null` 继续使用既有的 ambient Document 语义。动态 getter 返回 `null`/`undefined` 时明确抛出
`[xh] Scope 的动态锚点尚未就绪`，不会静默回退到主 Document；返回非 Element 值同样明确拒绝。
