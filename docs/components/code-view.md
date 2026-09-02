# 代码视图 <Badge type="info" text="code-view" />

一段代码的逐行呈现：行号、指定行高亮、超长折叠、文件名，可选语法着色，支持流式追加时的未闭合状态。

## 何时使用

- AI 回复、文档、评审意见里展示一段代码，需要行号或要点出某几行。
- 代码是流式生成的，需要边来边渲，闭合之后再着色。
- 一段代码很长，默认只想露出前若干行。

## 何时不用

- 只是一小段行内标识：用[排印](./typography)的 `code` 形态。
- 展示的是运行日志：用[日志](./log)。
- 要展示改动前后：用[差异视图](./diff-view)。

## 特性

- 逐行切分在连接层完成。一个记号可以横跨多行（未闭合的字符串与块注释就是这样），
  所以行号与高亮行不是皮肤能反推出来的东西。
- `complete` 标出这段代码是否已经写完。未闭合时默认不着色——半截代码的词法本来就不稳，
  每来一个字符整块变一次色比不着色更糟。
- `highlighter` 是一个着色端口，接哪个着色器由宿主决定；它返回 `null` 是合法结果，退回纯文本。
- 行号由皮肤用 `attr()` 画出来，因此**复制代码不会带上行号**，读屏也不会逐行念数字。
- `clamped` 是纯受控的：折叠态通常由外部「全部展开 / 全部折叠」统一持有，内建一份只会跟它打架。

## 示例

### 基础用法

代码原文由宿主给，组件切出逐行结构并铺记号；渲了文件名它就成为代码块的可访问名

