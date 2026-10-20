---
'@xihan-ui/web-components': minor
---

**新增** `@xihan-ui/web-components/authoring` 导出 `notifyXhConfigChange` 与类型 `XhConfigScope`、`XhConfig`。自定义元素声明 `xhConfig` 字段即可当一层配置作用域（如设计器单独设语言）；改了它就调 `notifyXhConfigChange(this)`，它子树里已渲染的元素（含搬进 Portal 的浮层内容）照新配置重画，不调则照旧。
