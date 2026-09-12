# Notification <Badge type="info" text="通知" />

主动推给用户的一条消息：有标题、有正文，可以带操作按钮。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/notification" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/notification.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/notification" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/notification" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/notification.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

create 入队并返回 id，队列里的每条由作者渲染成一条通知；退场窗口走完只收起不删，宿主在 status-change 里把它移出队列

<XhDemo src="notification/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="notification"`：**`root`** · **`group`** · `item` · `item-indicator` · `item-title` · `item-description` · `item-action-trigger` · `item-progress` · `item-close-trigger`

## 示例

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

## 设计指引

### 何时使用

- 系统或他人发起的消息：新评论、审批到达、任务跑完了。
- 后台完成的长任务：用户当时可能已经在做别的事。
- 一句话讲不完，需要标题加正文两层的信息。

### 何时不用

- 用户刚点了一下按钮，只要一句结果反馈：用[轻提示](./toast)。
- 用户必须处理才能继续：用[对话框](./dialog)阻断。
- 页面内某块区域的常驻状态说明：用[警告提示](./alert)。

### 特性

- 九宫格落位，`placement` 决定这一摞落在哪儿；也可以按条逐个指定。
- `max` 限制每个位置同时显示几条，默认 5，超出先挤低优先级、同级里挤最旧的；给 `Infinity` 即不限。
- 同一个 id 再发一次即就地改写，位置不动，用来做"处理中 → 已完成"。
- 每条自带计时与暂停：指针停在卡片上、或焦点落进去时不再走表。
- `duration` 给 0 即常驻不消失，适合需要用户处理的消息。

### 组合

- 卡片可以放一个操作按钮（查看详情、撤销），按下即退场。
- 队列的增删改一并从根插槽给出，业务代码不必自己维护数组。

### 最佳实践

- 整个应用只挂一个队列，挂在最外层。
- 落位躲开固定的操作条与移动端手势区。
- 重要的那条把 `duration` 关掉，让用户自己收走。

### 反模式

