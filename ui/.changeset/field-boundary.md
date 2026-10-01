---
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

新增字段边界 `XhFieldBoundary`（Web Components 为 `display: contents` 的 `<xh-field-boundary>`）：子树里的库内控件不再继承外层字段的标签、说明、禁用 / 只读 / 必填 / 无效与控件 id，表单字段组也一并断开。组合控件把内嵌的搜索框、筛选框包进来，它们就不会被读成外层字段的名字，两个封装同处一个字段时也不会拿到同一个 id。Vue / React 的浮层内容经 Portal 搬到落点后自动断开，与 Web Components 物理搬迁后的行为一致；Vue 另导出 `clearFieldContext()` 供组合式封装在 setup 里断开。
