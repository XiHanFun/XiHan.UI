# 会话线程 <Badge type="info" text="thread" />

对话消息的滚动容器：新消息来了自动跟到底部，用户往上翻时停住。

## 何时使用

- AI 对话、聊天记录的消息区。
- 消息是流式追加的，需要粘底行为。

## 何时不用

- 是普通的长列表：用[滚动区域](./scroll-area)加[虚拟滚动](./virtualizer)。
- 内容不会追加。

## 特性

- 三层必备：`root` · `viewport` · `content`。
- `threshold` 决定离底多近还算"粘着"；用户往上翻即脱离，回到底部自动恢复。
- `status` 驱动读屏播报（`live-region`）：流式生成时不能每个字都播报。
- 内置"回到底部"入口，也可以自己画。
- 支持向上加载更早的消息，加载后保持视觉位置不跳。

## 示例

### 基础用法

root 的高度由外部给定，滚动才发生在 viewport 里面；root / viewport / content 三层缺一不可

<XhDemo src="thread/01-basic" />

### 粘底与回到底部

内容长高时自动跟到底；往上滚一下当场撒手，回到底部按钮随即露出，滚回阈值内又自动粘上

<XhDemo src="thread/02-stick" />

### 运行态与播报

status 由宿主持有，组件只把它透出成 data-status；viewport 恒 aria-live="off"，播报只发生在 live-region 里

<XhDemo src="thread/03-status" />

### 触底加载更多

stick-change 报到底，宿主据此去取下一页；先往上滚一段再滚回底部，取回来的消息追加在后面

<XhDemo src="thread/04-load-more" />

### 自己画回到底部的入口

在不在底、怎么滚回底部两件事外部都拿得到，不用内置那颗浮动按钮也能拼出一条自己的提示栏

<XhDemo src="thread/05-scroll-control" />

### 会话页

线程管滚动与粘底，编辑器管收话：发出去先落一条自己的消息，回话一段段写进来时消息区自动跟到底

<XhDemo src="thread/06-chat" />

### 向上加载更早的消息

视口的滚动事件直接监听：滚到接近顶部就去取上一页，取回来的插在最前面

<XhDemo src="thread/07-load-earlier" />

### 跳到指定的一条

视口节点与消息节点都在宿主手上：滚到顶、定位到某一条都是一次普通的 DOM 操作

<XhDemo src="thread/08-scroll-to" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-thread>` |
| Vue 组件 | `XhThreadContent` `XhThreadLiveRegion` `XhThreadRoot` `XhThreadScrollButton` `XhThreadViewport` |
| 组合式函数 | `useThread` |
| 状态机 | `threadMachine` |
| 皮肤 | `@xihan-ui/styles/thread.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="thread"`：**`root`** · **`viewport`** · **`content`** · `scroll-button` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | `ThreadStatus` |  | 这一轮的运行态，由宿主传入。 |
| `threshold` | `number` |  | 距底多少 px 视为在底，缺省用粘底原语的默认值。 |
| `translations` | `Partial<ThreadTranslations>` |  |  |
| `onStickChange` | `(details: ThreadStickChangeDetails) => void` |  | 粘底状态变化时通知宿主。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `stick-change` | `ThreadStickChangeDetails` | 粘底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhThreadRoot` | `default` | `ThreadRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | props.status |
| `viewport` | props.status |
| `scroll-button` | 'visible' \| 'hidden' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`STICK.CHANGE` · `SCROLL_TO_BOTTOM`

## connect API

`useThread` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ThreadStatus` |  |
| `atBottom` | `boolean` |  |
| `sticking` | `boolean` |  |
| `showScrollButton` | `boolean` | 是否显示回到底部按钮，不在底部时为 true。 |
| `scrollToBottom` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getScrollButtonProps` | `() => T['button']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 焦点进入消息区 | 消息区自身可聚焦，方向键/PageUp/PageDown 交给浏览器滚动，组件不接管 |
| `Space` / `Enter` | 焦点在"回到底部"按钮上 | 滚回底部并重新粘附 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `viewport` | `aria-label` | label.log |
| `viewport` | `aria-live` | 'off' |
| `viewport` | `role` | 'log' |
| `scroll-button` | `aria-label` | label.scrollToBottom |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/thread.css` 按部件选择：`[data-scope="thread"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-state` | props.status |
| `root` | `data-status` | props.status |
| `viewport` | `data-state` | props.status |
| `viewport` | `data-status` | props.status |
| `scroll-button` | `data-state` | 'visible' \| 'hidden' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-thread-content-gap` · `--xh-thread-content-py` · `--xh-thread-scroll-button-bg` · `--xh-thread-scroll-button-bg-active` · `--xh-thread-scroll-button-bg-hover` · `--xh-thread-scroll-button-border` · `--xh-thread-scroll-button-fg` · `--xh-thread-scroll-button-font-size` · `--xh-thread-scroll-button-font-weight` · `--xh-thread-scroll-button-gap` · `--xh-thread-scroll-button-h` · `--xh-thread-scroll-button-inset` · `--xh-thread-scroll-button-px` · `--xh-thread-scroll-button-radius` · `--xh-thread-scroll-button-shadow`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 下面接[消息编辑器](./composer)；消息里放[代码块](./code-block)与 `@xihan-ui/markdown`。

## 最佳实践

- 用户往上翻时绝不要强行拉回底部。
- 向上加载更早消息后要补偿滚动位置，否则视野会突然跳走。

## 反模式

- 流式生成时每个增量都播报给读屏：用户什么也听不清。
- 新消息到达时无条件滚到底，哪怕用户正在上面读。
