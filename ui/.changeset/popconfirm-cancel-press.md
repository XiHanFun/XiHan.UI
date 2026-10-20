---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

Popconfirm 的取消事件 `cancel` 改名 `cancel-press`。原名与原生 `cancel` 事件同名：文件输入框取消选择时原生 `cancel` 会冒泡，监听 `cancel` 的地方会把它当成按了取消。新名与部件 `cancel-trigger` 对应，写法同热力图的 `datum-press`。

- headless：`onCancel` 改为 `onCancelPress`。
- Vue：`@cancel` 改为 `@cancel-press`；React：`onCancel` 改为 `onCancelPress`，根上不再拦原生 `onCancel`；Web Components：监听 `cancel-press`。
- 只有点了取消按钮才派发，Escape 与层外交互仍只派发 `open-change`；不带载荷。确认事件 `confirm`、方法 `cancel()` 与部件 `cancel-trigger` 不变。
