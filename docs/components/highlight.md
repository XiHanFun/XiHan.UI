# Highlight <Badge type="info" text="文本高亮" />

把一段文本里命中关键词的片段标出来。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/highlight" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/highlight.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/highlight" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/highlight" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/highlight.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

命中关键词的片段渲染成 `&lt;mark>`，其余是纯文本；整段文本原样拼得回来

<XhDemo src="highlight/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="highlight"`：**`root`** · `mark`

## 示例

### 一组关键词

传数组即可；同一处多个关键词都命中时取最长的那个，重叠只切出一段

<XhDemo src="highlight/02-keywords" />

### 区分大小写

缺省不区分，开了 case-sensitive 就按写法比

<XhDemo src="highlight/03-case-sensitive" />

### 跟着输入高亮

关键词逐字符比对、不拼进正则，敲进 . * ( 这些字符也只当普通字符找

<XhDemo src="highlight/04-search" />

### 语气

tone 决定命中片段用哪族颜色，没命中的文本不受影响

<XhDemo src="highlight/05-tone" />

## 设计指引

### 何时使用

- 搜索结果、候选列表里标出为什么这一条被选出来。

### 何时不用

- 需要富文本或代码着色：用[代码视图](./code-view)。
- 想强调一段固定的话：直接写[排印](./typography)的 `strong`。

### 特性

- `text` 收单个词或一组词。
- `caseSensitive` 决定是否区分大小写。
- 命中片段落在 `mark` 部件上，样式归皮肤。
- `tone` 换命中片段用哪族颜色，落在 `root` 上——一段里有好几个命中，语气是整段的属性。

### 组合

- 放进[组合框](./combobox)的候选、[表格](./table)的单元格、[列表](./list)的条目标题。

### 最佳实践

- 高亮只用底色，别同时改字色与字重——一句话里到处是重音就读不下去了。
- 关键词很短（一两个字符）时考虑不高亮，命中会散得到处都是。

### 反模式

- 用它做正文重点标注：那是内容的事，不是检索反馈。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-highlight>` |
| Vue 组件 | `XhHighlight` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/highlight.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `caseSensitive` | `boolean` |  | 区分大小写，缺省不区分。 |
| `keyword` | `string \| readonly string[]` |  | 关键词，一个或一组。空串会被丢掉。 |
| `text` | `string` |  | 要显示的整段文本。命中位置按这个串逐字符算出来。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定命中片段用哪族颜色。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` | 解析后的文本；没给时是空串。 |
| `segments` | `readonly HighlightSegment[]` | 切好的片段，依次拼回去恒等于 text。 |
| `getRootProps` | `() => T['element']` |  |
| `getMarkProps` | `() => T['element']` | 铺到每个命中片段上的属性；每段都一样，命中的是哪个关键词不落到 DOM 上。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/highlight.css` 使用 `[data-scope="highlight"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-case-sensitive` | ''（条件成立时才出现） |
| `root` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-highlight-mark-bg` | `mark`<br>`root` | `background` | `default`<br>`tone` | `--xh-_tone-subtle`<br>`--xh-bg-brand-subtle` | highlight 的 mark、root 部件 background 覆盖槽。 |
| `--xh-highlight-mark-fg` | `mark`<br>`root` | `color` | `default`<br>`tone` | `--xh-_tone-fg`<br>`--xh-fg-brand-strong` | highlight 的 mark、root 部件 color 覆盖槽。 |
| `--xh-highlight-mark-font-weight` | `mark` | `font-weight` | `default` | `--xh-font-weight-medium` | highlight 的 mark 部件 font-weight 覆盖槽。 |
| `--xh-highlight-mark-px` | `mark` | `padding-inline` | `default` | `--xh-space-0_5` | highlight 的 mark 部件 padding-inline 覆盖槽。 |
| `--xh-highlight-mark-radius` | `mark` | `border-radius` | `default` | `--xh-shape-inset` | highlight 的 mark 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
