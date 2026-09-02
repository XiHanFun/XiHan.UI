# 日志 <Badge type="info" text="log" />

一块等宽排版的滚动区域，一行一条，可以自动跟到底部。

## 何时使用

- 构建输出、运行日志、命令行回显。
- 任意会从底部往下长、希望一直跟到底的内容：内容不必分得出「第几条、谁说的」，
  一整段往里追加就行。

## 何时不用

- 内容是一段会话，条目有身份、要能逐条遍历：用[消息流](./message-feed)。
- 展示的是结构化记录、需要筛选排序：用[表格](./table)。
- 是一段代码：用[代码视图](./code-view)。

## 特性

- 骨架四层：`root` · `viewport` · `content` · `line`；一行写什么由作者定，组件只给身份与等宽排版。
  另有两个可缺省的部件：`scroll-button` 与 `live-region`。
- `rows` 按行数定高。
- 自动跟到底部；用户往上翻时停住跟随，回到底部再恢复。
- 内置「回到底部」：离底时冒出来，按下去归位并重新粘附。留空时皮肤画一枚向下的字形，
  往按钮里塞节点即换成自己的图形。
- 视口自身可聚焦，整块日志占一个 Tab 停靠位，方向键与翻页键交给浏览器滚动。

## 示例

### 基础用法

root / viewport / content / line 四层；一行写什么由作者定，组件只给身份与等宽排版

<XhDemo src="log/01-basic" />

### 按行数定高

rows 定的是「看得见几行」，一行有多高归皮肤，改 --xh-log-line-height 两边一起变

<XhDemo src="log/02-rows" />

### 自动跟到底部

新行进来时视口自己跟着走；往上滚一段就停住跟随，组件报出的 atBottom 与 scrollToBottom 够自己画一条回到最新

<XhDemo src="log/03-follow" />

### 取行中

loading 让日志区报 aria-busy 并把指针换成忙碌态；「正在拉取」那一行是作者自己渲的

<XhDemo src="log/04-loading" />

### 行的样子归作者

line 只发身份与等宽排版，级别配色、时间戳、行内标记这些都写在行里

<XhDemo src="log/05-levels" />

### 换成自绘滚动条

视口给个 id，用滚动条的 controls 挂上去；条子浮在内容之上，不占宽度也不留空道

<XhDemo src="log/06-scrollbar" />

### 回到底部与播报

往上翻一段，右下角那颗钮自己冒出来，按下去归位并重新粘附；输出跑完在播报区念一句结论

<XhDemo src="log/07-scroll-button" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-log>` |
| Vue 组件 | `XhLogContent` `XhLogLine` `XhLogLiveRegion` `XhLogRoot` `XhLogScrollButton` `XhLogViewport` |
| 组合式函数 | `useLog` |
| 状态机 | `logMachine` |
| 皮肤 | `@xihan-ui/styles/log.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="log"`：**`root`** · **`viewport`** · **`content`** · `line` · `scroll-button` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `threshold` | `number` |  | 距底多少 px 视为在底，缺省用粘底原语的默认值。 |
| `onStickChange` | `(details: LogStickChangeDetails) => void` |  | 粘底状态变化时通知宿主。 |
| `loading` | `boolean` |  | 行还在路上：日志区报 aria-busy，根落 data-loading。 |
| `rows` | `number` |  | 视口按多少行定高；缺省时高度由皮肤给。 |
| `translations` | `Partial<LogTranslations>` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `stick-change` | `LogStickChangeDetails` | 粘底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhLogRoot` | `default` | `LogRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `scroll-button` | 'visible' \| 'hidden' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`STICK.CHANGE` · `SCROLL_TO_BOTTOM`

## connect API

`useLog` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `rows` | `number \| undefined` | 取整后的行数；rows 缺席或不是正数时为 undefined。 |
| `loading` | `boolean` |  |
| `atBottom` | `boolean` | 当前滚动位置是否落在底部阈值内。 |
| `sticking` | `boolean` | 新行进来时是否自动跟到底。 |
| `showScrollButton` | `boolean` | 是否显示回到底部按钮，不在底部时为 true。 |
| `scrollToBottom` | `() => void` | 滚到底部并恢复粘附。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getLineProps` | `() => T['element']` |  |
| `getScrollButtonProps` | `() => T['button']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 焦点进入日志区 | 日志区自身可聚焦，方向键/PageUp/PageDown/Home/End 交给浏览器滚动，组件不接管 |
| `Space` / `Enter` | 焦点在"回到底部"按钮上 | 滚回底部并重新粘附 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `viewport` | `aria-busy` | 'true' \| undefined |
| `viewport` | `aria-label` | label.log |
| `viewport` | `aria-live` | 'off' |
| `viewport` | `role` | 'log' |
| `scroll-button` | `aria-label` | label.scrollToBottom |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

- 视口是 `role=log`，但它隐含的 `aria-live` 被显式关掉：一行来一句地念，连成串的输出
  就成了读屏里的噪声。
- 播报走独立的 `live-region`：宿主决定念哪一句、什么时候念，例如一段输出跑完之后念结论
  与错误条数。别把每一行原样写进去，那就等于把关掉的逐行播报又打开了一遍。
- 成批取行期间视口报 `aria-busy`；播报区是视口的兄弟节点，不受它压制。

## 样式

默认皮肤 `@xihan-ui/styles/log.css` 按部件选择：`[data-scope="log"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-bottom` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-sticking` | ''（条件成立时才出现） |
| `scroll-button` | `data-state` | 'visible' \| 'hidden' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-log-bg` · `--xh-log-border` · `--xh-log-content-px` · `--xh-log-fg` · `--xh-log-font` · `--xh-log-font-size` · `--xh-log-icon-size` · `--xh-log-line-height` · `--xh-log-radius` · `--xh-log-rows` · `--xh-log-scroll-button-bg` · `--xh-log-scroll-button-bg-hover` · `--xh-log-scroll-button-border` · `--xh-log-scroll-button-fg` · `--xh-log-scroll-button-inset` · `--xh-log-scroll-button-radius` · `--xh-log-scroll-button-shadow` · `--xh-log-scroll-button-size` · `--xh-log-tab-size`

## 动效

关键帧 `xh-log-button-in` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 行内可以用[文本高亮](./highlight)标出关键词。
- 给视口一个 id，把[滚动条](./scrollbar)的 `controls` 指过去，条子与视口平级摆在 `root` 里：它浮在内容之上，不占宽度。没挂自绘滚动条时视口自己留一条空道，原生滚动条出现与消失不会推动文字。

## 最佳实践

- 用户往上翻时不要强行拉回底部，那是最恼人的行为之一。
- 行数很大时截断或虚拟化，别把十万行全挂上去。

## 反模式

- 每来一行就整块重渲。
- 不给复制或下载全部日志的入口。
- 把每一行都写进播报区：读屏会被逐行打断，什么也听不清。
