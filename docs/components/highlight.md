# 文本高亮 <Badge type="info" text="highlight" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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
| 皮肤 | `@xihan-ui/styled/highlight.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="highlight"`：**`root`** · `mark`

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
