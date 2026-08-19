# 代码块 <Badge type="info" text="code-block" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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
| `lineCount` | `number` |  |
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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-code-block-bg` · `--xh-code-block-comment-fg` · `--xh-code-block-font` · `--xh-code-block-keyword-fg` · `--xh-code-block-keyword-weight` · `--xh-code-block-label-fg` · `--xh-code-block-label-font-size` · `--xh-code-block-label-px` · `--xh-code-block-label-py` · `--xh-code-block-line-height` · `--xh-code-block-number-fg` · `--xh-code-block-p` · `--xh-code-block-punctuation-fg` · `--xh-code-block-radius` · `--xh-code-block-string-fg`
