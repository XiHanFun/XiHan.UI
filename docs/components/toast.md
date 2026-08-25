# 轻提示 <Badge type="info" text="toast" />

一条会自己消失的短反馈。

## 何时使用

- 一次操作的结果："已保存"、"已复制"、"发送失败"。
- 反馈重要但不需要打断用户。

## 何时不用

- 用户必须知道并处理：用[警告提示](./alert)让它常驻，或用[对话框](./dialog)阻断。
- 内容较长、分标题与正文两层，或不是用户点出来的：用[通知](./notification)。

## 特性

- `duration` 决定停留时长，指针悬停或页面失焦时计时暂停。
- 可以带一个操作按钮（撤销、查看详情）。
- `type` 决定语气，排版与图标可自定。

## 示例

### 基础用法

一条卡片一句话：title 部件留空时由属性上的文案填入；duration 给 0 即不自动消失

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

### 图标与自定义排版

卡片里排什么由作者定：图标与标题排成一行，标题部件的内容归作者写

<XhDemo src="toast/05-icon" />

### 全局服务

轻提示没有容器组件，那一摞由 createToastService 渲染；模块作用域随处可调（请求拦截器、store）

<XhDemo src="toast/06-service" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toast>` |
| Vue 组件 | `XhToastActionTrigger` `XhToastCloseTrigger` `XhToastRoot` `XhToastTitle` |
| 组合式函数 | `useToast` |
| 状态机 | `toastMachine` |
| 皮肤 | `@xihan-ui/styles/toast.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="toast"`：**`root`** · `title` · `action-trigger` · `close-trigger` · `group`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` |  | 队列身份。服务档用它做 create/update/dismiss 的寻址键。 |
| `title` | `string` |  | 标题文本；作者没在 title 部件里写内容时由适配器填入。 |
| `description` | `string` |  | 补充说明。轻提示自己不出这一层——两层文本是 notification 的活； 这条 prop 留着是因为 notification 的单条卡片复用同一台机器。 |
| `type` | `ToastType` |  | 语气，默认 info。error 走 alert + assertive，loading 不自动消失。 |
| `duration` | `number` |  | 停留毫秒，默认 5000。&lt;=0 或非有限数即不自动消失。 |
| `removeDelay` | `number` |  | 退场窗口毫秒，默认 200：进入 dismissing 后停留这么久再转 unmounted，留给退场动画。 |
| `closable` | `boolean` |  | 是否显示可用的关闭按钮，默认 true。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，默认 false。由服务档统一下发。 |
| `translations` | `Partial<ToastTranslations>` |  |  |
| `onStatusChange` | `(details: ToastStatusChangeDetails) => void` |  | 生命周期落位时通知：dismissing 与 unmounted 各一次。宿主据此把条目移出队列。 |
| `onAction` | `(details: ToastActionDetails) => void` |  | 操作按钮被按下。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `ToastStatusChangeDetails` | 生命周期落位；detail 为 `{ id: string, status: 'dismissing'\|'unmounted' }` |
| `action` | `ToastActionDetails` | 操作按钮被按下；detail 为 `{ id: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToastRoot` | `default` | `ToastRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | toStatus(state.get()) |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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
| `title` | `string \| undefined` |  |
| `paused` | `boolean` | 计时被按住中。样式层据此暂停进度条动画。 |
| `closable` | `boolean` |  |
| `remaining` | `number` | 剩余毫秒；不自动消失时为 Infinity。 |
| `dismiss` | `() => void` |  |
| `pause` | `() => void` |  |
| `resume` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getActionTriggerProps` | `() => T['button']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上且 closable | 立即进入 dismissing，走完 removeDelay 后转 unmounted |
| `Enter` / `Space` | focus 在 action-trigger 上 | 触发 onAction 并进入 dismissing |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-atomic` | 'true' |
| `root` | `aria-labelledby` | `title` 部件的 id |
| `root` | `aria-live` | 'assertive' \| 'polite' |
| `root` | `role` | 'alert' \| 'status' |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式

默认皮肤 `@xihan-ui/styles/toast.css` 按部件选择：`[data-scope="toast"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-paused` | ''（条件成立时才出现） |
| `root` | `data-state` | toStatus(state.get()) |
| `root` | `data-tone` | toneOf(type) |
| `root` | `data-type` | props.type |
| `close-trigger` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-toast-accent` · `--xh-toast-accent-width` · `--xh-toast-action-bg` · `--xh-toast-action-bg-active` · `--xh-toast-action-bg-hover` · `--xh-toast-action-border` · `--xh-toast-action-fg` · `--xh-toast-action-font-weight` · `--xh-toast-action-h` · `--xh-toast-action-px` · `--xh-toast-action-radius` · `--xh-toast-bg` · `--xh-toast-border` · `--xh-toast-close-bg-active` · `--xh-toast-close-bg-hover` · `--xh-toast-close-fg` · `--xh-toast-close-fg-hover` · `--xh-toast-close-radius` · `--xh-toast-close-size` · `--xh-toast-fg` · `--xh-toast-font-size` · `--xh-toast-gap` · `--xh-toast-icon-size` · `--xh-toast-inset` · `--xh-toast-layer` · `--xh-toast-leading` · `--xh-toast-px` · `--xh-toast-py` · `--xh-toast-radius` · `--xh-toast-shadow` · `--xh-toast-title-fg` · `--xh-toast-title-font-size` · `--xh-toast-title-font-weight` · `--xh-toast-title-leading` · `--xh-toast-w`

## 动效

关键帧 `xh-toast-in` · `xh-toast-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 没有容器组件：那一摞由全局服务渲染，业务代码 `toast.success('已保存')` 一行调用即可。

## 最佳实践

- 破坏性操作配"撤销"按钮，比事前确认对话框体验好得多。
- 错误类的提示停留久一点，或干脆不自动消失。

## 反模式

- 把错误详情放进轻提示：用户还没读完就没了。
- 同一个动作连发好几条。
