# Notification 通知

到期自行消失的一条消息：一枚状态字形、标题与可选的说明，可以带一个操作按钮。两种预设：卡片（`card`）承载主动推送的两层消息，轻提示（`toast`）是刚才那个操作的一句结果。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/notification" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/notification.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/notification" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/notification" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/notification.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

create 入队并返回 id，队列中的每条由作者渲染为一条通知；退场动画播完后只收起不删除，宿主在 status-change 中把它移出队列

<XhDemo src="notification/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="notification"`：**`root`** · **`group`** · `item` · `item-indicator` · `item-content` · `item-title` · `item-description` · `item-action-trigger` · `item-progress` · `item-close-trigger`

## 示例

### 落位

placement 决定该堆叠贴视口的哪个角，更换的只是 group 上的 data-placement，队列本身不变

<XhDemo src="notification/02-placement" />

### 就地改写

同一个 id 再次 create 是原地改写而不是新弹出一条，位置不变；loading 不自动消失，换为 success 后才开始倒计时

<XhDemo src="notification/03-update" />

### 上限与清空

max 限制每个位置同时显示几条，超出时移除最旧的；dismissAll 直接清空队列，不播退场动画

<XhDemo src="notification/04-max" />

### 手动关闭

create 返回的就是队列身份 id，保存后可随时 dismiss 该条；dismiss 直接移出队列，不播退场动画

<XhDemo src="notification/05-manual-dismiss" />

### 逐条落位

单条通知自带 placement 即覆盖 notification 的默认落位；placements 报告当前有条目的位置，一个位置一个堆叠

<XhDemo src="notification/06-per-item-placement" />

### 轻提示预设

preset="toast" 换成一句话的轻提示：落底部居中、最多 3 条、叠成一摞，鼠标或焦点进入即展开；卡片要把队列交下来的 preset 带上

<XhDemo src="notification/07-toast" />

### 全局服务

createNotificationService 自带宿主，传 preset: 'toast' 即轻提示；模块作用域随处可调用（请求拦截器、store）

<XhDemo src="notification/08-service" />

### 计时与暂停

duration 结束后自动退场；指针停在卡片上或焦点进入卡片内都会暂停计时，离开后继续剩余部分；单条卡片也可以单独摆放

<XhDemo src="notification/09-pause" />

### 操作按钮

item-action-trigger 按下时先发 action 事件，再使该条进入退场；破坏性操作配“撤销”优于事前确认

<XhDemo src="notification/10-action" />

## 设计指引

### 何时使用

- 一次操作的结果：“已保存”“已复制”“发送失败”，用轻提示预设。
- 系统或他人发起的消息：新评论、审批到达、后台任务完成，用卡片预设。
- 反馈重要但不需要打断用户。

### 何时不用

- 用户必须处理才能继续时，使用[对话框](./dialog)阻断。
- 页面内某块区域的常驻状态说明使用[警告提示](./alert)。
- 需要持续阅读的长内容不放进轻提示，改用卡片预设或页面内的说明。

### 特性

- `preset` 决定一组缺省值：卡片落右下、每个位置最多 5 条、逐条排开、停留 5000ms；轻提示落底部居中、最多 3 条、叠成一摞、停留 4000ms，页面转入后台时暂停计时。每一项都可以用同名 prop 单独改写。
- 九宫格落位，`placement` 决定整摞的位置，也可以逐条指定。
- 正文（`item-description`）有上限：缺省是中档滚动面高（`--xh-viewport-h-md`，16rem），长文在正文里竖滚、滚到头不带动页面，标题与操作钮留在卡片上；`--xh-notification-description-max-h` 可以改这条上限。整摞是不吃指针、不裁切的视口定位面，撑出视口的部分既看不到也滚不到，所以卡片不随正文无限长高。
- `max` 限制每个位置同时显示的条数，超出时先挤出低优先级，同级中挤出最旧的；设为 `Infinity` 即不限制。
- 同一个 id 再次发出即就地改写，位置不变，用于“处理中 → 已完成”；`loading` 期间换为加载环且不自动消失。
- 每条自带计时与暂停：指针停在卡片上或焦点进入时暂停计时。`duration` 为 0 时常驻不消失。
- `stacked` 把同一位置的几条叠成一摞：最新一条在最前，后层按层深收拢；鼠标或焦点进入后按真实高度展开，整摞计时一并按住，`Escape` 收起。
- 轻提示预设的关闭按钮排在行尾，可悬停设备上悬停或焦点进入卡片时才显示；卡片预设的关闭按钮钉在右上角。

