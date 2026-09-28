---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

ScrollArea 新增命令式滚动与两个通知。`scrollTo(options)` 滚动视口，参数与原生 `Element.scrollTo` 的对象形式同形（`top` / `left` / `behavior`），`orientation` 没管的那条轴忽略，`smooth` 在减弱动效下即刻到位；Vue 从组件实例（`expose`）与默认插槽取，React 从函数式 children 取，Web Components 的 `<xh-scroll-area>` 覆写 `scrollTo`，滚的是 viewport 而不是元素自己（数字形式按原生的 `(left, top)` 解读）。新增事件 `scroll-change`（`onScrollChange`）按轴报滚动量、`reach-end`（`onReachEnd`）在某条轴跨过末端那一下报一次，detail 为 `{ orientation, offset, max }`；两者不与原生 `scroll` 同名。Headless 新增 `ScrollAreaScrollDetails`、`ScrollAreaScrollToOptions`，`ScrollAreaApi` 新增 `scrollTo`；Scrollbar 机器新增 `onScrollChange` / `onReachEnd` 两个回调 props。
