# 代码块 <Badge type="info" text="code-block" />

一段带语法着色的代码，支持流式追加时的未闭合状态。

## 何时使用

- 文档、AI 回复、日志详情里展示代码。
- 代码是流式生成的，需要边来边着色。

## 何时不用

- 只是一小段行内标识：用[排印](./typography)的 `code` 形态。
- 展示的是运行日志：用[日志](./log)。

## 特性

- `complete` 标出这段代码是否已经写完；未闭合时着色器不会因为语法不完整而崩掉。
- `highlighter` 是一个着色端口，接哪个着色器由宿主决定。
- `wrap` 决定长行折行还是横滚；行号栏由作者自己加。

## 示例

### 基础用法

代码原文由宿主给，组件负责数行数、预撑高度并铺记号；语言角标带 aria-hidden，是纯装饰

<XhDemo src="code-block/01-basic" />

### 流式未闭合

complete 为 false 时默认不着色：半截代码的词法本来就不稳，每来一个记号整块变一次色比不着色更难看

<XhDemo src="code-block/02-streaming" />

### 着色端口

着色是可换的端口：认不出的语言退回纯文本，接自己的实现组件侧一行不用改，传 null 则整个关掉

<XhDemo src="code-block/03-highlighter" />

### 行号栏

行号是作者摆在代码块旁边的一栏，对齐靠行高与内边距这几个公开变量，行数由原文自己数

<XhDemo src="code-block/04-line-numbers" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-code-block>` |
| Vue 组件 | `XhCodeBlock` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/code-block.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="code-block"`：**`root`** · `lang-label` · **`pre`** · **`code`** · `token`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | `string` | 是 |  |
| `complete` | `boolean` |  | 代码块是否已闭合，未闭合时按行数预撑高度。 |
| `highlighter` | `HighlighterPort` |  | 着色实现。不给就是纯文本，给了也允许它返回 null（语言不认识之类），同样退回纯文本。 未闭合的块默认不着色，见 {@link highlightWhileStreaming}。 |
| `highlightWhileStreaming` | `boolean` |  | 块还没闭合时也着色，默认 false。 默认关是因为半截代码的词法本来就不稳——引号、括号随时会配上， 每来一个 token 整块变一次色，看着比不着色更糟。 |
| `lang` | `string` |  | 围栏语言标注，为空时按 plaintext 处理。 |
| `wrap` | `boolean` |  | 长行自动换行，默认关（长行横向滚动）。开启后缩进照旧保留，只是行尾会折下来， 窄栏与移动端读长行时不必左右拖。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `lang` | `string` |  |
| `lineCount` | `number` | 行数。行号栏由作者自己渲染——组件不给这个部件是有意的： 行号要与代码并排就得由 root 拿走 flex/grid 排布权，而 root 刻意不设 display， 排布归作者。拿这个数配一列 span 即可，行高与代码块共用同一个令牌。 |
| `tokens` | `readonly CodeToken[]` | 着色结果。空数组表示这一次不着色，作者按 `code` 原样渲染纯文本即可。 非空时逐个记号渲成元素，`getTokenProps` 给出该带的属性。 |
| `getRootProps` | `() => T['element']` |  |
| `getLangLabelProps` | `() => T['element']` |  |
| `getPreProps` | `() => T['element']` |  |
| `getCodeProps` | `() => T['element']` |  |
| `getTokenProps` | `(token: CodeToken) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 代码块在 Tab 序列中 | &lt;pre&gt; 自身可聚焦，随后方向键的横向滚动交给浏览器，组件不接管 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `lang-label` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/code-block.css` 按部件选择：`[data-scope="code-block"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-complete` | ''（条件成立时才出现） |
| `root` | `data-lang` | props.lang?.trim() \|\| CODE_BLOCK_FALLBACK_LANG |
| `pre` | `data-complete` | ''（条件成立时才出现） |
| `pre` | `data-wrap` | ''（条件成立时才出现） |
| `code` | `data-lang` | props.lang?.trim() \|\| CODE_BLOCK_FALLBACK_LANG |
| `code` | `data-wrap` | ''（条件成立时才出现） |
| `token` | `data-kind` | token.kind |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-code-block-bg` · `--xh-code-block-comment-fg` · `--xh-code-block-font` · `--xh-code-block-keyword-fg` · `--xh-code-block-keyword-weight` · `--xh-code-block-label-fg` · `--xh-code-block-label-font-size` · `--xh-code-block-label-px` · `--xh-code-block-label-py` · `--xh-code-block-line-height` · `--xh-code-block-number-fg` · `--xh-code-block-p` · `--xh-code-block-punctuation-fg` · `--xh-code-block-radius` · `--xh-code-block-string-fg`

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[剪贴板](./clipboard)配合提供复制；放进 AI 的[会话线程](./thread)。

## 最佳实践

- 标出语言：读者与着色器都需要它。
- 长代码给固定高度加内部滚动，别让一段代码占满整屏。

## 反模式

- 把代码放进普通段落里：空白与换行会被折叠掉。
- 复制按钮复制的是带行号的文本。
