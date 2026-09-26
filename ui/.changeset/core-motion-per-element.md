---
'@xihan-ui/core': major
---

减弱动效改按元素判断，容器上的 `data-motion` 对 JS 驱动的滚动同样生效：

- 贴底（`createStickToBottom`）的回到底部按滚动元素所在的作用域决定平滑还是瞬移。
- `resolveScrollBehavior(behavior, scope, target?)` 新增可选的滚动目标，给了就按它判断；`scrollBlockTo` 把容器（整页时是 `scrollingElement`）传进去。
- 删去 `RuntimeConfig.reducedMotion` 与 `createRuntimeConfig` 的同名选项：它只按窗口判断、看不到容器上的作用域，唯一的消费者（贴底）已改为按元素读 `resolveMotionPreference`。要强制减弱动效，在容器上写 `data-motion="reduce"` 或调用 `setMotionOverride('reduce')`。
