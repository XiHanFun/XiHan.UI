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
| 皮肤 | `@xihan-ui/styled/code-block.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="code-block"`：**`root`** · `lang-label` · **`pre`** · **`code`** · `token`

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
