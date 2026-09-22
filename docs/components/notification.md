# Notification 通知

主动推送给用户的一条消息：有标题、有正文，可以带操作按钮。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/notification" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/notification.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/notification" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/notification" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/notification.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

create 入队并返回 id，队列中的每条由作者渲染为一条通知；退场窗口结束后只收起不删除，宿主在 status-change 中把它移出队列

<XhDemo src="notification/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="notification"`：**`root`** · **`group`** · `item` · `item-indicator` · `item-title` · `item-description` · `item-action-trigger` · `item-progress` · `item-close-trigger`

## 示例

### 落位

placement 决定该堆叠贴视口的哪个角，更换的只是 group 上的 data-placement，队列本身不变

<XhDemo src="notification/02-placement" />

### 就地改写

同一个 id 再次 create 是原地改写而不是新弹出一条，位置不变；loading 不自动消失，换为 success 后才开始倒计时

<XhDemo src="notification/03-update" />

### 上限与清空

max 限制每个位置同时显示几条，超出时移除最旧的；dismissAll 直接清空队列，不经退场窗口

<XhDemo src="notification/04-max" />

### 手动关闭

create 返回的就是队列身份 id，保存后可随时 dismiss 该条；dismiss 直接移出队列，不经退场窗口

<XhDemo src="notification/05-manual-dismiss" />

### 逐条落位

单条通知自带 placement 即覆盖 notification 的默认落位；placements 报告当前有条目的位置，一个位置一个堆叠

<XhDemo src="notification/06-per-item-placement" />

## 设计指引

### 何时使用

- 系统或他人发起的消息：新评论、审批到达、任务完成。
- 后台完成的长任务，用户当时可能在做其他事。
- 一句话说不完，需要标题加正文两层信息。

### 何时不用

- 用户刚点击按钮、只需要一句结果反馈时，使用[轻提示](./toast)。
- 用户必须处理才能继续时，使用[对话框](./dialog)阻断。
- 页面内某块区域的常驻状态说明使用[警告提示](./alert)。

### 特性

- 九宫格落位，`placement` 决定整摞的位置，也可以逐条指定。
- `max` 限制每个位置同时显示的条数，默认 5，超出时先挤出低优先级，同级中挤出最旧的；设为 `Infinity` 即不限制。
- 同一个 id 再次发出即就地改写，位置不变，用于“处理中 → 已完成”。
- 每条自带计时与暂停：指针停在卡片上或焦点进入时暂停计时。
- `duration` 为 0 时常驻不消失，适合需要用户处理的消息。

### 组合

- 卡片可以放一个操作按钮（查看详情、撤销），按下即退场。
- 队列的增删改由根插槽统一给出，业务代码不需要自行维护数组。

### 最佳实践

- 整个应用只挂一个队列，挂在最外层。
- 落位避开固定的操作条与移动端手势区。
- 重要的消息把 `duration` 设为 0，由用户自行关闭。

### 反模式

