# 文本高亮 <Badge type="info" text="highlight" />

把一段文本里命中关键词的片段标出来。

## 何时使用

- 搜索结果、候选列表里标出为什么这一条被选出来。

## 何时不用

- 需要富文本或代码着色：用[代码块](./code-block)。
- 想强调一段固定的话：直接写[排印](./typography)的 `strong`。

## 特性

- `text` 收单个词或一组词。
- `caseSensitive` 决定是否区分大小写。
- 命中片段落在 `mark` 部件上，样式归皮肤。

## 示例

### 基础用法

命中关键词的片段渲染成 `&lt;mark>`，其余是纯文本；整段文本原样拼得回来

<XhDemo src="highlight/01-basic" />

### 一组关键词

传数组即可；同一处多个关键词都命中时取最长的那个，重叠只切出一段

<XhDemo src="highlight/02-keywords" />

### 区分大小写

缺省不区分，开了 case-sensitive 就按写法比

<XhDemo src="highlight/03-case-sensitive" />

### 跟着输入高亮

关键词逐字符比对、不拼进正则，敲进 . * ( 这些字符也只当普通字符找

<XhDemo src="highlight/04-search" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-highlight>` |
| Vue 组件 | `XhHighlight` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/highlight.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="highlight"`：**`root`** · `mark`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `caseSensitive` | `boolean` |  | 区分大小写，缺省不区分。 |
| `keyword` | `string \| readonly string[]` |  | 关键词，一个或一组。空串会被丢掉。 |
| `text` | `string` |  | 要显示的整段文本。命中位置按这个串逐字符算出来。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` | 解析后的文本；没给时是空串。 |
| `segments` | `readonly HighlightSegment[]` | 切好的片段，依次拼回去恒等于 text。 |
| `getRootProps` | `() => T['element']` |  |
| `getMarkProps` | `() => T['element']` | 铺到每个命中片段上的属性；每段都一样，命中的是哪个关键词不落到 DOM 上。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/highlight.css` 按部件选择：`[data-scope="highlight"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-case-sensitive` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-highlight-bg` · `--xh-highlight-fg` · `--xh-highlight-mark-px` · `--xh-highlight-radius`

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 放进[组合框](./combobox)的候选、[表格](./table)的单元格、[列表](./list)的条目标题。

## 最佳实践

- 高亮只用底色，别同时改字色与字重——一句话里到处是重音就读不下去了。
- 关键词很短（一两个字符）时考虑不高亮，命中会散得到处都是。

## 反模式

- 用它做正文重点标注：那是内容的事，不是检索反馈。
