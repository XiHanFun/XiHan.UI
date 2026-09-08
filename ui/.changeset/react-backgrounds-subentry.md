---
"@xihan-ui/react": minor
---

**新增子入口** `@xihan-ui/react/backgrounds`：视觉层的 React 适配，与 Vue、Web Components 两家的同名子入口对齐。

`XhBackground` 是独立视觉组件，children 浮在效果之上，画布铺满根元素且 `pointer-events: none`；`as` 换标签，其余 props 与作者自己的 `ref` 照常落到根元素上。`useBackground` 把画面实例交到手上：返回的 `ref` 挂到哪个元素上，效果就铺在哪个元素上，`surface.current` 是底层画面，接自定义调度或调参面板走它。

`@xihan-ui/backgrounds` 是**可选 peer**，不用视觉效果的应用不会因为装了本包而多出一个 WebGL 引擎。

公开面比 Vue 那份少一项：Vue 有 `v-background`，React 没有对应物——指令是 Vue 才有的介质，把 `useBackground` 返回的 `ref` 挂到元素上就是同一件事，包括挂到别人的组件上。

两处接线与 Vue 不同，都是 React 的渲染模型逼出来的：`ref` 的身份跨渲染稳定，换身份会让 React 先用 `null` 调旧的、再用节点调新的，画面于是每渲染一次就销毁重建；props 的同步落在不给依赖数组的效应里，跟着依赖走的话，调用方原地改参数对象里的某一项收不到。