- 拿它做操作反馈：一次点击弹出一张两层文本的大卡片，喧宾夺主。
- 每个页面各挂一个队列：多摞互相盖。
- `max` 设得太大，一屏被通知占满。

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
| `items` | `NotificationRecord[]` |  | 受控队列：给了就由宿主说了算，内部写入只发 onItemsChange。 |
| `defaultItems` | `NotificationRecord[]` |  |  |
| `placement` | `NotificationPlacement` |  | 默认落位，默认 bottom-end。 |
| `max` | `number` |  | 每个位置最多同时留几条，超出先挤低优先级、同级里挤最旧的。默认 5；给 Infinity 即不限。 |
| `dedupe` | `NotificationDedupe` |  | 重复怎么算，默认 'id'。 |
| `gap` | `number` |  | 同一摞内的间距（px），默认 16。 |
| `duration` | `number` |  | 单条没写 duration 时的默认停留毫秒。 |
| `removeDelay` | `number` |  | 单条没写 removeDelay 时的默认退场窗口毫秒。 |
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
| `create` | `(options?: NotificationOptions) => string` | 入队并返回 id；同 id 已存在则就地改写，位置不动。 |
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
| `item` | `data-paused` | ''（条件成立时才出现） |
| `item` | `data-severity` | props.type |
| `item` | `data-state` | toStatus(state.get()) |
| `item` | `data-tone` | toneOf(type) |
| `item-progress` | `data-state` | toStatus(state.get()) |
| `item-close-trigger` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-notification-action-bg` | `item-action-trigger` | `background` | `default` | `--xh-bg-subtle` | notification 的 item-action-trigger 部件 background 覆盖槽。 |
| `--xh-notification-action-bg-active` | `item-action-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | notification 的 item-action-trigger 部件 background 覆盖槽。 |
| `--xh-notification-action-bg-hover` | `item-action-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | notification 的 item-action-trigger 部件 background 覆盖槽。 |
| `--xh-notification-action-border` | `item-action-trigger` | `border` | `default` | `--xh-border-default` | notification 的 item-action-trigger 部件 border 覆盖槽。 |
| `--xh-notification-action-fg` | `item-action-trigger` | `color` | `default` | `--xh-fg-default` | notification 的 item-action-trigger 部件 color 覆盖槽。 |
| `--xh-notification-action-font-weight` | `item-action-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | notification 的 item-action-trigger 部件 font-weight 覆盖槽。 |
| `--xh-notification-action-h` | `item-action-trigger` | `block-size` | `default` | `--xh-control-h-sm` | notification 的 item-action-trigger 部件 block-size 覆盖槽。 |
| `--xh-notification-action-px` | `item-action-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | notification 的 item-action-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-notification-action-radius` | `item-action-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-action-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-bg-active` | `item-close-trigger` | `background` | `active` | `--xh-bg-subtle-active` | notification 的 item-close-trigger 部件 background 覆盖槽。 |
| `--xh-notification-close-bg-hover` | `item-close-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | notification 的 item-close-trigger 部件 background 覆盖槽。 |
| `--xh-notification-close-fg` | `item-close-trigger` | `color` | `default` | `--xh-fg-muted` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-fg-hover` | `item-close-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | notification 的 item-close-trigger 部件 color 覆盖槽。 |
| `--xh-notification-close-inset` | `item`<br>`item-close-trigger`<br>`item-title` | `inset-block-start`<br>`inset-inline-end`<br>`padding-inline-end` | `default`<br>`has([data-part='item-close-trigger'])` | `--xh-surface-action-inset` | notification 的 item、item-close-trigger、item-title 部件 inset-block-start、inset-inline-end、padding-inline-end 覆盖槽。 |
| `--xh-notification-close-radius` | `item-close-trigger` | `border-radius` | `default` | `--xh-shape-control` | notification 的 item-close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-notification-close-size` | `item`<br>`item-close-trigger`<br>`item-title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-part='item-close-trigger'])` | `--xh-control-h-sm` | notification 的 item、item-close-trigger、item-title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-notification-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` | notification 的 item-description 部件 color 覆盖槽。 |
| `--xh-notification-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-secondary-size` | notification 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-notification-icon-size` | `item` | `--xh-icon-size` | `default` | `--xh-control-indicator-size` | notification 的 item 部件 --xh-icon-size 覆盖槽。 |
| `--xh-notification-indicator-fg` | `item`<br>`item-indicator` | `color` | `default`<br>`severity=loading` | `--xh-_tone-fg`<br>`--xh-fg-muted` | notification 的 item、item-indicator 部件 color 覆盖槽。 |
| `--xh-notification-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` | notification 的 item-indicator 部件 --xh-icon-size、inline-size 覆盖槽。 |
| `--xh-notification-inset` | `group` | `padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default` | `--xh-space-6` | notification 的 group 部件 padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-notification-item-bg` | `item` | `background` | `default` | `--xh-bg-surface-raised` | notification 的 item 部件 background 覆盖槽。 |
| `--xh-notification-item-border` | `item` | `border` | `default` | `--xh-border-default` | notification 的 item 部件 border 覆盖槽。 |
| `--xh-notification-item-fg` | `item` | `color` | `default` | `--xh-fg-default` | notification 的 item 部件 color 覆盖槽。 |
| `--xh-notification-item-font-size` | `item` | `font-size` | `default` | `--xh-text-body-size` | notification 的 item 部件 font-size 覆盖槽。 |
| `--xh-notification-item-gap` | `item` | `column-gap` | `default` | `--xh-space-3` | notification 的 item 部件 column-gap 覆盖槽。 |
| `--xh-notification-item-leading` | `item` | `line-height` | `default` | `--xh-text-body-leading` | notification 的 item 部件 line-height 覆盖槽。 |
| `--xh-notification-item-px` | `item` | `padding-inline` | `default` | `--xh-surface-pad-lg` | notification 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-notification-item-py` | `item` | `padding-block` | `default` | `--xh-surface-pad-lg` | notification 的 item 部件 padding-block 覆盖槽。 |
| `--xh-notification-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-surface` | notification 的 item 部件 border-radius 覆盖槽。 |
| `--xh-notification-item-row-gap` | `item` | `row-gap` | `default` | `--xh-space-2` | notification 的 item 部件 row-gap 覆盖槽。 |
| `--xh-notification-item-shadow` | `item` | `box-shadow` | `default` | `--xh-elevation-sheet` | notification 的 item 部件 box-shadow 覆盖槽。 |
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

关键帧 `xh-countdown` · `xh-notification-in` · `xh-notification-out` · `xh-notification-spin` 随皮肤自带，不引用别处文件里的名字；`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
