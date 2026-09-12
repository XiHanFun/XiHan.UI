# Log 日志

一块等宽排版的滚动区域，一行一条，可以自动跟到底部。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/log" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/log.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/log" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/log" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/log.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

root / viewport / content / line 四层；一行写什么由作者定，组件只给身份与等宽排版

<XhDemo src="log/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="log"`：**`root`** · **`viewport`** · **`content`** · `line` · `scroll-to-end-trigger` · `live-region`

## 示例

### 按行数定高

rows 定的是「看得见几行」，一行有多高归皮肤，改 --xh-log-line-height 两边一起变

<XhDemo src="log/02-rows" />

### 自动跟到底部

新行进来时视口自己跟着走；往上滚一段就停住跟随，组件报出的 atBottom 与 scrollToBottom 够自己画一条回到最新

<XhDemo src="log/03-follow" />

### 取行中

loading 让日志区报 aria-busy 并把指针换成忙碌态；「正在拉取」那一行是作者自己渲的

<XhDemo src="log/04-loading" />

### 级别

行上写 level，四档 debug / info / warn / error 由皮肤染色；时间戳与行内标记仍归作者

<XhDemo src="log/05-levels" />

### 换成自绘滚动条

视口给个 id，用滚动条的 controls 挂上去；条子浮在内容之上，不占宽度也不留空道

<XhDemo src="log/06-scrollbar" />

### 回到底部与播报

往上翻一段，右下角那颗钮自己冒出来，按下去归位并重新粘附；输出跑完在播报区念一句结论

<XhDemo src="log/07-scroll-button" />

## 设计指引

### 何时使用

- 构建输出、运行日志、命令行回显。
- 任意会从底部往下长、希望一直跟到底的内容：内容不必分得出「第几条、谁说的」，
  一整段往里追加就行。

### 何时不用

- 内容是一段会话，条目有身份、要能逐条遍历：用[消息流](./message-feed)。
- 展示的是结构化记录、需要筛选排序：用[表格](./table)。
- 是一段代码：用[代码视图](./code-view)。

### 特性

- 骨架四层：`root` · `viewport` · `content` · `line`；一行写什么由作者定，组件只给身份与等宽排版。
  另有两个可缺省的部件：`scroll-to-end-trigger` 与 `live-region`。
- `rows` 按行数定高。
- 自动跟到底部；用户往上翻时停住跟随，回到底部再恢复。
- 内置「回到底部」：离底时冒出来，按下去归位并重新粘附。留空时皮肤画一枚向下的字形，
  往按钮里塞节点即换成自己的图形。
- 视口自身可聚焦，整块日志占一个 Tab 停靠位，方向键与翻页键交给浏览器滚动。

### 组合

- 行内可以用[文本高亮](./highlight)标出关键词。
- 给视口一个 id，把[滚动条](./scrollbar)的 `controls` 指过去，条子与视口平级摆在 `root` 里：它浮在内容之上，不占宽度。没挂自绘滚动条时视口自己留一条空道，原生滚动条出现与消失不会推动文字。

### 最佳实践

- 用户往上翻时不要强行拉回底部，那是最恼人的行为之一。
- 行数很大时截断或虚拟化，别把十万行全挂上去。

### 反模式

- 每来一行就整块重渲。
- 不给复制或下载全部日志的入口。
- 把每一行都写进播报区：读屏会被逐行打断，什么也听不清。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-log>` |
| Vue 组件 | `XhLogContent` `XhLogLine` `XhLogLiveRegion` `XhLogRoot` `XhLogScrollToEndTrigger` `XhLogViewport` |
| 组合式函数 | `useLog` |
| 状态机 | `logMachine` |
| 皮肤 | `@xihan-ui/styles/log.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `threshold` | `number` |  | 距底多少 px 视为在底，缺省用粘底原语的默认值。 |
| `onStickChange` | `(details: LogStickChangeDetails) => void` |  | 粘底状态变化时通知宿主。 |
| `loading` | `boolean` |  | 行还在路上：日志区报 aria-busy，根落 data-loading。 |
| `rows` | `number` |  | 视口按多少行定高；缺省时高度由皮肤给。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。改的是行文字号与内衬，行高不随档变。 |
| `translations` | `Partial<LogTranslations>` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `stick-change` | `LogStickChangeDetails` | 粘底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhLogRoot` | `default` | `LogRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `scroll-to-end-trigger` | 'visible' \| 'hidden' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`STICK.CHANGE` · `SCROLL_TO_BOTTOM`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `rows` | `number \| undefined` | 取整后的行数；rows 缺席或不是正数时为 undefined。 |
| `loading` | `boolean` |  |
| `atBottom` | `boolean` | 当前滚动位置是否落在底部阈值内。 |
| `sticking` | `boolean` | 新行进来时是否自动跟到底。 |
| `showScrollToEndTrigger` | `boolean` | 是否显示回到底部按钮，不在底部时为 true。 |
| `scrollToBottom` | `() => void` | 滚到底部并恢复粘附。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getLineProps` | `(props?: LogLineProps) => T['element']` |  |
| `getScrollToEndTriggerProps` | `() => T['button']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 焦点进入日志区 | 日志区自身可聚焦，方向键/PageUp/PageDown/Home/End 交给浏览器滚动，组件不接管 |
| `Space` / `Enter` | 焦点在"回到底部"按钮上 | 滚回底部并重新粘附 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `viewport` | `aria-busy` | 'true' \| undefined |
| `viewport` | `aria-label` | label.log |
| `viewport` | `aria-live` | 'off' |
| `viewport` | `role` | 'log' |
| `scroll-to-end-trigger` | `aria-label` | label.scrollToBottom |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

