# 轻提示 <Badge type="info" text="toast" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

单独一条通知：title 与 description 没写插槽内容时由 props 兜底；duration 给 0 即不自动消失

<XhDemo src="toast/01-basic" />

### 语气

type 落成 data-type，皮肤据此换色条；error 走 alert + assertive，loading 表示事情还没完、不自动消失

<XhDemo src="toast/02-type" />

### 计时与暂停

duration 走完自动退场；指针停在卡片上或焦点进到卡片里都会把计时按住，离开才接着走剩下那一段

<XhDemo src="toast/03-pause" />

### 操作按钮

action-trigger 按下时先发 action 事件，再让这条进入退场；closable 决定还要不要那颗叉

<XhDemo src="toast/04-action" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toast>` |
| Vue 组件 | `XhToastActionTrigger` `XhToastCloseTrigger` `XhToastDescription` `XhToastRoot` `XhToastTitle` |
| 组合式函数 | `useToast` |
| 状态机 | `toastMachine` |
| 皮肤 | `@xihan-ui/styled/toast.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="toast"`：**`root`** · `title` · `description` · `action-trigger` · `close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` |  | 队列身份。toaster 用它做 create/update/dismiss 的寻址键。 |
| `title` | `string` |  | 标题文本；作者没在 title 部件里写内容时由适配器填入。 |
| `description` | `string` |  | 补充说明；作者没在 description 部件里写内容时由适配器填入。 |
| `type` | `ToastType` |  | 语气，默认 info。error 走 alert + assertive，loading 不自动消失。 |
| `duration` | `number` |  | 停留毫秒，默认 5000。&lt;=0 或非有限数即不自动消失。 |
| `removeDelay` | `number` |  | 退场窗口毫秒，默认 200：进入 dismissing 后停留这么久再转 unmounted，留给退场动画。 |
| `closable` | `boolean` |  | 是否显示可用的关闭按钮，默认 true。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，默认 false。由 toaster 统一下发。 |
| `translations` | `Partial<ToastTranslations>` |  |  |
| `onStatusChange` | `(details: ToastStatusChangeDetails) => void` |  | 生命周期落位时通知：dismissing 与 unmounted 各一次。宿主据此把条目移出队列。 |
| `onAction` | `(details: ToastActionDetails) => void` |  | 操作按钮被按下。 |

## 状态机

**状态**：`visible` · `visible.running` · `visible.paused` · `dismissing` · `unmounted`

**事件**：`TOAST.DISMISS` · `TOAST.ACTION` · `TOAST.PAUSE` · `TOAST.RESUME` · `TOAST.RESET` · `after.duration` · `after.removeDelay`

**判据**：`isLastPauseSource`

## connect API

`useToast` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` |  |
| `status` | `ToastStatus` |  |
| `type` | `ToastType` |  |
| `title` | `string | undefined` |  |
| `description` | `string | undefined` |  |
| `paused` | `boolean` | 计时被按住中。样式层据此暂停进度条动画。 |
| `closable` | `boolean` |  |
| `remaining` | `number` | 剩余毫秒；不自动消失时为 Infinity。 |
| `dismiss` | `() => void` |  |
| `pause` | `() => void` |  |
| `resume` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getActionTriggerProps` | `() => T['button']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上且 closable | 立即进入 dismissing，走完 removeDelay 后转 unmounted |
| `Enter` / `Space` | focus 在 action-trigger 上 | 触发 onAction 并进入 dismissing |
