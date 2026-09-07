---
"@xihan-ui/react": minor
---

**再铺三个浮层：`drawer` / `popover` / `tooltip`；补上 `asChild`。已铺 8/126。**

三个都照 `useOverlay` 接：`drawer` 走模态那一路，`popover` 与 `tooltip` 走非模态。四条判据链全绿，三个组件的服务端直出**零豁免**。

**`asChild` 补齐了。** 触发器默认渲染 `<button>`，作者想用自己的按钮当触发器时只能往 `<button>` 里再套一个——那是非法嵌套，浏览器会拆开它，事件与焦点都不对。四个已铺触发器（dialog / drawer / popover / tooltip）都接上了。

写它的时候查出一处**三家之间没人管的行为分叉**：同名事件处理器的执行顺序，Vue 侧两条路是相反的——不开 `asChild` 时部件的先跑，开了 `asChild` 时作者的先跑。这一处没有任何判据在看：`asChild` 只有 Vue 自己一份用例，不在共享套件里，逐帧对拍也覆盖不到，三家可以各写各的顺序而没人会红。React 这一侧照 Vue 对齐（适配器之间对得上是这个库的头号契约，不该单方面另立一套），两种顺序都用例钉住。**这处不一致本身建议单独裁决**：作者想在机器动作前 `preventDefault`，开 `asChild` 时拦得住、不开就拦不住，而两边看着是同一个 `onClick`。

**全局配置此前到不了 React 的机器。** `withXhConfig` 拿 Proxy 接管 `translations` / `locale` / `size` 三个键，而 `useMachine` 里那次 `{ ...props }` 展开只带走自有键——React 的 props 只有作者真写了的那几个，与 Vue 那种「声明了就一定在」不同。作者没写 `translations` 时它不是自有键，展开就带不走，按组件名分桶的那份文案原地蒸发、组件回落到内建英文；`size` 的全局回落同理失效。Proxy 补上 `ownKeys` 与 `getOwnPropertyDescriptor` 两个陷阱之后才真正到得了。

这一档没有任何门禁看得见——`check-config-wiring` 只核「有没有调 `withXhConfig`」，核不到「调了之后有没有被展开丢掉」。实测过 Vue 侧不受影响（它的 props 声明保证了自有键），所以这是 React 独有的坑，现在由 `tests/config-provider.spec.tsx` 四条用例守着，摘掉那两个陷阱会红两条。

`tooltip` 的触发器与内容走原生监听器而非 React 合成事件：指针进出、按下与聚焦这几个事件 `bubbles` 为 false，而 React 的 `onXxx` 委派在根容器的冒泡阶段，收不到；Vue 与 WC 把处理器装在节点上所以照常触发。这一处只用在 `tooltip` 上，其余组件的处理器都冒泡。

`popover` 补上了自绘滚动条接线——`check-scrollbar-hosts` 在把它登记进铺开名单后立刻点名 React 是唯一没配的一家。