### 组合

- 卡片的文本列是 `item-content`，内部组合 `item-title` 与可选的 `item-description`。
- 卡片可以放一个操作按钮（查看详情、撤销），按下即退场。
- 队列的增删改由根插槽统一给出，业务代码不需要自行维护数组；命令式服务 `createNotificationService` 自带宿主，`preset` 传给它即得到同一种形态。

### 最佳实践

- 整个应用每种预设只挂一个队列，挂在最外层。
- 破坏性操作配“撤销”按钮，体验优于事前确认对话框。
- 错误类消息停留更久，或把 `duration` 设为 0，由用户自行关闭。
- 落位避开固定的操作条与移动端手势区。

### 反模式

- 把错误详情放进轻提示，用户尚未读完就消失。
- 用卡片做一次点击的结果反馈：两层文本的大卡片喧宾夺主。
- 同一个动作连续发出多条，或每个页面各挂一个队列、多摞互相遮盖。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-notification>` |
| Vue 组件 | `XhNotificationGroup` `XhNotificationItem` `XhNotificationItemActionTrigger` `XhNotificationItemCloseTrigger` `XhNotificationItemContent` `XhNotificationItemDescription` `XhNotificationItemIndicator` `XhNotificationItemProgress` `XhNotificationItemTitle` `XhNotificationRoot` |
| 组合式函数 | `useNotification` |
| 状态机 | `notificationMachine` |
| 皮肤 | `@xihan-ui/styles/notification.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `NotificationRecord[]` |  | 受控队列：提供后由宿主决定，内部写入只发 onItemsChange。 |
| `defaultItems` | `NotificationRecord[]` |  |  |
| `preset` | `NotificationPreset` |  | 形态预设，默认 card。决定下面几项未写时的缺省值，以及卡片排版与关闭钮档位。 |
| `placement` | `NotificationPlacement` |  | 默认落位：card 为 bottom-end，toast 为 bottom。 |
| `max` | `number` |  | 每个位置最多同时保留几条，超出时先移除低优先级、同级中移除最旧的。card 为 5、toast 为 3；提供 Infinity 即不限。 |
| `dedupe` | `NotificationDedupe` |  | 重复的处理方式，默认 'id'。 |
| `gap` | `number` |  | 同一组内的间距（px）：card 为 16、toast 为 12。 |
| `duration` | `number` |  | 单条未写 duration 时的默认停留毫秒：card 为 5000、toast 为 4000。 |
| `stacked` | `boolean` |  | 同一位置的几条叠成一摞：最新的一条在最前，后层按层深收拢；指针或焦点进入后按真实高度展开， 展开期间整摞的计时一并按住。card 默认不叠，toast 默认叠。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，逐条下发：card 默认关闭，toast 默认开启。 |
| `translations` | `Partial<NotificationTranslations>` |  |  |
| `onItemsChange` | `(details: NotificationItemsChangeDetails) => void` |  |  |

### NotificationRecord

