# 通知 <Badge type="info" text="notification" />

主动推给用户的一条消息：有标题、有正文，可以带操作按钮。

## 何时使用

- 系统或他人发起的消息：新评论、审批到达、任务跑完了。
- 后台完成的长任务：用户当时可能已经在做别的事。
- 一句话讲不完，需要标题加正文两层的信息。

## 何时不用

- 用户刚点了一下按钮，只要一句结果反馈：用[轻提示](./toast)。
- 用户必须处理才能继续：用[对话框](./dialog)阻断。
- 页面内某块区域的常驻状态说明：用[警告提示](./alert)。

## 特性

- 九宫格落位，`placement` 决定这一摞落在哪儿；也可以按条逐个指定。
- `max` 限制每个位置同时显示几条，超出的挤掉最旧的。
- 同一个 id 再发一次即就地改写，位置不动，用来做"处理中 → 已完成"。
- 每条自带计时与暂停：指针停在卡片上、或焦点落进去时不再走表。
- `duration` 给 0 即常驻不消失，适合需要用户处理的消息。

## 示例

### 基础用法

create 入队并返回 id，队列里的每条由作者渲染成一条通知；退场窗口走完只收起不删，宿主在 status-change 里把它移出队列

<XhDemo src="notification/01-basic" />

### 落位

placement 决定这一摞贴视口的哪个角，换的只是 group 上的 data-placement，队列本身不动

<XhDemo src="notification/02-placement" />

### 就地改写

同一个 id 再 create 一次是原地改写而不是新弹一条，位置不动；loading 不自动消失，换成 success 才开始倒计时

<XhDemo src="notification/03-update" />

### 上限与清空

max 限制每个位置同时显示几条，超出挤掉最旧的；dismissAll 把队列直接倒掉，不走退场窗口

<XhDemo src="notification/04-max" />

### 手动收走

create 返回的就是队列身份 id，存下来随时 dismiss 掉那一条；dismiss 直接移出队列，不走退场窗口

<XhDemo src="notification/05-manual-dismiss" />

### 逐条落位

单条通知自带 placement 就盖掉 notification 的默认落位；placements 报出眼下有条目的位置，一个位置一摞

<XhDemo src="notification/06-per-item-placement" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-notification>` |
| Vue 组件 | `XhNotificationGroup` `XhNotificationItem` `XhNotificationItemActionTrigger` `XhNotificationItemCloseTrigger` `XhNotificationItemDescription` `XhNotificationItemTitle` `XhNotificationRoot` |
| 组合式函数 | `useNotification` |
| 状态机 | `notificationMachine` |
| 皮肤 | `@xihan-ui/styles/notification.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="notification"`：**`root`** · **`group`** · `item` · `item-title` · `item-description` · `item-action-trigger` · `item-close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `NotificationRecord[]` |  | 受控队列：给了就由宿主说了算，内部写入只发 onItemsChange。 |
| `defaultItems` | `NotificationRecord[]` |  |  |
| `placement` | `NotificationPlacement` |  | 默认落位，默认 bottom-end。 |
| `max` | `number` |  | 每个位置最多同时留几条，超出挤掉最旧的。不给即不限。 |
| `gap` | `number` |  | 同一摞内的间距（px），默认 16。 |
| `duration` | `number` |  | 单条没写 duration 时的默认停留毫秒。 |
| `removeDelay` | `number` |  | 单条没写 removeDelay 时的默认退场窗口毫秒。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，逐条下发给 toast。 |
| `translations` | `Partial<NotificationTranslations>` |  |  |
| `onItemsChange` | `(details: NotificationItemsChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `items-change` | `NotificationItemsChangeDetails` | 队列变化；detail 为 `{ items: NotificationRecord[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhNotificationGroup` | `default` | `NotificationGroupSlotProps` |  |
| `XhNotificationItem` | `default` | `{ item: NotificationItemApi }` |  |
| `XhNotificationRoot` | `default` | `NotificationRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `item` | toStatus(state.get()) |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`ITEMS.CREATE` · `ITEMS.UPDATE` · `ITEMS.DISMISS` · `ITEMS.DISMISS_ALL`

## connect API

`useNotification` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visibleNotifications` | `ResolvedNotification[]` | max 之内、按加入先后排列的可见条目，已补齐默认值。 |
| `placements` | `NotificationPlacement[]` | 当前有条目的位置，按九宫格固定顺序。作者据此决定渲染哪几个 group。 |
| `count` | `number` |  |
| `getItemsByPlacement` | `(placement: NotificationPlacement) => ResolvedNotification[]` |  |
| `create` | `(options?: NotificationOptions) => string` | 入队并返回 id；同 id 已存在则就地改写，位置不动。 |
| `update` | `(id: string, options: Partial<NotificationOptions>) => void` |  |
| `dismiss` | `(id: string) => void` |  |
| `dismissAll` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getGroupProps` | `(props?: NotificationGroupProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.region |
| `root` | `role` | 'region' |
| `item` | `aria-atomic` | 'true' |
| `item` | `aria-describedby` | `description` 部件的 id |
| `item` | `aria-labelledby` | `title` 部件的 id |
| `item` | `aria-live` | 'assertive' \| 'polite' |
| `item` | `role` | 'alert' \| 'status' |
| `item-close-trigger` | `aria-label` | props.translations.close |

## 样式

默认皮肤 `@xihan-ui/styles/notification.css` 按部件选择：`[data-scope="notification"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-count` | list.length |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-count` | group.length |
| `group` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-placement` | props.placement |
| `item` | `data-paused` | ''（条件成立时才出现） |
| `item` | `data-state` | toStatus(state.get()) |
| `item` | `data-tone` | toneOf(type) |
| `item` | `data-type` | props.type |
| `item-close-trigger` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-notification-accent` · `--xh-notification-accent-width` · `--xh-notification-action-bg` · `--xh-notification-action-bg-active` · `--xh-notification-action-bg-hover` · `--xh-notification-action-border` · `--xh-notification-action-fg` · `--xh-notification-action-font-weight` · `--xh-notification-action-h` · `--xh-notification-action-px` · `--xh-notification-action-radius` · `--xh-notification-bg` · `--xh-notification-border` · `--xh-notification-close-bg-active` · `--xh-notification-close-bg-hover` · `--xh-notification-close-fg` · `--xh-notification-close-fg-hover` · `--xh-notification-close-radius` · `--xh-notification-close-size` · `--xh-notification-description-fg` · `--xh-notification-description-font-size` · `--xh-notification-fg` · `--xh-notification-font-size` · `--xh-notification-gap` · `--xh-notification-icon-size` · `--xh-notification-inset` · `--xh-notification-layer` · `--xh-notification-leading` · `--xh-notification-px` · `--xh-notification-py` · `--xh-notification-radius` · `--xh-notification-shadow` · `--xh-notification-title-fg` · `--xh-notification-title-font-size` · `--xh-notification-title-font-weight` · `--xh-notification-title-leading` · `--xh-notification-w`

## 动效

关键帧 `xh-notification-in` · `xh-notification-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 卡片可以放一个操作按钮（查看详情、撤销），按下即退场。
- 队列的增删改一并从根插槽给出，业务代码不必自己维护数组。

## 最佳实践

- 整个应用只挂一个队列，挂在最外层。
- 落位躲开固定的操作条与移动端手势区。
- 重要的那条把 `duration` 关掉，让用户自己收走。

## 反模式

- 拿它做操作反馈：一次点击弹出一张两层文本的大卡片，喧宾夺主。
- 每个页面各挂一个队列：多摞互相盖。
- `max` 设得太大，一屏被通知占满。
