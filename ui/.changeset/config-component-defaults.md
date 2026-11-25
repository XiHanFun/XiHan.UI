---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 全局配置的组件级缺省 `defaults`：按组件名分桶，如 `{ 'text-field': { variant: 'subtle', clearable: true }, button: { tone: 'neutral' } }`。实例没写的 prop 取这里的值，优先于应用级的 `size` 与 `locale`；嵌套的 `provideXhConfig` / `XhConfigProvider` / `<xh-config>` 按组件逐键合并，内层胜出。没写过的布尔 prop 同样取得到缺省：Vue 不被裸 `Boolean` 的 `false` 挡住，Web Components 不被交给状态机前收成的 `false` 挡住。只收外观与行为开关，`value`、`default*` 初值、`on*` 回调与 `translations` 写在这里不生效。

- `<xh-config>` 新增 property `defaults`（对象只能经 property 设置）。
- headless 导出 `componentDefault` 与类型 `XhComponentDefaults`；`fillXhConfigDefaults` / `withXhConfigBase` 多一个可选参数 `isSet`，由适配器告诉它作者写没写过某个 prop。
- Vue / React 的 `withXhConfig` 组件名参数放宽为任意字符串；Highlight 三端补接全局配置，Vue 的 Reasoning / ToolCall 的形态与语气改从合并后的配置读取。
