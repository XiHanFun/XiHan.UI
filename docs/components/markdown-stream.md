# MarkdownStream 流式正文 <Badge type="info" text="alpha" />

把已渲染的 Markdown 块列表投影为带稳定 key 的正文结构，按块的种类分流。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/markdown-stream" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/markdown-stream.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/markdown-stream" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/markdown-stream" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/markdown-stream.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

块列表由宿主用流式渲染器得到，组件只按 key 铺开、按种类分流

<XhDemo src="markdown-stream/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="markdown-stream"`：**`root`** · **`content`** · `block` · `live-region`

## 示例

### 流式增长

只有生长中的块每帧重渲，定型的块 key 不变、节点原地保留，选区与滚动位置才能保持；生长块里没写完的加粗先按闭合显示，不露出星号

<XhDemo src="markdown-stream/02-streaming" />

### 代码块交给代码视图

markdown 块铺设 html，代码块取 source 交出：按 html 渲染会使同一段代码出现两次

<XhDemo src="markdown-stream/03-code-blocks" />

### 流式光标

尚未收到任何块时光标就已存在，caret 设为 false 可以整个关闭

<XhDemo src="markdown-stream/04-caret" />

### 尺寸

size 改变正文字号与块间距，三档共用同一份块列表

<XhDemo src="markdown-stream/05-size" />

### GFM 扩展

任务列表、脚注与裸地址自动成链：渲染器按 GFM 认出它们，脚注角标按首次引用编号并链到文末定义

<XhDemo src="markdown-stream/06-gfm" />

### 行内引用与公式

正文里的 [@来源] 与 $…$ 在 html 里是占位节点，citation / math 插槽把引用角标与公式渲进去；角标就是引用来源组件的 trigger

<XhDemo src="markdown-stream/07-inline-slots" />

## 设计指引

### 何时使用

- 展示 AI 回复的正文，且正文边生成边显示。
- 正文中混有代码块与公式，需要分别交给专门的组件渲染。

### 何时不用

- 正文是一次性获取的静态文档时，直接渲染，不经过流式内核。
- 只是一段纯文本时，使用[排印](./typography)。

### 特性

- 组件不解析 Markdown，也不持有渲染器。块列表由宿主调用 `@xihan-ui/markdown` 的 `createStreamRenderer().render(全文)` 得到后传入；渲染器有状态，由持有方负责。
- 块的 `key` 稳定：生长中的块 key 不变，定型的块 key 不再变化。框架据此复用同一份 DOM 只更新文本；每收到一个字就重建节点会丢失选区与滚动位置。
- `html` 只对 markdown 块有效。代码块取 `source` 交给[代码视图](./code-view)，公式块取 `source` 交给宿主选择的公式引擎；不接管时的降级结果是把原文作为正文显示。
- 流式光标是皮肤的 `::after`，不做成组件。它绘制在带 `data-caret` 的部件上：正文增长时是生长中的块，尚无任何块时是外壳，因此请求刚发出、尚无内容时页面上也有反馈。`caret` 设为 `false` 时两处都不发该属性。
- 光标在等待第一个字时闪烁，出字后停为实心：正文本身在变化，继续闪烁只是噪声。
- 生长块不露原始符号：渲染器对还在生长的最后一块做行内容错，没写完的 `**粗`、`*斜`、`~~删`、`` `代码 `` 先按闭合显示，开符号后面还没有字时先不显示这个符号；写到一半的链接只显示文字，图片、行内引用与脚注写到一半时整段先不显示。块定型或流结束后按原文严格解析，没闭合的符号原样显示。
- 渲染器认 GFM 的任务列表（`- [ ]` / `- [x]`，渲成只读勾选框，`li` 带 `data-task`）、脚注（`[^标签]` 角标按首次引用编号，`[^标签]:` 定义渲成带回链的脚注列表）与裸地址自动成链（`https://…`、`www.…`）。同一页上有几段正文带脚注时，给各自的渲染器传不同的 `idPrefix`。
- 行内引用 `[@来源]`（一处多源写 `[@甲; @乙]`）与行内公式 `$…$` 在 html 里是占位节点（带 `data-md-inline`），块的 `inlines` 按出现先后给出挂点内容。`citation` / `math` 插槽（React 为 `renderCitation` / `renderMath`，Web Components 为 `inline-mount` 事件）把引用角标与公式引擎的产物渲进占位节点；不接管时占位节点显示降级内容（来源 id、TeX 原文）。金额里的美元符号（`$5 和 $10`）不成公式。

