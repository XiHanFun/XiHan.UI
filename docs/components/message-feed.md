# 消息流 <Badge type="info" text="message-feed" />

一段会话的消息序列：粘底跟随、条目集合语义、键盘遍历与一个统一的播报区。

## 何时使用

- AI 对话或聊天界面的消息列表。
- 内容会从底部长出来，希望一直跟到底，但用户往上翻时不要被拽回去。

## 何时不用

- 内容不分条，只是一段往下追加的输出（运行日志、命令回显）：用[日志](./log)。
  两边的粘底、回到底部与播报区是同一套，差别只在要不要条目集合语义与逐条遍历。
- 只是一列静态卡片：用[列表](./list)。
- 消息数以万计：本组件不与[虚拟滚动](./virtualizer)组合，键盘遍历要求条目都在活 DOM 里；
  长会话请配[无限滚动](./infinite-scroll)分批加载并自行截断历史。

## 特性

- 粘底跟随：内容增高时自动到底，用户上滚即解除，滚回底部阈值内自动恢复。
  往上插入历史消息时会补偿滚动位置，视口不跳。
- 「回到底部」只看在不在底、不看粘附意图：粘着但内容还没追上时按钮不该冒出来。
- 整份消息列表只占**一个** Tab 停靠位：`PageDown` / `PageUp` 在消息之间走，
  `Ctrl+End` / `Ctrl+Home` 一步走到消息流之外（会话界面里通常就是输入框）。
- 消息内容全部由作者写：气泡、头像、时间、动作条都不是本组件的部件。
- 新长出来的消息与冒出来的「回到底部」各带一段淡入位移；减弱动效档由令牌层压平，不必另行关闭。
- 「回到底部」留空时皮肤画一枚向下的字形，往按钮里塞节点即换成自己的图形。

## 示例

### 基础用法

消息内容全由作者写；组件管的是集合语义、粘底与那一个播报区

<XhDemo src="message-feed/01-basic" />

### 粘底跟随与播报

新消息长出来时自动到底，往上翻就解除；一轮结束在播报区念一句

<XhDemo src="message-feed/02-sticky" />

### 按角色分侧

条目上带 data-role，左右分侧与气泡在使用者这一侧写，组件不预设这层外观

<XhDemo src="message-feed/03-roles" />

### 运行态与播报

status 由宿主持有，组件只把它透出成 root 上的 data-state；播报只发生在 live-region 里，一轮结束才写一句

<XhDemo src="message-feed/04-status" />

### 触底加载更多

stick-change 报到底，宿主据此去取下一页；先往上翻一段再滚回底部，取回来的消息接在后面

<XhDemo src="message-feed/05-load-more" />

### 向上加载更早的消息

视口的滚动事件直接监听：滚到接近顶部就去取上一页，取回来的插在最前面，读到一半的位置不会被顶走

<XhDemo src="message-feed/06-load-earlier" />

### 跳到指定的一条

消息 id 就是锚点：Vue 侧用 root 插槽给的 scrollToItem / focusItem，自定义元素侧按同一个 id 取节点自己滚

<XhDemo src="message-feed/07-scroll-to" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-message-feed>` |
| Vue 组件 | `XhMessageFeedItem` `XhMessageFeedItemLabel` `XhMessageFeedList` `XhMessageFeedLiveRegion` `XhMessageFeedRoot` `XhMessageFeedScrollButton` `XhMessageFeedViewport` |
| 组合式函数 | `useMessageFeed` |
| 状态机 | `messageFeedMachine` |
| 皮肤 | `@xihan-ui/styles/message-feed.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="message-feed"`：**`root`** · **`viewport`** · **`list`** · `item` · `item-label` · `scroll-button` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 消息总数，由宿主声明，不从 DOM 数；aria-setsize 取它。 |
| `status` | `MessageFeedStatus` |  | 这一轮的运行态，只落 data-state，机器不读它。 |
| `threshold` | `number` |  | 距底多少 px 视为在底，缺省用粘底原语的默认值。 |
| `loop` | `boolean` |  | 走到首尾是否回绕，默认 false——会话是线性的。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<MessageFeedTranslations>` |  |  |
| `onStickChange` | `(details: MessageFeedStickChangeDetails) => void` |  |  |
| `onItemFocus` | `(details: MessageFeedItemFocusDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `stick-change` | `MessageFeedStickChangeDetails` | 粘底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }` |
| `item-focus` | `MessageFeedItemFocusDetails` | 锚点变化；detail 为 `{ id: string \| null }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMessageFeedRoot` | `default` | `MessageFeedRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | props.status |
| `scroll-button` | 'hidden' \| 'visible' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`STICK.CHANGE` · `SCROLL_TO_BOTTOM` · `ITEM.FOCUS` · `FEED.BLUR`

## connect API

`useMessageFeed` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `MessageFeedStatus` |  |
| `atBottom` | `boolean` |  |
| `sticking` | `boolean` |  |
| `focusedId` | `string \| null` | roving tabindex 的锚点。 |
| `showScrollButton` | `boolean` | 是否显示回到底部按钮：只看在不在底，不看粘附意图。 |
| `scrollToBottom` | `() => void` |  |
| `scrollToItem` | `(id: string) => void` | 把某条消息滚进可视区；那条不在活 DOM 里时什么都不做。 |
| `focusItem` | `(id: string) => void` | 把焦点落到某条消息上；那条不在活 DOM 里时什么都不做。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: MessageFeedItemProps) => T['element']` |  |
| `getItemLabelProps` | `(props: Pick<MessageFeedItemProps, 'id'>) => T['element']` |  |
| `getScrollButtonProps` | `() => T['button']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `PageDown` | 焦点在消息流内 | 焦点移到下一条消息；到末条时按 loop 决定回绕还是不动 |
| `PageUp` | 焦点在消息流内 | 焦点移到上一条消息；到首条时按 loop 决定回绕还是不动 |
| `Control+End` | 焦点在消息流内 | 焦点移到消息流之后的第一个可聚焦元素，会话界面里通常是输入框 |
| `Control+Home` | 焦点在消息流内 | 焦点移到消息流之前的最后一个可聚焦元素 |
| `Tab` | 焦点在消息流内外之间移动 | 整份消息列表只占一个 Tab 停靠位：没有锚点时由根容器认领并把焦点转投给第一条，有锚点时那一条认领、根容器让位 |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | 焦点落在某条消息上 | 组件不接管，浏览器滚动最近的可滚动祖先 |
| `Enter` / `Space` | 焦点在回到底部按钮上 | 滚回底部并恢复粘附（原生按钮激活） |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-label` | translations?.feed |
| `list` | `role` | 'feed' |
| `item` | `aria-label` | undefined \| itemLabel(item.index + 1, count ?? -1, item.role) |
| `item` | `aria-labelledby` | scope.partId('message-feed', `item-label:${item.id}`) \| undefined |
| `item` | `aria-posinset` | item.index + 1 |
| `item` | `aria-setsize` | props.count |
| `item` | `role` | 'article' |
| `scroll-button` | `aria-label` | translations?.scrollToBottom |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |

- `role=feed` 配 `role=article`，带 `aria-posinset` / `aria-setsize`；总数由 `count` 声明，
  不从 DOM 数——虚拟化或分页时 DOM 里的条数不等于会话长度。
- 集合语义落在内容层而不是最外层：`role=feed` 只认 `role=article` 的子节点，
  而播报区与回到底部按钮都是最外层的孩子。最外层只当 Tab 停靠点与键盘宿主。
- 播报走独立的原子区：一份会话只该有一个活区，每条消息各开一个会互相打断。
- 消息流本身不发 `aria-busy`：它会压住同一棵子树内播报区的播报。

## 样式

默认皮肤 `@xihan-ui/styles/message-feed.css` 按部件选择：`[data-scope="message-feed"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | props.status |
| `item` | `data-role` | item.role |
| `item` | `data-streaming` | ''（条件成立时才出现） |
| `scroll-button` | `data-state` | 'hidden' \| 'visible' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-message-feed-button-bg` · `--xh-message-feed-button-bg-hover` · `--xh-message-feed-button-border` · `--xh-message-feed-button-fg` · `--xh-message-feed-button-inset` · `--xh-message-feed-button-radius` · `--xh-message-feed-button-shadow` · `--xh-message-feed-button-size` · `--xh-message-feed-gap` · `--xh-message-feed-icon-size` · `--xh-message-feed-item-gap` · `--xh-message-feed-item-radius` · `--xh-message-feed-label-fg` · `--xh-message-feed-label-font-size` · `--xh-message-feed-p`

## 动效

关键帧 `xh-message-feed-button-in` · `xh-message-feed-item-in` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 正文用[流式正文](./markdown-stream)，代码用[代码视图](./code-view)。
- 每条消息的动作条用[工具条](./toolbar)，复制那一格用[剪贴板](./clipboard)。
- 加载更早的消息用[无限滚动](./infinite-scroll)，**必须把消息流的滚动容器交给它**，
  否则它的提前量只对窗口视口生效。
- 空会话用[空状态](./empty-state)，并显式把它的 `live` 设成 `off`：
  它默认会成为活区，放在消息流里会与播报区抢播报。
- 要左右分侧或气泡：条目上带 `data-role`（`user` / `assistant` / `system`），
  在自己的样式表里按它写 `align-self`、底色、内衬与最大行宽即可，组件不预设这层外观。
- 还在流式写入的条目带 `data-streaming`，这是留给使用者的钩子：正文走[流式正文](./markdown-stream)时
  那枚光标就是「还在写」的标记；正文不经它渲染时，可按这个属性自己加一个非遮蔽式的标记，
  例如前导色条或一格标签态。

## 最佳实践

- 条目必须是内容层的**直接子节点**：向上插入历史消息时的滚动补偿只在直接子节点里挑锚点，
  套一层壳或用 `display: contents` 都会让补偿静默失效。
- 一轮流结束时把整段最终文本写进播报区，别每来一个 token 写一次。

## 反模式

- 给每条消息各写一个 `tabindex="0"`：两百条消息就是两百个 Tab 停靠位。
- 在消息流里再套一层滚动容器：粘底句柄认的是本组件的视口，套一层它就不动了。
- 按 `data-streaming` 把整条消息压暗或虚化：一轮流可能持续数分钟，被盖住的正是读者正在逐字读的内容。
