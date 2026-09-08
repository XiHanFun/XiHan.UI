---
"@xihan-ui/react": minor
---

**React 适配器补上 `@xihan-ui/react/sound` 子入口。** 此前 Vue 有 `.` / `./backgrounds` / `./behavior` / `./sound` 四个子入口，React 只有 `.` 与 `./behavior`——声音层在 React 侧根本接不进来。

服务那一层与 Vue 完全同名同形：`getSoundPlayer` / `setSoundPlayer` 管共享播放器，`withToastSound` / `withDialogSound` 包一层现成的命令式服务，入队即发声、调用点一行不改，默认映射（`loading` 不发声、`confirm` 发 `open`、`update` 只在改了类型时响）与逐项改写、`autoUnlock` 的口径逐条对齐。

给单个元素配声的那一份换了介质：指令是 Vue 才有的，React 侧是 `useSoundOnPress`，返回一个挂到元素 `ref` 上的回调。传进去的值每次渲染现读，换语义名、换音量、换播放器都不解绑重绑；回调本身常驻，重渲染不会反复解绑。它按 React 19 的约定返回清理函数，因此与组件自己转发的 ref 合成之后照样能解绑——那条路上 `ref(null)` 不再被调用，只靠返回值这一条通道。

`@xihan-ui/sound` 是可选 peer，不装它主入口一行都不引。