### 组合

- 代码块交给[代码视图](./code-view)，整段正文放入[消息流](./message-feed)的一条消息。
- 逐字输出的节奏由使用者驱动：`@xihan-ui/chat-stream` 的 `visibleLength` 是纯函数，时间原点与 rAF 循环由持有方编写。
- 行内来源角标接[引用来源](./citation)：把流式正文放进引用来源的 `text` 部件，`citation` 插槽里渲 `XhCitationTrigger`，角标与来源预览、来源列表共用同一套可访问关系。Web Components 在 `inline-mount` 里放一个 `data-xh-part="trigger"` 并声明 `data-xh-part-owner="citation"`，外层 `xh-citation` 即认领并接线。
- 行内公式交给宿主选的公式引擎：`math` 插槽拿到未经转义的 TeX 原文与 `display`，块级 `$$` 公式仍走 `block` 插槽。组件不向已消毒的 html 里插入别的节点，挂点只有这些占位节点。

### 最佳实践

- 块列表整份传入，不在外部切片：稳定 key 依赖整份列表的下标与内容。
- 交出代码块时一并传递 `complete`，代码组件据此决定是否着色。

### 反模式

- 每帧新建渲染器：缓存失效，长回复后段会明显卡顿。
- 同时渲染代码块的 `html` 与交给代码组件的内容：同一段代码会出现两次。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-markdown-stream>` |
| Vue 组件 | `XhMarkdownStreamContent` `XhMarkdownStreamLiveRegion` `XhMarkdownStreamRoot` |
| 组合式函数 | `useMarkdownStream` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/markdown-stream.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `announce` | `'off' \| 'polite' \| 'assertive'` |  | 播报档位，默认 off：会话级播报区在消息流层，不在每条回复中各开一个。 |
| `blocks` | `readonly MarkdownBlock[]` | 是 | 已渲染完成的块列表。 |
| `caret` | `boolean` |  | 是否绘制流式光标，默认绘制。设为 false 时不发出任何 data-caret。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `streaming` | `boolean` |  | 该段正文是否仍在增长，只写 data-streaming。 |
| `translations` | `Partial<MarkdownStreamTranslations>` |  |  |

### MarkdownBlock

`blocks` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `key` | `string` | 是 | 稳定 key。生长中的块恒为 {@link MARKDOWN_STREAM_LIVE_KEY}。 |
| `kind` | `'markdown' \| 'code' \| 'math' \| 'html'` | 是 |  |
| `html` | `string` | 是 | 已消毒的 HTML。只对 kind 为 markdown 的块有效，见 {@link markdownBlockHtml}。 |
| `complete` | `boolean` | 是 | 该块是否已闭合。 |
| `lang` | `string` |  | 围栏语言标注，仅 code 块有。 |
| `source` | `string` |  | 块正文原文，仅 code 与 math 块有。 |
| `inlines` | `readonly MarkdownInline[]` |  | 块正文里的行内挂点（行内引用与行内公式），按在 html 里出现的先后排；没有时缺席。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `inline-mount` | `CustomEvent` | 新铺出一个行内挂点的占位节点；detail 为 `{ key, element, block, index, inline }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMarkdownStreamContent` | `block` | `MarkdownStreamBlockSlotProps` |  |
| `XhMarkdownStreamContent` | `citation` | `MarkdownStreamCitationSlotProps` |  |
| `XhMarkdownStreamContent` | `math` | `MarkdownStreamMathSlotProps` |  |
| `XhMarkdownStreamRoot` | `default` | `MarkdownStreamRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhMarkdownStreamContent` | `children` | `SlotChildren<MarkdownStreamBlockSlotProps>` |  | 逐块接管该块的正文；未提供时按块类型铺设。 |
| `XhMarkdownStreamContent` | `renderCitation` | `(props: MarkdownStreamCitationSlotProps) => ReactNode` |  | 渲染行内引用：渲进 html 里的占位节点，未提供时占位节点显示来源 id。 |
| `XhMarkdownStreamContent` | `renderMath` | `(props: MarkdownStreamMathSlotProps) => ReactNode` |  | 渲染行内公式：渲进 html 里的占位节点，未提供时占位节点显示 TeX 原文。 |
| `XhMarkdownStreamRoot` | `children` | `SlotChildren<MarkdownStreamRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'streaming' \| 'complete' |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `blocks` | `readonly MarkdownBlock[]` |  |
| `streaming` | `boolean` |  |
| `announcement` | `string \| undefined` | 播报文本；announce 为 off、或正文仍在增长时为 undefined。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getBlockProps` | `(props: { block: MarkdownBlock }) => T['element']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
|  | 任何时候 | 组件不接管任何按键；块内的链接、代码块各自的停靠点由它们自己提供 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'assertive' \| 'polite' |
| `live-region` | `role` | 'alert' \| 'status' |

