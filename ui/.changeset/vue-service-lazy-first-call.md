---
'@xihan-ui/vue': patch
---

**命令式服务在组件 `onMounted` 里懒建后，第一条命令不再撞上 SEND_BEFORE_MOUNT。** 冷启动直接打开在 `onMounted` 里报错的页面（OAuth 回调失败页）时，`toast.danger()` 抛 `[xh:machine:SEND_BEFORE_MOUNT] (notification)`；先在别处弹过一次再进该页反而正常。

宿主的 mounted 回调排在 Vue 的 post-flush 队列里，从业务组件的 `onMounted` 里 `app.mount` 宿主时会被追加到那条队列的队尾，要等调用方的 `onMounted` 返回后才跑；而服务端口在 setup 已接上，中间发出的命令机器还没 start。`useMachine` 新增第四个参数 `{ start: 'setup' }`，只给没有 DOM 锚点的机器：toast 与 notification 服务宿主的队列机器在 setup 里当场 start。组件照旧缺省等 mounted。
