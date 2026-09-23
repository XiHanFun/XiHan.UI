---
'@xihan-ui/vue': patch
---

`withXhConfig` 不再写在 computed 里，`XhKbd` 在平台探测之后不会再丢掉全局配置。

`withXhConfig` 要调 `inject`，只能在 setup 期跑。`XhKbd` 把它写在了 `api` 这个 computed 的取值函数里：首次求值确实发生在 setup 期，但 `useKbdPlatform` 会在 `onMounted` 把探测到的平台写回 `detected`，`api` 随之失效，而下一次求值发生在同组件那个 `watchEffect` 的作业里——那时既没有 `currentInstance` 也没有 `currentRenderingInstance`。

于是每个 `XhKbd` 挂载后都会在开发期打一条 `[Vue warn] inject() can only be used inside setup() or functional components`，并且 `inject` 返回 `undefined` 时 `withXhConfig` 原样返回 props，`provideXhConfig` 注入的 `translations` 与 `locale` 被静默丢弃：键帽的读屏文案从作者提供的那份回落到内建英文，配置在别处生效、在它这里没反应，谁也不会报错。

`kbd` 这一侧改成在 setup 期包一次代理，源对象写成一组取值函数，`props` 与 `detected` 仍在求值期被追踪，响应性不变。

另外七个把 `withXhConfig` 写进 computed 的组件（`avatar-group`、`card`、`input-group`、`page-header`、`statistic`、`timeline`、`typography`）一并按 `badge` 的既有写法提到 setup 期。它们目前不报警——那几个 computed 只在渲染期被读，`currentRenderingInstance` 还在——但同一处接线只要哪天被渲染之外的读者碰到，就会重演 `kbd` 这一幕。