- 用它做操作反馈：一次点击弹出一张两层文本的大卡片，喧宾夺主。
- 每个页面各挂一个队列，多摞互相遮盖。
- `max` 过大，一屏被通知占满。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-notification>` |
| Vue 组件 | `XhNotificationGroup` `XhNotificationItem` `XhNotificationItemActionTrigger` `XhNotificationItemCloseTrigger` `XhNotificationItemDescription` `XhNotificationItemIndicator` `XhNotificationItemProgress` `XhNotificationItemTitle` `XhNotificationRoot` |
| 组合式函数 | `useNotification` |
| 状态机 | `notificationMachine` |
| 皮肤 | `@xihan-ui/styles/notification.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | `NotificationRecord[]` |  | 受控队列：提供后由宿主决定，内部写入只发 onItemsChange。 |
| `defaultItems` | `NotificationRecord[]` |  |  |
| `placement` | `NotificationPlacement` |  | 默认落位，默认 bottom-end。 |
| `max` | `number` |  | 每个位置最多同时保留几条，超出时先移除低优先级、同级中移除最旧的。默认 5；提供 Infinity 即不限。 |
| `dedupe` | `NotificationDedupe` |  | 重复的处理方式，默认 'id'。 |
| `gap` | `number` |  | 同一组内的间距（px），默认 16。 |
| `duration` | `number` |  | 单条未写 duration 时的默认停留毫秒。 |
| `removeDelay` | `number` |  | 单条未写 removeDelay 时的默认退场窗口毫秒。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，逐条下发给 toast。 |
| `translations` | `Partial<NotificationTranslations>` |  |  |
| `onItemsChange` | `(details: NotificationItemsChangeDetails) => void` |  |  |

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
| `XhNotificationItem` | `default` | `{ item: NotificationItemApi }` |  |
| `XhNotificationRoot` | `default` | `NotificationRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | toStatus(state.get()) |
| `item-progress` | toStatus(state.get()) |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`ITEMS.CREATE` · `ITEMS.UPDATE` · `ITEMS.DISMISS` · `ITEMS.DISMISS_ALL`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
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

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `group` | `aria-label` | props.translations.region |
| `group` | `role` | 'region' |
| `item` | `aria-atomic` | 'true' |
| `item` | `aria-describedby` | `description` 部件的 id |
| `item` | `aria-labelledby` | `title` 部件的 id |
| `item` | `aria-live` | 'assertive' \| 'polite' |
| `item` | `role` | 'alert' \| 'status' |
| `item-indicator` | `aria-hidden` | 'true' |
| `item-progress` | `aria-hidden` | 'true' |
| `item-close-trigger` | `aria-label` | props.translations.close |

## 样式参考

### 皮肤

`@xihan-ui/styles/notification.css` 使用 `[data-scope="notification"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-count` | list.length |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-count` | group.length |
| `group` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-placement` | props.placement |
| `item` | `data-loading` | ''（条件成立时才出现） |
| `item` | `data-paused` | ''（条件成立时才出现） |
| `item` | `data-state` | toStatus(state.get()) |
| `item` | `data-tone` | props.tone |
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
| `item-close-trigger` | `data-xh-action-size` | 'sm' |
| `item-close-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-notification-action-bg` | `item-action-trigger` | `background-color` | `default` | `transparent` | notification 的 item-action-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-action-bg-active` | `item-action-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | notification 的 item-action-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-action-bg-hover` | `item-action-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | notification 的 item-action-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-action-border` | `item-action-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-control`<br>`--xh-border-control-hover` | notification 的 item-action-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-notification-action-fg` | `item-action-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | notification 的 item-action-trigger 部件 color 覆盖槽。 |
| `--xh-notification-action-font-weight` | `item-action-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | notification 的 item-action-trigger 部件 font-weight 覆盖槽。 |
| `--xh-notification-action-h` | `item-action-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | notification 的 item-action-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-notification-action-px` | `item-action-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | notification 的 item-action-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-notification-action-radius` | `item-action-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-action-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-bg-active` | `item-close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | notification 的 item-close-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-close-bg-hover` | `item-close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | notification 的 item-close-trigger 部件 background-color 覆盖槽。 |
| `--xh-notification-close-fg` | `item-close-trigger` | `color` | `default` | `--xh-fg-muted` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-fg-hover` | `item-close-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-inset` | `item`<br>`item-close-trigger`<br>`item-title` | `inset-block-start`<br>`inset-inline-end`<br>`padding-inline-end` | `default`<br>`has([data-part='item-close-trigger'])` | `--xh-surface-action-inset` | notification 的 item、item-close-trigger、item-title 部件 inset-block-start、inset-inline-end、padding-inline-end 覆盖槽。 |
| `--xh-notification-close-radius` | `item-close-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-size` | `item`<br>`item-close-trigger`<br>`item-title` | `block-size`<br>`inline-size`<br>`min-inline-size`<br>`padding-inline-end` | `default`<br>`has([data-part='item-close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` | notification 的 item、item-close-trigger、item-title 部件 block-size、inline-size、min-inline-size、padding-inline-end 覆盖槽。 |
| `--xh-notification-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` | notification 的 item-description 部件 color 覆盖槽。 |
| `--xh-notification-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-secondary-size` | notification 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-notification-icon-size` | `item`<br>`item-action-trigger`<br>`item-close-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | notification 的 item、item-action-trigger、item-close-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-notification-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone-fg` | notification 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-notification-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` | notification 的 item-indicator 部件 --xh-icon-size、inline-size 覆盖槽。 |
| `--xh-notification-inset` | `group` | `padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default` | `--xh-space-6` | notification 的 group 部件 padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-notification-item-bg` | `item` | `background` | `default` | `--xh-material-elevated-bg` | notification 的 item 部件 background 覆盖槽。 |
| `--xh-notification-item-border` | `item` | `border` | `default` | `--xh-material-elevated-border` | notification 的 item 部件 border 覆盖槽。 |
| `--xh-notification-item-fg` | `item` | `color` | `default` | `--xh-material-elevated-fg` | notification 的 item 部件 color 覆盖槽。 |
| `--xh-notification-item-font-size` | `item` | `font-size` | `default` | `--xh-text-body-size` | notification 的 item 部件 font-size 覆盖槽。 |
| `--xh-notification-item-gap` | `item` | `column-gap` | `default` | `--xh-space-3` | notification 的 item 部件 column-gap 覆盖槽。 |
| `--xh-notification-item-leading` | `item` | `line-height` | `default` | `--xh-text-body-leading` | notification 的 item 部件 line-height 覆盖槽。 |
| `--xh-notification-item-px` | `item` | `padding-inline` | `default` | `--xh-surface-pad-lg` | notification 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-notification-item-py` | `item` | `padding-block` | `default` | `--xh-surface-pad-lg` | notification 的 item 部件 padding-block 覆盖槽。 |
| `--xh-notification-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-overlay` | notification 的 item 部件 border-radius 覆盖槽。 |
| `--xh-notification-item-row-gap` | `item` | `row-gap` | `default` | `--xh-space-2` | notification 的 item 部件 row-gap 覆盖槽。 |
| `--xh-notification-item-shadow` | `item` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | notification 的 item 部件 box-shadow 覆盖槽。 |
| `--xh-notification-item-w` | `item` | `inline-size` | `default` | `--xh-overlay-max-w-lg` | notification 的 item 部件 inline-size 覆盖槽。 |
| `--xh-notification-layer` | `group` | `z-index` | `default` | `--xh-layer-toast` | notification 的 group 部件 z-index 覆盖槽。 |
| `--xh-notification-progress-bg` | `item-progress` | `background` | `default` | `--xh-_tone-soft` | notification 的 item-progress 部件 background 覆盖槽。 |
| `--xh-notification-progress-duration` | `item-progress` | `animation` | `default` | `--xh-motion-duration-slide` | notification 的 item-progress 部件 animation 覆盖槽。 |
| `--xh-notification-progress-radius` | `item-progress` | `border-radius` | `default` | `--xh-shape-pill` | notification 的 item-progress 部件 border-radius 覆盖槽。 |
| `--xh-notification-progress-thickness` | `item-progress` | `block-size` | `default` | `--xh-space-0_5` | notification 的 item-progress 部件 block-size 覆盖槽。 |
| `--xh-notification-title-fg` | `item-title` | `color` | `default` | `--xh-fg-default` | notification 的 item-title 部件 color 覆盖槽。 |
| `--xh-notification-title-font-size` | `item-indicator`<br>`item-title` | `block-size`<br>`font-size` | `default` | `--xh-text-label-size` | notification 的 item-indicator、item-title 部件 block-size、font-size 覆盖槽。 |
| `--xh-notification-title-font-weight` | `item-title` | `font-weight` | `default` | `--xh-font-weight-semibold` | notification 的 item-title 部件 font-weight 覆盖槽。 |
| `--xh-notification-title-leading` | `item-title` | `line-height` | `default` | `--xh-leading-tight` | notification 的 item-title 部件 line-height 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-countdown` · `xh-notification-in` · `xh-notification-out` · `xh-notification-spin` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