<XhDemo src="code-view/01-basic" />

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-code-view>` |
| Vue 组件 | `XhCodeViewCode` `XhCodeViewFilename` `XhCodeViewFoldTrigger` `XhCodeViewHeader` `XhCodeViewLangLabel` `XhCodeViewPre` `XhCodeViewRoot` |
| 组合式函数 | `useCodeView` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/code-view.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="code-view"`：**`root`** · `header` · `filename` · `lang-label` · **`pre`** · **`code`** · `line` · `line-number` · `line-content` · `token` · `fold-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `clamp` | `number` |  | 超过这么多行才算可折叠。 |
| `clamped` | `boolean` |  | 折叠态，纯受控——没有 defaultClamped，要非受控就套 collapsible。 |
| `code` | `string` | 是 |  |
| `complete` | `boolean` |  | 代码是否已闭合，未闭合时按行数预撑高度且默认不着色。 |
| `filename` | `string` |  | 文件名，渲染在 header 里；渲染出来之后它就是 pre 的可访问名。 |
| `highlighter` | `HighlighterPort` |  | 着色实现。不给就是纯文本，给了也允许它返回 null（语言不认识之类），同样退回纯文本。 未闭合的块默认不着色，见 {@link highlightWhileStreaming}。 |
| `highlightLines` | `string \| readonly number[]` |  | 要高亮的行号，写成 `'3,7-9'` 或行号数组；非法片段丢弃不报错。 |
| `highlightWhileStreaming` | `boolean` |  | 块还没闭合时也着色，默认 false。 默认关是因为半截代码的词法本来就不稳——引号、括号随时会配上， 每来一个 token 整块变一次色，看着比不着色更糟。 |
| `labelled` | `boolean` |  | 作者渲染了 filename 部件时置真，由适配器统计而不是看 filename 有没有值。 为假时 pre 用 translations.code 兜底——指向一个没渲出来的 id 会让读屏读空。 |
| `lang` | `string` |  | 围栏语言标注，空白一律落 plaintext。 |
| `lineNumbers` | `boolean` |  | 渲染行号槽。 |
| `onClampToggle` | `(details: CodeViewClampToggleDetails) => void` |  | 折叠态翻面的意图回调；clamped 是纯受控的，落不落由宿主决定。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `startLine` | `number` |  | 首行的行号，默认 1；摘录与 patch 片段要用。 |
| `translations` | `Partial<CodeViewTranslations>` |  |  |
| `wrap` | `boolean` |  | 长行自动换行，默认关（长行横向滚动）。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `clamp-toggle` | `CustomEvent` | 折叠态翻面的意图；detail 为 `{ clamped: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCodeViewCode` | `line` | `CodeViewLineSlotProps` |  |
| `XhCodeViewRoot` | `default` | `CodeViewRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `fold-trigger` | 'closed' \| 'open' |

## connect API

`useCodeView` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `lang` | `string` |  |
| `lineCount` | `number` |  |
| `lines` | `readonly CodeLine[]` | 逐行切好的文本与记号片段。 |
| `lineNumberAt` | `(index: number) => number` | 每行的行号，与 lines 同序。 |
| `lineNumbers` | `boolean` | 是否渲染行号槽；适配器据此决定要不要建那个节点。 |
| `foldable` | `boolean` | 折叠可用：给了正数 clamp 且行数确实超过它。 |
| `clamped` | `boolean` |  |
| `setClamped` | `(next: boolean) => void` | 发一次折叠意图；与当前态相同时不发。 |
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

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 代码块在 Tab 序列中 | &lt;pre&gt; 自身可聚焦，随后方向键的横向滚动交给浏览器，组件不接管 |
| `Enter` / `Space` | 焦点在折叠按钮上 | 翻面折叠态并发出意图；组件只接 click，按键走原生 button 的默认行为 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `lang-label` | `aria-hidden` | 'true' |
| `pre` | `role` | 'group' |
| `line-number` | `aria-hidden` | 'true' |
| `fold-trigger` | `aria-controls` | `pre` 部件的 id |
| `fold-trigger` | `aria-expanded` | 'false' \| 'true' |
| `fold-trigger` | `aria-label` | props.translations?.expand \| props.translations?.collapse |

- `pre` 可聚焦并带可访问名：渲了文件名就指向它，没渲就用 `translations.code` 兜底。
- 折叠按钮带 `aria-expanded` 与 `aria-controls`，指向 `pre`。
- 语言角标与行号槽都对读屏隐藏，它们是装饰不是内容。

## 样式

默认皮肤 `@xihan-ui/styles/code-view.css` 按部件选择：`[data-scope="code-view"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-code-view-bg` · `--xh-code-view-border` · `--xh-code-view-comment-fg` · `--xh-code-view-fg` · `--xh-code-view-filename-fg` · `--xh-code-view-fold-bg-hover` · `--xh-code-view-fold-fg` · `--xh-code-view-fold-py` · `--xh-code-view-font` · `--xh-code-view-font-size` · `--xh-code-view-gutter-border` · `--xh-code-view-gutter-gap` · `--xh-code-view-header-border` · `--xh-code-view-header-fg` · `--xh-code-view-header-font-size` · `--xh-code-view-header-gap` · `--xh-code-view-header-h` · `--xh-code-view-header-px` · `--xh-code-view-header-py` · `--xh-code-view-highlight-bar` · `--xh-code-view-highlight-bg` · `--xh-code-view-highlight-fg` · `--xh-code-view-keyword-fg` · `--xh-code-view-keyword-weight` · `--xh-code-view-label-fg` · `--xh-code-view-label-font-size` · `--xh-code-view-line-height` · `--xh-code-view-number-fg` · `--xh-code-view-number-font-size` · `--xh-code-view-number-token-fg` · `--xh-code-view-punctuation-fg` · `--xh-code-view-px` · `--xh-code-view-py` · `--xh-code-view-radius` · `--xh-code-view-shadow` · `--xh-code-view-string-fg`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[剪贴板](./clipboard)配合提供复制；要非受控的折叠就套[折叠面板](./collapsible)。
  把剪贴板三件放进 `header`，再用 `--xh-clipboard-trigger-border: transparent`、
  `--xh-clipboard-trigger-bg: transparent`、`--xh-clipboard-trigger-h: var(--xh-control-h-sm)`
  三个槽把按钮压成头部里的安静形态。
- 内建词法只分注释、字符串、数字、关键字、标点五档。要区分函数名、类型名、属性名这类精度，
  就自己实现 `highlighter` 端口（同步纯函数，接 Shiki 之类）传进来，皮肤按记号种类上色的那套照旧生效。
- 放进 AI 回复正文时由[流式正文](./markdown-stream)把代码块交过来。

## 最佳实践

- 标出语言：读者与着色器都需要它。
- 高亮行用来点出「看这里」，不要一次点亮半屏。
- 折叠阈值取十几行：再少读者每次都要展开，再多就失去了折叠的意义。

## 反模式

- 把代码放进普通段落里：空白与换行会被折叠掉。
- 用行号当锚点做跳转：它是画上去的，DOM 里选不中。
