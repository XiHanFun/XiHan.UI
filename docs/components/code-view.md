# CodeView 代码视图 <Badge type="info" text="alpha" />

一段代码的逐行呈现：行号、指定行高亮、超长折叠、文件名，可选语法着色，支持流式追加时的未闭合状态。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/code-view" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/code-view.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/code-view" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/code-view" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/code-view.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

代码原文由宿主给，组件切出逐行结构并铺记号；渲了文件名它就成为代码块的可访问名

<XhDemo src="code-view/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="code-view"`：**`root`** · `header` · `filename` · `lang-label` · **`pre`** · **`code`** · `line` · `line-number` · `line-content` · `token` · `fold-trigger`

## 示例

### 行号与高亮行

行号由皮肤画上去，复制代码不会带上它；高亮行按行号写，与 startLine 对齐

<XhDemo src="code-view/02-line-numbers" />

### 折叠超长代码

clamped 是纯受控的：组件只发意图，落不落由宿主决定，好让「全部展开」这类操作统一持有

<XhDemo src="code-view/03-fold" />

### 流式追加

代码还在写的时候默认不着色：半截代码的词法本来就不稳，每来一个字符整块变色比不着色更糟

<XhDemo src="code-view/04-streaming" />

### 头部内建复制

复制交给剪贴板：把它放进头部条，用几个槽把描边按钮压成安静形态，1500 毫秒后自己回落

<XhDemo src="code-view/05-copy" />

### 着色端口

着色是可换的端口：认不出的语言退回纯文本，接自己的实现组件侧一行不用改，传 null 则整个关掉

<XhDemo src="code-view/06-highlighter" />

### 流式期间也着色

未闭合默认不着色；真要看着色就打开 highlight-while-streaming，同一段半截代码的两种呈现摆在一起

<XhDemo src="code-view/07-streaming-highlight" />

### 尺寸

size 换字号、行高与内边距三档，行号槽与折叠钮跟着一起走

<XhDemo src="code-view/08-size" />

## 设计指引

### 何时使用

- 在 AI 回复、文档、评审意见中展示代码，需要行号或需要指出某几行。
- 代码是流式生成的，需要边接收边渲染，闭合之后再着色。
- 代码较长，默认只显示前若干行。

### 何时不用

- 只是一小段行内标识时，使用[排印](./typography)的 `code` 形态。
- 展示运行日志时，使用[日志](./log)。
- 展示改动前后时，使用[差异视图](./diff-view)。

### 特性

- 逐行切分在连接层完成。一个记号可以横跨多行（未闭合的字符串与块注释），因此行号与高亮行不能由皮肤反推。
- `complete` 标记这段代码是否已经写完。未闭合时默认不着色：半截代码的词法不稳定，逐字符变色比不着色更差。
- `highlighter` 是着色端口，由宿主决定接入哪个着色器；返回 `null` 是合法结果，回到纯文本。适配器默认接 `@xihan-ui/code-highlight`，它是可选 peer：已安装时自动着色，未安装时保持纯文本。适配器显式传 `null` 时不请求默认模块；只有模块缺席才回到纯文本，已安装模块的加载或初始化异常照常抛出。
- 行号由皮肤用 `attr()` 绘制，复制代码不会带上行号，读屏也不会逐行读出数字。
- `clamped` 是纯受控的：折叠状态通常由外部“全部展开 / 全部折叠”统一持有，内建状态会与之冲突。

### 组合

- 与[剪贴板](./clipboard)配合提供复制；需要非受控折叠时放入[折叠区域](./collapsible)。把剪贴板的三个部件放进 `header`，再用 `--xh-clipboard-copy-trigger-border: transparent`、`--xh-clipboard-copy-trigger-bg: transparent`、`--xh-clipboard-copy-trigger-h: var(--xh-control-h-sm)` 三个槽把按钮调整为头部内的低强调形态。
- 内建词法只区分注释、字符串、数字、关键字、标点五档。需要区分函数名、类型名、属性名时，自行实现 `highlighter` 端口（同步纯函数，可接 Shiki 等）传入，皮肤按记号种类上色的规则不变。
- 放进 AI 回复正文时由[流式正文](./markdown-stream)交付代码块。

### 最佳实践

