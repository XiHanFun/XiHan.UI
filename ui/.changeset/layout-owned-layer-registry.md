---
'@xihan-ui/headless': major
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Layout 覆盖式侧栏的 Escape 层级判断改为读取所在运行时显式注入的
`RuntimeConfig.layerRegistry`，不再按机器 Scope 的 Document 另取默认注册表。使用自定义
LayerRegistry 时，上层浮层会先处理 Escape；默认注册表里的层不会串进这份自定义层栈。

`LayoutSchema.refs` 新增并公开 `LayoutRefs.config`。RuntimeConfig、LayerRegistry 与机器 Scope
必须属于同一 Document，缺少配置或混接会在副作用挂载时明确失败。Vue、React 与 Web Components
适配器都在机器 mount 前注入配置；Web Components 重连时会按元素当前 ownerDocument 重建。

直接启动 `layoutMachine` 的调用方必须先建立同源 Scope 与 RuntimeConfig，并在启动运行时之前注入：

```ts
const scope = createScope(root, idGenerator)
const service = createService(layoutMachine, { props, runtime, scope })
service.refs.set('config', createRuntimeConfig({ scope, idGenerator }))
runtime.start()
```
