# 流式正文 <Badge type="info" text="markdown-stream" />

把已经渲好的 Markdown 块列表投影成带稳定 key 的正文结构，按块的种类分流。

## 何时使用

- 展示 AI 回复的正文，且正文是边生成边显示的。
- 正文里混着代码块与公式，需要各自交给专门的组件渲染。

## 何时不用

- 正文是一次性拿到的静态文档：直接渲染就好，不必经过流式内核。
- 只是一段纯文本：用[排印](./typography)。

## 特性

- **组件不解析 Markdown，也不持有渲染器。** 块列表由宿主调 `@xihan-ui/markdown` 的
  `createStreamRenderer().render(全文)` 得到后传进来；渲染器是有状态的，谁持有谁负责。
- 块的 `key` 是稳定的：生长中的那一块 key 恒定，定型的块 key 不再变化。
  框架据此复用同一份 DOM 只改文本，用户每收到一个字都被重建节点的话，选区与滚动位置全丢。
- **`html` 只对 markdown 块有效。** 代码块拿 `source` 交给[代码视图](./code-view)，
  公式块拿 `source` 交给宿主自选的公式引擎；不接管的降级结果是把原文当正文显示。
- 流式光标是皮肤的 `::after`，挂在生长那一块上，不做成组件。

## 示例

### 基础用法

块列表由宿主用流式渲染器得到，组件只按 key 铺开、按种类分流

<XhDemo src="markdown-stream/01-basic" />

### 流式增长

只有生长中的那一块每帧重渲，定型的块 key 不变、节点原地留着，选区与滚动位置才保得住

<XhDemo src="markdown-stream/02-streaming" />

### 代码块交给代码视图

markdown 块铺 html，代码块拿 source 交出去——照 html 渲会让同一段代码出现两次

<XhDemo src="markdown-stream/03-code-blocks" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-markdown-stream>` |
| Vue 组件 | `XhMarkdownStreamContent` `XhMarkdownStreamLiveRegion` `XhMarkdownStreamRoot` |
| 组合式函数 | `useMarkdownStream` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/markdown-stream.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="markdown-stream"`：**`root`** · **`content`** · `block` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `announce` | `'off' \| 'polite'` |  | 播报档位，默认 off——会话级播报区在消息流那一层，别在每条回复里各开一个。 |
| `blocks` | `readonly MarkdownBlock[]` | 是 | 已渲染好的块列表。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `streaming` | `boolean` |  | 这一段正文是否仍在增长，只落 data-streaming。 |
| `translations` | `Partial<MarkdownStreamTranslations>` |  |  |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMarkdownStreamContent` | `block` | `MarkdownStreamBlockSlotProps` |  |
| `XhMarkdownStreamRoot` | `default` | `MarkdownStreamRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'streaming' \| 'complete' |

## connect API

`useMarkdownStream` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `blocks` | `readonly MarkdownBlock[]` |  |
| `streaming` | `boolean` |  |
| `announcement` | `string \| undefined` | 播报文本；announce 为 off、或正文还在增长时为 undefined。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getBlockProps` | `(props: { block: MarkdownBlock }) => T['element']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
|  | 任何时候 | 组件不接管任何按键；块内的链接、代码块各自的停靠点由它们自己提供 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

- 正文不套 role，也不做成活区——每来一个 token 播报一次会把读屏刷爆。
- 要在一段回复写完时播报一句，把 `announce` 设成 `polite` 并渲出播报区。
  一个会话里只该有一个活区，多开会互相打断。

## 样式

默认皮肤 `@xihan-ui/styles/markdown-stream.css` 按部件选择：`[data-scope="markdown-stream"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'streaming' \| 'complete' |
| `block` | `data-complete` | ''（条件成立时才出现） |
| `block` | `data-kind` | block.kind |
| `block` | `data-lang` | block.lang |
| `block` | `data-live` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-markdown-stream-caret-bg` · `--xh-markdown-stream-caret-duration` · `--xh-markdown-stream-caret-h` · `--xh-markdown-stream-caret-shift` · `--xh-markdown-stream-caret-w` · `--xh-markdown-stream-fg` · `--xh-markdown-stream-font-size` · `--xh-markdown-stream-gap` · `--xh-markdown-stream-mono`

## 动效

关键帧 `xh-markdown-stream-caret` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 组合

- 代码块交给[代码视图](./code-view)，整段正文放进[消息流](./message-feed)的一条消息里。
- 逐字吐字的节奏由使用者驱动：`@xihan-ui/chat-stream` 的 `visibleLength` 是纯函数，
  时间原点与 rAF 循环由持有它的那一方写。

## 最佳实践

- 块列表整份传进来，别在外面切片：稳定 key 靠的就是整份列表的下标与内容。
- 代码块交出去时把 `complete` 一起带上，代码组件据此决定要不要着色。

## 反模式

- 每帧新建一个渲染器：缓存作废，长回复到后面会肉眼可见地卡。
- 把代码块的 `html` 与交给代码组件的那份同时渲出来：同一段代码会出现两次。
