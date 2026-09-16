# MessageFeed 消息流 <Badge type="info" text="alpha" />

一段会话的消息序列：粘底跟随、条目集合语义、键盘遍历与一个统一的播报区。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/message-feed" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/message-feed.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/message-feed" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/message-feed" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/message-feed.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

消息内容全部由作者编写；组件管理的是集合语义、粘底与播报区

<XhDemo src="message-feed/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="message-feed"`：**`root`** · **`viewport`** · **`list`** · `item` · `item-label` · `scroll-to-end-trigger` · `live-region`

## 示例

### 粘底跟随与播报

新消息增长时自动到底部，向上翻即解除；一轮结束后在播报区朗读一句

<XhDemo src="message-feed/02-sticky" />

### 按角色分侧

条目上带 data-role，左右分侧与气泡在使用者一侧编写，组件不预设这层外观

<XhDemo src="message-feed/03-roles" />

### 运行态与播报

status 由宿主持有，组件只把它透出为 root 上的 data-state；播报只发生在 live-region 中，一轮结束后才写入一句

<XhDemo src="message-feed/04-status" />

### 触底加载更多

stick-change 报告到达底部，宿主据此获取下一页；先向上翻一段再滚回底部，取回的消息接在后面

<XhDemo src="message-feed/05-load-more" />

### 向上加载更早的消息

直接监听视口的滚动事件：滚到接近顶部时获取上一页，取回的消息插在最前面，正在阅读的位置不会被顶走

<XhDemo src="message-feed/06-load-earlier" />

### 跳到指定的一条

消息 id 就是锚点：Vue 侧使用 root 插槽提供的 scrollToItem / focusItem，自定义元素侧按同一个 id 取节点自行滚动

<XhDemo src="message-feed/07-scroll-to" />

## 设计指引

### 何时使用

- AI 对话或聊天界面的消息列表。
- 内容从底部持续生长，需要始终跟随到底，但用户向上翻时不被拉回。

### 何时不用

- 内容不分条、只是持续追加的输出（运行日志、命令回显）时，使用[日志](./log)。两者的粘底、回到底部与播报区是同一套，差别只在是否需要条目集合语义与逐条遍历。
- 只是一列静态卡片时，使用[列表](./list)。
- 消息数以万计时，本组件不与[虚拟滚动](./virtualizer)组合，键盘遍历要求条目都在活动 DOM 中；长会话请配合[无限滚动](./infinite-scroll)分批加载并自行截断历史。

### 特性

- 粘底跟随：内容增高时自动到底，用户上滚即解除，滚回底部阈值内自动恢复。向上插入历史消息时补偿滚动位置，视口不跳动。
- “回到底部”只判断是否在底部，不判断粘附意图：粘附中但内容尚未追上时按钮不显示。
- 整份消息列表只占一个 Tab 停靠位：`PageDown` / `PageUp` 在消息之间移动，`Ctrl+End` / `Ctrl+Home` 一步移到消息流之外（会话界面中通常是输入框）。
- 消息内容全部由作者编写：气泡、头像、时间、动作条都不是本组件的部件。
- 新生成的消息与出现的“回到底部”各带一段淡入位移；减弱动效由令牌层收敛，不需要另行关闭。
- “回到底部”留空时皮肤绘制向下的字形，放入节点即替换为自定义图形。

### 组合

- 正文使用[流式正文](./markdown-stream)，代码使用[代码视图](./code-view)。
- 每条消息的动作条使用[工具栏](./toolbar)，复制使用[剪贴板](./clipboard)。
- 加载更早的消息使用[无限滚动](./infinite-scroll)，必须把消息流的滚动容器交给它，否则它的提前量只对窗口视口生效。
- 空会话使用[空状态](./empty-state)，并显式把它的 `live` 设为 `off`：它默认会成为活动区域，放在消息流中会与播报区冲突。
- 需要左右分侧或气泡时，条目上带 `data-role`（`user` / `assistant` / `system`），在自己的样式表中按它编写 `align-self`、底色、内衬与最大行宽，组件不预设这层外观。
- 仍在流式写入的条目带 `data-streaming`，这是留给使用者的钩子：正文经[流式正文](./markdown-stream)渲染时，光标就是“仍在写入”的标记；正文不经它渲染时，可按该属性自行添加非遮蔽式的标记，例如前导色条或标签态。

