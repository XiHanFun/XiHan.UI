---
'@xihan-ui/tokens': major
'@xihan-ui/headless': major
'@xihan-ui/react': major
'@xihan-ui/vue': major
'@xihan-ui/web-components': major
---

新增单一 `VisualEnvironmentController`，统一解析、继承、持久化并投影 mode、brand、density、dir、contrast、motion、transparency 七轴；根作用域可显式注入 motion sink 同步 JS 动效，局部作用域只影响自身 DOM 与 Portal 壳。`createThemeController` 改为七轴控制器的五轴视图，`contrast` 基线由无效的 `base` 更正为 CSS 正式值 `default`，启用 `storageKey` 必须提供 `onStorageError`。

移除三端 `XhConfig.motion` 隐式全局 override。React/Vue 配置改以带显式 root 的 `visualEnvironment` 绑定接线，Web Components 的全局配置接受同一绑定，`<xh-config>` 直接提供七轴局部 scope；嵌套配置不再污染兄弟树。