- 正文不加 role，也不做成活动区域：每个 token 播报一次会淹没读屏。
- 需要在一段回复完成时播报一句，把 `announce` 设为 `polite` 并渲染播报区。一个会话中只应有一个活动区域，多个会互相打断。

## 样式参考

### 皮肤

`@xihan-ui/styles/markdown-stream.css` 使用 `[data-scope="markdown-stream"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-caret` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'streaming' \| 'complete' |
| `block` | `data-caret` | ''（条件成立时才出现） |
| `block` | `data-complete` | ''（条件成立时才出现） |
| `block` | `data-kind` | block.kind |
| `block` | `data-lang` | block.lang |
| `block` | `data-live` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-markdown-stream-caret-bg` | `block`<br>`root` | `background` | `caret` | `--xh-fg-default` | markdown-stream 的 block、root 部件 background 覆盖槽。 |
| `--xh-markdown-stream-caret-duration` | `root` | `animation` | `caret` | `--xh-motion-loop-caret` | markdown-stream 的 root 部件 animation 覆盖槽。 |
| `--xh-markdown-stream-caret-enter-duration` | `block` | `animation` | `caret` | `--xh-motion-duration-enter` | markdown-stream 的 block 部件 animation 覆盖槽。 |
| `--xh-markdown-stream-caret-gap` | `block`<br>`root` | `margin-inline-start` | `caret` | `0.1em` | markdown-stream 的 block、root 部件 margin-inline-start 覆盖槽。 |
| `--xh-markdown-stream-caret-h` | `block`<br>`root` | `block-size` | `caret` | `1.05em` | markdown-stream 的 block、root 部件 block-size 覆盖槽。 |
| `--xh-markdown-stream-caret-radius` | `block`<br>`root` | `border-radius` | `caret` | `--xh-shape-inset` | markdown-stream 的 block、root 部件 border-radius 覆盖槽。 |
| `--xh-markdown-stream-caret-shift` | `block`<br>`root` | `translate` | `caret` | `-0.5px` | markdown-stream 的 block、root 部件 translate 覆盖槽。 |
| `--xh-markdown-stream-caret-w` | `block`<br>`root` | `inline-size` | `caret` | `--xh-stroke-thick` | markdown-stream 的 block、root 部件 inline-size 覆盖槽。 |
| `--xh-markdown-stream-fg` | `root` | `color` | `default` | `--xh-fg-default` | markdown-stream 的 root 部件 color 覆盖槽。 |
| `--xh-markdown-stream-font-size` | `root` | `font-size` | `default` | `--xh-_markdown-stream-font-size` | markdown-stream 的 root 部件 font-size 覆盖槽。 |
| `--xh-markdown-stream-gap` | `content` | `gap` | `default` | `--xh-_markdown-stream-gap` | markdown-stream 的 content 部件 gap 覆盖槽。 |
| `--xh-markdown-stream-leading` | `root` | `line-height` | `default` | `--xh-text-prose-leading` | markdown-stream 的 root 部件 line-height 覆盖槽。 |
| `--xh-markdown-stream-mono` | `block` | `font-family` | `kind=code`<br>`kind=math` | `--xh-font-family-mono` | markdown-stream 的 block 部件 font-family 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：出现 · 循环（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-markdown-stream-caret-duration` · `--xh-markdown-stream-caret-enter-duration`。

关键帧 `xh-markdown-stream-caret` · `xh-markdown-stream-caret-in` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