### 最佳实践

- 条目必须是内容层的直接子节点：向上插入历史消息时的滚动补偿只在直接子节点中选锚点，套一层壳或使用 `display: contents` 都会让补偿静默失效。
- 一轮流式结束时把整段最终文本写入播报区，不每个 token 写一次。

### 反模式

- 给每条消息各写 `tabindex="0"`：两百条消息就是两百个 Tab 停靠位。
- 在消息流内再套一层滚动容器：粘底逻辑只识别本组件的视口，套一层后失效。
- 按 `data-streaming` 把整条消息压暗或虚化：一轮流式可能持续数分钟，被遮盖的正是读者正在逐字阅读的内容。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-message-feed>` |
| Vue 组件 | `XhMessageFeedItem` `XhMessageFeedItemLabel` `XhMessageFeedList` `XhMessageFeedLiveRegion` `XhMessageFeedRoot` `XhMessageFeedScrollToEndTrigger` `XhMessageFeedViewport` |
| 组合式函数 | `useMessageFeed` |
| 状态机 | `messageFeedMachine` |
| 皮肤 | `@xihan-ui/styles/message-feed.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 消息总数，由宿主声明，不从 DOM 统计；aria-setsize 取它。 |
| `status` | `MessageFeedStatus` |  | 本轮的运行态，只写 data-state，状态机不读取它。 |
| `threshold` | `number` |  | 距底部多少 px 视为在底部，默认使用贴底原语的默认值。 |
| `loop` | `boolean` |  | 到达首尾是否回绕，默认 false：会话是线性的。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<MessageFeedTranslations>` |  |  |
| `onStickChange` | `(details: MessageFeedStickChangeDetails) => void` |  |  |
| `onItemFocus` | `(details: MessageFeedItemFocusDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `stick-change` | `MessageFeedStickChangeDetails` | 贴底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }` |
| `item-focus` | `MessageFeedItemFocusDetails` | 锚点变化；detail 为 `{ id: string \| null }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMessageFeedRoot` | `default` | `MessageFeedRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | props.status |
| `scroll-to-end-trigger` | 'hidden' \| 'visible' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`STICK.CHANGE` · `SCROLL_TO_BOTTOM` · `ITEM.FOCUS` · `FEED.BLUR`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `MessageFeedStatus` |  |
| `atBottom` | `boolean` |  |
| `sticking` | `boolean` |  |
| `focusedId` | `string \| null` | roving tabindex 的锚点。 |
| `showScrollToEndTrigger` | `boolean` | 是否显示回到底部按钮：只判断是否在底部，不判断贴附意图。 |
| `scrollToBottom` | `() => void` |  |
| `scrollToItem` | `(id: string) => void` | 把某条消息滚进可视区；该条不在 DOM 中时不做任何事。 |
| `focusItem` | `(id: string) => void` | 把焦点落到某条消息上；该条不在 DOM 中时不做任何事。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: MessageFeedItemProps) => T['element']` |  |
| `getItemLabelProps` | `(props: Pick<MessageFeedItemProps, 'id'>) => T['element']` |  |
| `getScrollToEndTriggerProps` | `() => T['button']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

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

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-label` | translations?.feed |
| `list` | `role` | 'feed' |
| `item` | `aria-label` | undefined \| itemLabel(item.index + 1, count ?? -1, item.role) |
| `item` | `aria-labelledby` | scope.partId('message-feed', `item-label:${item.id}`) \| undefined |
| `item` | `aria-posinset` | item.index + 1 |
| `item` | `aria-setsize` | props.count |
| `item` | `role` | 'article' |
| `scroll-to-end-trigger` | `aria-label` | translations?.scrollToBottom |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |

- `role=feed` 配 `role=article`，带 `aria-posinset` / `aria-setsize`；总数由 `count` 声明，不从 DOM 计数，虚拟化或分页时 DOM 中的条数不等于会话长度。
- 集合语义落在内容层而不是最外层：`role=feed` 只识别 `role=article` 的子节点，而播报区与回到底部按钮都是最外层的子节点。最外层只作为 Tab 停靠点与键盘宿主。
- 播报使用独立的原子区域：一份会话只应有一个活动区域，每条消息各开一个会互相打断。
- 消息流本身不发 `aria-busy`：它会压制同一棵子树内播报区的播报。

## 样式参考

### 皮肤

`@xihan-ui/styles/message-feed.css` 使用 `[data-scope="message-feed"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | props.status |
| `item` | `data-role` | item.role |
| `item` | `data-streaming` | ''（条件成立时才出现） |
| `scroll-to-end-trigger` | `data-state` | 'hidden' \| 'visible' |
| `scroll-to-end-trigger` | `data-xh-action-control` | '' |
| `scroll-to-end-trigger` | `data-xh-action-display` | 'always' |
| `scroll-to-end-trigger` | `data-xh-action-profile` | 'floating' |
| `scroll-to-end-trigger` | `data-xh-action-size` | 'xs' |
| `scroll-to-end-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-message-feed-gap` | `list` | `gap` | `default` | `--xh-_message-feed-gap` | message-feed 的 list 部件 gap 覆盖槽。 |
| `--xh-message-feed-icon-size` | `scroll-to-end-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | message-feed 的 scroll-to-end-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-message-feed-item-gap` | `item` | `gap` | `default` | `--xh-space-1` | message-feed 的 item 部件 gap 覆盖槽。 |
| `--xh-message-feed-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-surface` | message-feed 的 item 部件 border-radius 覆盖槽。 |
| `--xh-message-feed-label-fg` | `item-label` | `color` | `default` | `--xh-fg-muted` | message-feed 的 item-label 部件 color 覆盖槽。 |
| `--xh-message-feed-label-font-size` | `item-label` | `font-size` | `default` | `--xh-text-caption-size` | message-feed 的 item-label 部件 font-size 覆盖槽。 |
| `--xh-message-feed-p` | `list` | `padding` | `default` | `--xh-_message-feed-p` | message-feed 的 list 部件 padding 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-bg` | `scroll-to-end-trigger` | `background-color` | `default` | `--xh-material-frosted-bg` | message-feed 的 scroll-to-end-trigger 部件 background-color 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-bg-hover` | `scroll-to-end-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | message-feed 的 scroll-to-end-trigger 部件 background-color 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-border` | `scroll-to-end-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-material-frosted-border` | message-feed 的 scroll-to-end-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-fg` | `scroll-to-end-trigger` | `color` | `default` | `--xh-material-frosted-fg` | message-feed 的 scroll-to-end-trigger 部件 color 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-inset` | `scroll-to-end-trigger` | `inset-block-end`<br>`inset-inline-end` | `default` | `--xh-space-4` | message-feed 的 scroll-to-end-trigger 部件 inset-block-end、inset-inline-end 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-radius` | `scroll-to-end-trigger` | `border-radius` | `default` | `--xh-shape-circle` | message-feed 的 scroll-to-end-trigger 部件 border-radius 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-shadow` | `scroll-to-end-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-material-frosted-shadow` | message-feed 的 scroll-to-end-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-message-feed-scroll-to-end-trigger-size` | `scroll-to-end-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=floating` | `--xh-_action-profile-visual-size` | message-feed 的 scroll-to-end-trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-message-feed-button-in` · `xh-message-feed-item-in` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
