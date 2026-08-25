---
"@xihan-ui/vue": patch
---

进度条服务的宿主自己渲染，不再经 provide/inject 拿 api。

这棵子树是固定的三层、全归服务自己拥有，用上下文传 api 什么也没换来，
却把「跨模块 provide/inject 必须对得上」加成了一条本可以没有的前提。
模块被加载成两份时那条链会断，而报错指向的是 `XhLoadingBarTrack` 而不是真正的原因。

同时把挂载守卫做干净：失败后不再调 `app.unmount()`（`mount` 抛出时 Vue 并没把
`isMounted` 置真，卸载只会再吐一条警告），并让服务整体惰化——半挂载的树仍订阅着
响应式状态，继续写它只会让那棵残骸一遍遍重渲，每次都吐一串
「slot invoked outside of the render function」。