- 标出语言，读者与着色器都需要它。
- 高亮行用于指出重点，不一次点亮半屏。
- 折叠阈值取十几行：过少时读者每次都要展开，过多时折叠失去意义。

### 反模式

- 把代码放进普通段落，空白与换行会被折叠。
- 用行号作为跳转锚点，它是绘制上去的，DOM 中不可选中。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-code-view>` |
| Vue 组件 | `XhCodeViewCode` `XhCodeViewFilename` `XhCodeViewFoldTrigger` `XhCodeViewHeader` `XhCodeViewLangLabel` `XhCodeViewPre` `XhCodeViewRoot` |
| 组合式函数 | `useCodeView` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/code-view.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `clamp` | `number` |  | 超过该行数才视为可折叠。 |
| `clamped` | `boolean` |  | 折叠态，纯受控：没有 defaultClamped，需要非受控时套用 collapsible。 |
| `code` | `string` | 是 |  |
| `complete` | `boolean` |  | 代码是否已闭合，未闭合时按行数预撑高度且默认不着色。 |
| `filename` | `string` |  | 文件名，渲染在 header 中；渲染之后它即为 pre 的可访问名。 |
| `highlighter` | `HighlighterPort` |  | 着色实现。未提供时为纯文本，提供后也允许返回 null（语言未识别等），同样回退为纯文本。 未闭合的块默认不着色，见 {@link highlightWhileStreaming}。 |
| `highlightLines` | `string \| readonly number[]` |  | 要高亮的行号，写为 `'3,7-9'` 或行号数组；非法片段丢弃不报错。 |
| `highlightWhileStreaming` | `boolean` |  | 块尚未闭合时也着色，默认 false。 默认关闭是因为未闭合代码的词法本身不稳定：引号、括号随时会配对， 每到一个 token 整块变一次色，比不着色更差。 |
| `labelled` | `boolean` |  | 作者渲染了 filename 部件时置真，由适配器统计而不是判断 filename 是否有值。 为假时 pre 用 translations.code 兜底：指向未渲染的 id 会使读屏读空。 |
| `lang` | `string` |  | 围栏语言标注，空白一律落为 plaintext。 |
| `lineNumbers` | `boolean` |  | 渲染行号槽。 |
| `onClampToggle` | `(details: CodeViewClampToggleDetails) => void` |  | 折叠态切换的意图回调；clamped 是纯受控的，是否落定由宿主决定。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `startLine` | `number` |  | 首行的行号，默认 1；摘录与 patch 片段需要使用。 |
| `translations` | `Partial<CodeViewTranslations>` |  |  |
| `wrap` | `boolean` |  | 长行自动换行，默认关闭（长行横向滚动）。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `clamp-toggle` | `CustomEvent` | 折叠态切换的意图；detail 为 `{ clamped: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCodeViewCode` | `line` | `CodeViewLineSlotProps` |  |
| `XhCodeViewRoot` | `default` | `CodeViewRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `fold-trigger` | 'closed' \| 'open' |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `lang` | `string` |  |
| `lineCount` | `number` |  |
| `lines` | `readonly CodeLine[]` | 逐行切分后的文本与记号片段。 |
| `lineNumberAt` | `(index: number) => number` | 每行的行号，与 lines 同序。 |
| `lineNumbers` | `boolean` | 是否渲染行号槽；适配器据此决定是否创建该节点。 |
| `foldable` | `boolean` | 折叠可用：提供了正数 clamp 且行数确实超过它。 |
| `clamped` | `boolean` |  |
| `setClamped` | `(next: boolean) => void` | 发出一次折叠意图；与当前态相同时不发。 |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getFilenameProps` | `() => T['element']` |  |
| `getLangLabelProps` | `() => T['element']` |  |
| `getPreProps` | `() => T['element']` |  |
| `getCodeProps` | `() => T['element']` |  |
| `getLineProps` | `(props: CodeViewLineProps) => T['element']` |  |
| `getLineNumberProps` | `(props: CodeViewLineProps) => T['element']` |  |
| `getLineContentProps` | `(props: CodeViewLineProps) => T['element']` |  |
| `getTokenProps` | `(token: CodeToken) => T['element']` |  |
| `getFoldTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 代码块在 Tab 序列中 | &lt;pre&gt; 自身可聚焦，随后方向键的横向滚动交给浏览器，组件不接管 |
| `Enter` / `Space` | 焦点在折叠按钮上 | 翻面折叠态并发出意图；组件只接 click，按键走原生 button 的默认行为 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `lang-label` | `aria-hidden` | 'true' |
| `pre` | `role` | 'group' |
| `line-number` | `aria-hidden` | 'true' |
| `fold-trigger` | `aria-controls` | `pre` 部件的 id |
| `fold-trigger` | `aria-expanded` | 'false' \| 'true' |
| `fold-trigger` | `aria-label` | props.translations?.expand \| props.translations?.collapse |

- `pre` 可聚焦并带可访问名称：渲染了文件名时指向它，否则使用 `translations.code`。
- 折叠按钮带 `aria-expanded` 与 `aria-controls`，指向 `pre`。
- 语言角标与行号槽都对读屏隐藏，它们是装饰而非内容。

## 样式参考

### 皮肤

`@xihan-ui/styles/code-view.css` 使用 `[data-scope="code-view"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-clamped` | ''（条件成立时才出现） |
| `root` | `data-complete` | ''（条件成立时才出现） |
| `root` | `data-digits` | String(Math.min( String(lineNumberAt(lineCount - 1)).… |
| `root` | `data-foldable` | ''（条件成立时才出现） |
| `root` | `data-lang` | props.lang?.trim() \|\| CODE_VIEW_FALLBACK_LANG |
| `root` | `data-line-numbers` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `pre` | `data-complete` | ''（条件成立时才出现） |
| `pre` | `data-wrap` | ''（条件成立时才出现） |
| `code` | `data-lang` | props.lang?.trim() \|\| CODE_VIEW_FALLBACK_LANG |
| `code` | `data-wrap` | ''（条件成立时才出现） |
| `token` | `data-kind` | token.kind |
| `fold-trigger` | `data-state` | 'closed' \| 'open' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-code-view-bg` | `root` | `background` | `default` | `--xh-bg-surface` | code-view 的 root 部件 background 覆盖槽。 |
| `--xh-code-view-border` | `root` | `border` | `default` | `--xh-border-default` | code-view 的 root 部件 border 覆盖槽。 |
| `--xh-code-view-comment-fg` | `token` | `color` | `kind=comment` | `--xh-fg-muted` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-fg` | `root` | `color` | `default` | `--xh-fg-muted` | code-view 的 root 部件 color 覆盖槽。 |
| `--xh-code-view-filename-fg` | `filename` | `color` | `default` | `--xh-fg-default` | code-view 的 filename 部件 color 覆盖槽。 |
| `--xh-code-view-fold-bg-hover` | `fold-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | code-view 的 fold-trigger 部件 background 覆盖槽。 |
| `--xh-code-view-fold-fg` | `fold-trigger` | `color` | `default` | `--xh-fg-muted` | code-view 的 fold-trigger 部件 color 覆盖槽。 |
| `--xh-code-view-fold-py` | `fold-trigger` | `padding-block` | `default` | `--xh-space-2` | code-view 的 fold-trigger 部件 padding-block 覆盖槽。 |
| `--xh-code-view-font` | `code`<br>`filename` | `font-family` | `default` | `--xh-font-family-mono` | code-view 的 code、filename 部件 font-family 覆盖槽。 |
| `--xh-code-view-font-size` | `root` | `font-size` | `default` | `--xh-_code-view-font-size` | code-view 的 root 部件 font-size 覆盖槽。 |
| `--xh-code-view-gutter-border` | `line-number` | `border-inline-end` | `default` | `--xh-border-default` | code-view 的 line-number 部件 border-inline-end 覆盖槽。 |
| `--xh-code-view-gutter-gap` | `line-number` | `padding-inline-end` | `default` | `--xh-space-1` | code-view 的 line-number 部件 padding-inline-end 覆盖槽。 |
| `--xh-code-view-header-border` | `fold-trigger`<br>`header` | `border-block-end`<br>`border-block-start` | `default` | `--xh-border-subtle` | code-view 的 fold-trigger、header 部件 border-block-end、border-block-start 覆盖槽。 |
| `--xh-code-view-header-fg` | `header` | `color` | `default` | `--xh-fg-muted` | code-view 的 header 部件 color 覆盖槽。 |
| `--xh-code-view-header-font-size` | `fold-trigger`<br>`header` | `font-size` | `default` | `--xh-text-secondary-size` | code-view 的 fold-trigger、header 部件 font-size 覆盖槽。 |
| `--xh-code-view-header-gap` | `header` | `gap` | `default` | `--xh-space-2` | code-view 的 header 部件 gap 覆盖槽。 |
| `--xh-code-view-header-h` | `header` | `min-block-size` | `default` | `--xh-control-h-lg` | code-view 的 header 部件 min-block-size 覆盖槽。 |
| `--xh-code-view-header-px` | `header` | `padding-inline` | `default` | `--xh-space-4` | code-view 的 header 部件 padding-inline 覆盖槽。 |
| `--xh-code-view-header-py` | `header` | `padding-block` | `default` | `--xh-space-2` | code-view 的 header 部件 padding-block 覆盖槽。 |
| `--xh-code-view-highlight-bar` | `line` | `box-shadow`<br>`outline`<br>`outline-offset` | `@media print`<br>`highlighted` | `--xh-stroke-thick` | code-view 的 line 部件 box-shadow、outline、outline-offset 覆盖槽。 |
| `--xh-code-view-highlight-bg` | `line` | `background` | `highlighted` | `--xh-bg-brand-subtle` | code-view 的 line 部件 background 覆盖槽。 |
| `--xh-code-view-highlight-fg` | `line` | `box-shadow` | `highlighted` | `--xh-bg-brand` | code-view 的 line 部件 box-shadow 覆盖槽。 |
| `--xh-code-view-keyword-fg` | `token` | `color` | `kind=keyword` | `--xh-syntax-keyword` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-keyword-weight` | `token` | `font-weight` | `kind=keyword` | `--xh-font-weight-semibold` | code-view 的 token 部件 font-weight 覆盖槽。 |
| `--xh-code-view-label-fg` | `lang-label` | `color` | `default` | `--xh-fg-subtle` | code-view 的 lang-label 部件 color 覆盖槽。 |
| `--xh-code-view-label-font-size` | `lang-label` | `font-size` | `default` | `--xh-text-caption-size` | code-view 的 lang-label 部件 font-size 覆盖槽。 |
| `--xh-code-view-line-height` | `line`<br>`pre` | `line-height`<br>`min-block-size` | `default` | `--xh-text-code-leading` | code-view 的 line、pre 部件 line-height、min-block-size 覆盖槽。 |
| `--xh-code-view-number-fg` | `line-number` | `color` | `default` | `--xh-fg-subtle` | code-view 的 line-number 部件 color 覆盖槽。 |
| `--xh-code-view-number-font-size` | `line-number` | `font-size` | `default` | `--xh-text-caption-size` | code-view 的 line-number 部件 font-size 覆盖槽。 |
| `--xh-code-view-number-token-fg` | `token` | `color` | `kind=number` | `--xh-syntax-number` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-punctuation-fg` | `token` | `color` | `kind=punctuation` | `--xh-fg-subtle` | code-view 的 token 部件 color 覆盖槽。 |
| `--xh-code-view-px` | `fold-trigger`<br>`line`<br>`line-content`<br>`line-number`<br>`root` | `padding-inline`<br>`padding-inline-end`<br>`padding-inline-start` | `default`<br>`line-numbers`<br>`not([data-line-numbers])` | `--xh-space-3` | code-view 的 fold-trigger、line、line-content、line-number、root 部件 padding-inline、padding-inline-end、padding-inline-start 覆盖槽。 |
| `--xh-code-view-py` | `pre` | `padding-block` | `default` | `--xh-space-3` | code-view 的 pre 部件 padding-block 覆盖槽。 |
| `--xh-code-view-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | code-view 的 root 部件 border-radius 覆盖槽。 |
| `--xh-code-view-shadow` | `root` | `box-shadow` | `default` | `--xh-elevation-raised` | code-view 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-code-view-string-fg` | `token` | `color` | `kind=string` | `--xh-syntax-string` | code-view 的 token 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `box-shadow` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
