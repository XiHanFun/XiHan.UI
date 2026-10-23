---
'@xihan-ui/vue': minor
---

**新增** 两个子入口，按需选用：`@xihan-ui/vue/resolver` 提供 unplugin-vue-components 的解析器 `XiHanUIResolver()`，模板里用到的 Xh 组件在编译期按需从主入口导入，不必手写 import，也不放弃摇树；`@xihan-ui/vue/plugin` 提供全量注册插件 `XiHanUI`，`app.use(XiHanUI)` 后模板里直接写 `<XhButton>` / `<xh-button>`，引入插件模块的同时给 `GlobalComponents` 补上全部组件的类型，Volar 与 vue-tsc 在模板里直接校验 props。全量注册会让全部组件进产物；按名称 import 仍是缺省写法。
