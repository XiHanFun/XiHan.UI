---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

轻提示与通知分家：新增 notification，toast 收窄成操作反馈，toaster 删除。

原先 toast 一个组件担了两件事——「用户刚点了一下，告诉他结果」和「系统主动推来一条消息」。
两者的信息量、停留时长、落位习惯、谁触发都不一样，混在一起的结果是标题加正文两层文本、
九宫格落位、堆叠上限这些只有后者需要的东西全压在轻提示上，而轻提示自己反倒要靠一个
额外的容器组件才能用起来。

**通知（新增）**

```vue
<XhNotificationRoot v-slot="{ create, dismiss }">
  <XhNotificationGroup>
    <template #default="{ item }">
      <XhNotificationItem :id="item.id" :title="item.title" :description="item.description">
        <XhNotificationItemIndicator />
        <XhNotificationItemTitle />
        <XhNotificationItemDescription />
        <XhNotificationItemCloseTrigger />
      </XhNotificationItem>
    </template>
  </XhNotificationGroup>
</XhNotificationRoot>
```

队列与卡片是同一个组件的两层：`root`（队列的作用域包装）/ `group`（某个位置上的那一摞，也是 `role=region` 的地标）/ `item` 起是单条卡片。
九宫格落位、`max` 上限、同 id 就地改写、逐条计时与暂停都在这里。
Web Components 侧是 `<xh-notification>` 与 `<xh-notification-item>`。

单条卡片的生命周期复用 toast 那台机器——「会自己消失的卡片」这一行为与消息来源无关。

通知另有命令式的 `createNotificationService`：推送连接的回调、后台任务的收尾、
拦截器里的一条系统消息，调用点都在组件之外，让它们各自去找一份队列上下文并不现实。
队列要长在页面结构里（通知中心那一栏自己排版）时用组件形态，两者不共享队列。

**轻提示（收窄）**

- 解剖去掉 `description`：一次操作的结果一句话说得完，说不完的那是通知。
- 新增 `group` 部件：同时在场的几条叠成一摞。这一摞由全局服务渲染，没有对应的容器组件——
  反馈落在哪儿是整个服务的口径，不该让每个业务页面各挂一份容器再各自决定。
- `createToastService` 的队列改为服务内部私有，`info` / `success` / `warning` / `error` /
  `loading` / `create` / `update` / `dismiss` / `dismissAll` 签名不变，调用点零改动。
  服务选项新增 `placement`（默认 `top`）、`max`（默认 5）、`gap`。

**破坏性**

- 删除 toaster：`XhToasterRoot` / `XhToasterGroup` / `useToaster` / `<xh-toaster>` /
  `connectToaster` / `toasterMachine` / `toasterAnatomy` / `@xihan-ui/styles/toaster.css` 等
  一并移除。组件树内的通知队列改用 notification，命令式轻提示继续用 `createToastService`。
- toast 删掉 `description` 部件与 `getDescriptionProps`；`<xh-toast>` 的 `description` 属性同时移除。
  机器上的 `description` prop 保留——notification 的卡片复用同一台机器。
- `ToastOptions` / `ToastRecord` 不再带 `placement`：轻提示的落位归服务，不逐条各去一处。
- 覆盖槽 `--xh-toaster-inset` / `--xh-toaster-layer` 改名为 `--xh-notification-inset` /
  `--xh-notification-layer`；`--xh-toast-description-*` 随部件一起移除。