- 视口是 `role=log`，但它隐含的 `aria-live` 被显式关掉：一行来一句地念，连成串的输出
  就成了读屏里的噪声。
- 播报走独立的 `live-region`：宿主决定念哪一句、什么时候念，例如一段输出跑完之后念结论
  与错误条数。别把每一行原样写进去，那就等于把关掉的逐行播报又打开了一遍。
- 成批取行期间视口报 `aria-busy`；播报区是视口的兄弟节点，不受它压制。

## 样式参考

### 皮肤

`@xihan-ui/styles/log.css` 使用 `[data-scope="log"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-bottom` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-sticking` | ''（条件成立时才出现） |
| `line` | `data-level` | line?.level |
| `scroll-to-end-trigger` | `data-state` | 'visible' \| 'hidden' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-log-bg` | `root` | `background` | `default` | `--xh-bg-subtle` | log 的 root 部件 background 覆盖槽。 |
| `--xh-log-border` | `root` | `border` | `default` | `--xh-border-default` | log 的 root 部件 border 覆盖槽。 |
| `--xh-log-content-px` | `content` | `padding-inline` | `default` | `--xh-_log-content-px` | log 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-log-fg` | `root` | `color` | `default` | `--xh-fg-default` | log 的 root 部件 color 覆盖槽。 |
| `--xh-log-font` | `content` | `font-family` | `default` | `--xh-font-family-mono` | log 的 content 部件 font-family 覆盖槽。 |
| `--xh-log-font-size` | `content` | `font-size` | `default` | `--xh-_log-font-size` | log 的 content 部件 font-size 覆盖槽。 |
| `--xh-log-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | log 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-log-level-debug-fg` | `line` | `color` | `level=debug` | `--xh-fg-subtle` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-level-error-fg` | `line` | `color` | `level=error` | `--xh-fg-danger` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-level-info-fg` | `line` | `color` | `level=info` | `--xh-fg-default` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-level-warn-fg` | `line` | `color` | `level=warn` | `--xh-fg-warning` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-line-height` | `line`<br>`root`<br>`viewport` | `block-size`<br>`line-height` | `default` | `1.25rem` | log 的 line、root、viewport 部件 block-size、line-height 覆盖槽。 |
| `--xh-log-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | log 的 root 部件 border-radius 覆盖槽。 |
| `--xh-log-rows` | `viewport` | `block-size` | `default` | `16` | log 的 viewport 部件 block-size 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-bg` | `scroll-to-end-trigger` | `background` | `default` | `--xh-bg-surface-raised` | log 的 scroll-to-end-trigger 部件 background 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-bg-hover` | `scroll-to-end-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | log 的 scroll-to-end-trigger 部件 background 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-border` | `scroll-to-end-trigger` | `border` | `default` | `--xh-border-default` | log 的 scroll-to-end-trigger 部件 border 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-fg` | `scroll-to-end-trigger` | `color` | `default` | `--xh-fg-default` | log 的 scroll-to-end-trigger 部件 color 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-inset` | `scroll-to-end-trigger` | `inset-block-end`<br>`inset-inline-end` | `default` | `--xh-space-3` | log 的 scroll-to-end-trigger 部件 inset-block-end、inset-inline-end 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-radius` | `scroll-to-end-trigger` | `border-radius` | `default` | `--xh-shape-pill` | log 的 scroll-to-end-trigger 部件 border-radius 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-shadow` | `scroll-to-end-trigger` | `box-shadow` | `default` | `--xh-elevation-raised` | log 的 scroll-to-end-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-size` | `scroll-to-end-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-sm` | log 的 scroll-to-end-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-log-tab-size` | `line` | `tab-size` | `default` | `4` | log 的 line 部件 tab-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-log-button-in` 随皮肤自带，不引用别处文件里的名字；`background` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