`items` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 |  |
| `title` | `string` |  |  |
| `description` | `string` |  |  |
| `tone` | `NotificationTone` |  |  |
| `loading` | `boolean` |  | 事情尚未完成：行首换为加载环，且不自动消失。 |
| `duration` | `number` |  |  |
| `closable` | `boolean` |  |  |
| `placement` | `NotificationPlacement` |  | 单条覆盖落位；未提供时使用 notification 的 placement。 |
| `actionLabel` | `string` |  | 行内动作按钮的文案。提供后才渲染动作部件。 只存放文案不存放回调：该条记录需要能被整份替换、序列化、比对， 按下之后的行为由宿主按 id 自行查询。 |
| `priority` | `number` |  | 移除时优先移除低优先级。未提供时按语气派生：danger=2 / warning=1 / 其余=0。 |
| `count` | `number` |  | 按内容合并后的条数，&gt;1 时由服务投影在标题后追加计数。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `items-change` | `NotificationItemsChangeDetails` | 队列变化；detail 为 `{ items: NotificationRecord[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhNotificationGroup` | `default` | `NotificationGroupSlotProps` |  |
| `XhNotificationItem` | `default` | `NotificationItemSlotProps` |  |
| `XhNotificationRoot` | `default` | `NotificationRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhNotificationGroup` | `placement` | `NotificationPlacement` |  | 未写时使用 notification 的 placement；写了则只接收该位置上的条目。 |
| `XhNotificationGroup` | `children` | `SlotChildren<NotificationGroupSlotProps>` |  |  |
| `XhNotificationItem` | `id` | `string` |  | 队列身份，不是 DOM id；未提供时回落到实例的 scope id。 |
| `XhNotificationItem` | `preset` | `NotificationPreset` |  |  |
| `XhNotificationItem` | `title` | `string` |  |  |
| `XhNotificationItem` | `description` | `string` |  |  |
| `XhNotificationItem` | `tone` | `NotificationTone` |  |  |
| `XhNotificationItem` | `loading` | `boolean` |  |  |
| `XhNotificationItem` | `duration` | `number` |  |  |
| `XhNotificationItem` | `closable` | `boolean` |  |  |
| `XhNotificationItem` | `pauseOnPageIdle` | `boolean` |  |  |
| `XhNotificationItem` | `paused` | `boolean` |  | 由宿主整组一起暂停计时；与指针、焦点等路径并存，最后一个释放后才继续。 |
| `XhNotificationItem` | `translations` | `NotificationItemProps['translations']` |  |  |
| `XhNotificationItem` | `onStatusChange` | `NotificationItemProps['onStatusChange']` |  |  |
| `XhNotificationItem` | `onAction` | `NotificationItemProps['onAction']` |  |  |
| `XhNotificationItem` | `children` | `SlotChildren<NotificationItemSlotProps>` |  |  |
| `XhNotificationRoot` | `children` | `SlotChildren<NotificationRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | toStatus(state.get()) |
| `item-progress` | toStatus(state.get()) |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`ITEMS.CREATE` · `ITEMS.UPDATE` · `ITEMS.DISMISS` · `ITEMS.DISMISS_ALL` · `STACK.EXPAND` · `STACK.COLLAPSE`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `preset` | `NotificationPreset` | 形态预设，已补齐缺省。 |
| `stacked` | `boolean` | 是否叠成一摞，已补齐缺省。 |
| `visibleNotifications` | `ResolvedNotification[]` | max 之内、按加入先后排列的可见条目，已补齐默认值。 |
| `placements` | `NotificationPlacement[]` | 当前有条目的位置，按九宫格固定顺序。作者据此决定渲染哪几个 group。 |
| `count` | `number` |  |
| `getItemsByPlacement` | `(placement: NotificationPlacement) => ResolvedNotification[]` |  |
| `create` | `(options?: NotificationOptions) => string` | 入队并返回 id；同 id 已存在则就地改写，位置不变。 |
| `update` | `(id: string, options: Partial<NotificationOptions>) => void` |  |
| `dismiss` | `(id: string) => void` |  |
| `dismissAll` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getGroupProps` | `(props?: NotificationGroupProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 item-close-trigger 上且 closable | 立即进入 dismissing，退场动画播完后转 unmounted |
| `Enter` / `Space` | focus 在 item-action-trigger 上 | 触发 onAction 并进入 dismissing |
| `Enter` / `Space` | held in item-close-trigger / item-action-trigger（item-close-trigger 须 closable） | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或进入退场撤下 |
| `Escape` | focus 在叠放的一摞（stacked）里 | 收起展开的一摞，焦点离开卡片；整摞的计时随之放开 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `group` | `aria-label` | translations.region |
| `group` | `role` | 'region' |
| `item` | `aria-atomic` | 'true' |
| `item` | `aria-describedby` | `description` 部件的 id |
| `item` | `aria-labelledby` | `title` 部件的 id |
| `item` | `aria-live` | 'assertive' \| 'polite' |
| `item` | `role` | 'alert' \| 'status' |
| `item-indicator` | `aria-hidden` | 'true' |
| `item-progress` | `aria-hidden` | 'true' |
| `item-close-trigger` | `aria-label` | translations.close |

## 样式参考

### 皮肤

`@xihan-ui/styles/notification.css` 使用 `[data-scope="notification"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-count` | list.length |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-count` | group.length |
| `group` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-expanded` | ''（条件成立时才出现） |
| `group` | `data-placement` | props.placement |
| `group` | `data-preset` | props.preset |
| `group` | `data-stacked` | ''（条件成立时才出现） |
| `item` | `data-loading` | ''（条件成立时才出现） |
| `item` | `data-paused` | ''（条件成立时才出现） |
| `item` | `data-preset` | props.preset |
| `item` | `data-state` | toStatus(state.get()) |
| `item` | `data-tone` | props.tone |
| `item` | `data-xh-loading-ring` | '' |
| `item-indicator` | `data-loading` | ''（条件成立时才出现） |
| `item-indicator` | `data-xh-loading-ring` | '' |
| `item-action-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `item-action-trigger` | `data-xh-action-control` | '' |
| `item-action-trigger` | `data-xh-action-display` | 'always' |
| `item-action-trigger` | `data-xh-action-profile` | 'text' |
| `item-action-trigger` | `data-xh-action-size` | 'sm' |
| `item-action-trigger` | `data-xh-action-variant` | 'outline' |
| `item-progress` | `data-state` | toStatus(state.get()) |
| `item-close-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item-close-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `item-close-trigger` | `data-xh-action-control` | '' |
| `item-close-trigger` | `data-xh-action-display` | 'always' |
| `item-close-trigger` | `data-xh-action-profile` | 'icon' |
| `item-close-trigger` | `data-xh-action-size` | 'xs' \| 'sm' |
| `item-close-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-notification-action-bg` | `item-action-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `transparent` | notification 的 item-action-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-notification-action-bg-active` | `item-action-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | notification 的 item-action-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-action-bg-hover` | `item-action-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | notification 的 item-action-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-action-border` | `item-action-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-control`<br>`--xh-border-control-hover` | notification 的 item-action-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-notification-action-fg` | `item-action-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | notification 的 item-action-trigger 部件 color 覆盖槽。 |
| `--xh-notification-action-font-weight` | `item-action-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | notification 的 item-action-trigger 部件 font-weight 覆盖槽。 |
| `--xh-notification-action-h` | `item-action-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | notification 的 item-action-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-notification-action-px` | `item-action-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | notification 的 item-action-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-notification-action-radius` | `item-action-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-action-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-bg` | `item-close-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | notification 的 item-close-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-notification-close-bg-active` | `item-close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | notification 的 item-close-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-close-bg-hover` | `item-close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | notification 的 item-close-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-close-border` | `item-close-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` | notification 的 item-close-trigger 部件 border 覆盖槽。 |
| `--xh-notification-close-fg` | `item-close-trigger` | `color` | `default` | `--xh-fg-muted` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-fg-hover` | `item-close-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-inset` | `item`<br>`item-close-trigger`<br>`item-title` | `inset-block-start`<br>`inset-inline-end`<br>`padding-inline-end` | `has([data-part='item-close-trigger'])`<br>`preset=card` | `--xh-surface-action-inset` | notification 的 item、item-close-trigger、item-title 部件 inset-block-start、inset-inline-end、padding-inline-end 覆盖槽。 |
| `--xh-notification-close-radius` | `item-close-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-size` | `item`<br>`item-close-trigger`<br>`item-title` | `block-size`<br>`inline-size`<br>`min-inline-size`<br>`padding-inline-end` | `default`<br>`has([data-part='item-close-trigger'])`<br>`preset=card`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` | notification 的 item、item-close-trigger、item-title 部件 block-size、inline-size、min-inline-size、padding-inline-end 覆盖槽。 |
| `--xh-notification-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` | notification 的 item-description 部件 color 覆盖槽。 |
| `--xh-notification-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-secondary-size` | notification 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-notification-description-leading` | `item`<br>`item-description` | `line-height` | `preset=toast` | `--xh-leading-normal` | notification 的 item、item-description 部件 line-height 覆盖槽。 |
| `--xh-notification-description-max-h` | `item-description` | `max-block-size` | `default` | `--xh-viewport-h-md` | notification 的 item-description 部件 max-block-size 覆盖槽。 |
| `--xh-notification-icon-size` | `item`<br>`item-action-trigger`<br>`item-close-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | notification 的 item、item-action-trigger、item-close-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-notification-indicator-fg` | `item`<br>`item-indicator` | `background-color`<br>`border-block-start-color`<br>`border-color`<br>`color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`motion=reduce`<br>`preset=toast`<br>`where([data-motion='reduce'])`<br>`xh-loading-ring` | `--xh-_tone-fg` | notification 的 item、item-indicator 部件 background-color、border-block-start-color、border-color、color 覆盖槽。 |
| `--xh-notification-indicator-p` | `item`<br>`item-indicator` | `padding` | `preset=toast` | `--xh-space-1` | notification 的 item、item-indicator 部件 padding 覆盖槽。 |
| `--xh-notification-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` | notification 的 item-indicator 部件 --xh-icon-size、inline-size 覆盖槽。 |
| `--xh-notification-inset` | `group` | `inset-block-end`<br>`inset-block-start`<br>`inset-inline-end`<br>`inset-inline-start`<br>`padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default`<br>`not([data-stacked])`<br>`placement=-end`<br>`placement=-start`<br>`placement=bottom`<br>`placement=top`<br>`preset=toast`<br>`stacked` | `--xh-space-4`<br>`--xh-space-6` | notification 的 group 部件 inset-block-end、inset-block-start、inset-inline-end、inset-inline-start、padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-notification-item-bg` | `item` | `background` | `default` | `--xh-material-elevated-bg` | notification 的 item 部件 background 覆盖槽。 |
| `--xh-notification-item-border` | `item` | `border` | `default` | `--xh-material-elevated-border` | notification 的 item 部件 border 覆盖槽。 |
| `--xh-notification-item-fg` | `item` | `color` | `default` | `--xh-material-elevated-fg` | notification 的 item 部件 color 覆盖槽。 |
| `--xh-notification-item-font-size` | `item` | `font-size` | `default`<br>`preset=toast` | `--xh-text-body-size`<br>`--xh-text-label-size` | notification 的 item 部件 font-size 覆盖槽。 |
| `--xh-notification-item-gap` | `item` | `column-gap` | `default`<br>`preset=toast` | `--xh-space-2`<br>`--xh-space-3` | notification 的 item 部件 column-gap 覆盖槽。 |
| `--xh-notification-item-leading` | `item` | `line-height` | `default` | `--xh-text-body-leading` | notification 的 item 部件 line-height 覆盖槽。 |
| `--xh-notification-item-px` | `item` | `inset-inline-start`<br>`padding-inline` | `default`<br>`preset=toast` | `--xh-space-4`<br>`--xh-surface-pad-lg` | notification 的 item 部件 inset-inline-start、padding-inline 覆盖槽。 |
| `--xh-notification-item-py` | `item` | `inset-block-start`<br>`padding-block` | `default`<br>`preset=toast` | `--xh-space-3`<br>`--xh-surface-pad-lg` | notification 的 item 部件 inset-block-start、padding-block 覆盖槽。 |
| `--xh-notification-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-overlay` | notification 的 item 部件 border-radius 覆盖槽。 |
| `--xh-notification-item-row-gap` | `item`<br>`item-content` | `row-gap` | `default` | `--xh-space-2` | notification 的 item、item-content 部件 row-gap 覆盖槽。 |
| `--xh-notification-item-shadow` | `item` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | notification 的 item 部件 box-shadow 覆盖槽。 |
| `--xh-notification-item-w` | `group`<br>`item` | `inline-size` | `default`<br>`preset=toast`<br>`stacked` | `--xh-overlay-max-w-lg`<br>`--xh-overlay-toast-w` | notification 的 group、item 部件 inline-size 覆盖槽。 |
| `--xh-notification-layer` | `group` | `z-index` | `default` | `--xh-layer-toast` | notification 的 group 部件 z-index 覆盖槽。 |
| `--xh-notification-progress-bg` | `item-progress` | `background` | `default` | `--xh-_tone-soft` | notification 的 item-progress 部件 background 覆盖槽。 |
| `--xh-notification-progress-duration` | `item-progress` | `animation` | `default` | `--xh-motion-duration-slide` | notification 的 item-progress 部件 animation 覆盖槽。 |
| `--xh-notification-progress-radius` | `item`<br>`item-progress` | `border-radius`<br>`clip-path` | `@keyframes xh-countdown`<br>`preset=card` | `--xh-shape-pill` | notification 的 item、item-progress 部件 border-radius、clip-path 覆盖槽。 |
| `--xh-notification-progress-thickness` | `item-progress` | `block-size` | `default` | `--xh-space-0_5` | notification 的 item-progress 部件 block-size 覆盖槽。 |
| `--xh-notification-stack-scale` | `*`<br>`group`<br>`item` | `scale` | `@keyframes xh-notification-stack-in`<br>`@keyframes xh-notification-stack-out`<br>`preset=toast`<br>`stacked` | `--xh-_notification-stack-scale` | notification 的 *、group、item 部件 scale 覆盖槽。 |
| `--xh-notification-title-fg` | `item`<br>`item-title` | `color` | `default`<br>`preset=toast` | `--xh-_tone-fg`<br>`--xh-fg-default` | notification 的 item、item-title 部件 color 覆盖槽。 |
| `--xh-notification-title-font-size` | `item-indicator`<br>`item-title` | `block-size`<br>`font-size` | `default` | `--xh-text-label-size` | notification 的 item-indicator、item-title 部件 block-size、font-size 覆盖槽。 |
| `--xh-notification-title-font-weight` | `item-title` | `font-weight` | `default` | `--xh-font-weight-semibold` | notification 的 item-title 部件 font-weight 覆盖槽。 |
| `--xh-notification-title-leading` | `item-title` | `line-height` | `default` | `--xh-leading-tight` | notification 的 item-title 部件 line-height 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 指示与换位 · 出现（面板） · 导航 · 数值（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-notification-progress-duration`。

关键帧 `xh-notification-stack-in` · `xh-notification-stack-out` 随皮肤自带，不引用别处文件里的名字；共享关键帧 `xh-countdown` · `xh-sheet-in` · `xh-sheet-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`block-size` · `opacity` · `scale` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`hover: hover`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走。
