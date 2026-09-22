来源：https://ui.docs.xihanfun.com/components/highlight

# Highlight 文本高亮

标出一段文本中命中关键词的片段。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/highlight" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/highlight.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/highlight" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/highlight" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/highlight.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

命中关键词的片段渲染为 `&lt;mark>`，其余是纯文本；整段文本可原样拼接还原

```vue
<script setup lang="ts">
import { XhHighlight } from "@xihan-ui/vue";

const text = "曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。";
</script>

<template>
  <XhHighlight :text="text" keyword="组件" />
</template>
```

```html
<!-- root 写成空容器：片段由元素按 text 与 keyword 算出来后铺进去 -->
<xh-highlight
  text="曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。"
  keyword="组件"
>
  <span data-xh-part="root"></span>
</xh-highlight>
```

## 组件结构

加粗的是必需部件。

`data-scope="highlight"`：**`root`** · `mark`

## 示例

### 一组关键词

传入数组即可；同一位置多个关键词都命中时取最长的一个，重叠只切出一段

```vue
<script setup lang="ts">
import { XhHighlight } from "@xihan-ui/vue";

const text = "曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。";
const keywords = ["曦寒", "设计系统", "行为"];

// 「设计」与「设计系统」在同一处起跳，切出来的是长的那个
const overlapping = ["设计", "设计系统"];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhHighlight :text="text" :keyword="keywords" />
    <XhHighlight :text="text" :keyword="overlapping" />
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-highlight
    id="highlight-keywords-many"
    text="曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。"
  >
    <span data-xh-part="root"></span>
  </xh-highlight>

  <xh-highlight
    id="highlight-keywords-overlapping"
    text="曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。"
  >
    <span data-xh-part="root"></span>
  </xh-highlight>
</div>

<script type="module">
  // 一组关键词走 property：属性里的一个串整体算一个关键词，带空格的关键词才写得出来
  const many = document.getElementById("highlight-keywords-many");
  const overlapping = document.getElementById("highlight-keywords-overlapping");

  many.keyword = ["曦寒", "设计系统", "行为"];
  // 「设计」与「设计系统」在同一处起跳，切出来的是长的那个
  overlapping.keyword = ["设计", "设计系统"];
</script>
```

### 区分大小写

默认不区分，开启 case-sensitive 后按写法比较

```vue
<script setup lang="ts">
import { XhHighlight } from "@xihan-ui/vue";

const text = "XiHan UI 与 xihan ui 是同一个名字的两种写法。";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhHighlight :text="text" keyword="ui" />
    <XhHighlight :text="text" keyword="ui" case-sensitive />
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-highlight text="XiHan UI 与 xihan ui 是同一个名字的两种写法。" keyword="ui">
    <span data-xh-part="root"></span>
  </xh-highlight>

  <xh-highlight
    text="XiHan UI 与 xihan ui 是同一个名字的两种写法。"
    keyword="ui"
    case-sensitive
  >
    <span data-xh-part="root"></span>
  </xh-highlight>
</div>
```

### 跟随输入高亮

关键词逐字符比对、不拼入正则，输入 . * ( 等字符也只作为普通字符查找

```vue
<script setup lang="ts">
import { XhHighlight } from "@xihan-ui/vue";
import { ref } from "vue";

const keyword = ref("1.0");

const rows = [
  "曦寒 UI 1.0 发布说明",
  "版本 120 的兼容性清单",
  "取值写作 a*b 时的转义规则",
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <input v-model="keyword" placeholder="输入关键词" style="max-inline-size: 240px">
    <XhHighlight v-for="row in rows" :key="row" :text="row" :keyword="keyword" />
  </div>
</template>
```

```html
<div id="highlight-search" style="display: flex; flex-direction: column; gap: 12px">
  <input
    id="highlight-search-input"
    value="1.0"
    placeholder="输入关键词"
    style="max-inline-size: 240px"
  />

  <xh-highlight text="曦寒 UI 1.0 发布说明" keyword="1.0">
    <span data-xh-part="root"></span>
  </xh-highlight>
  <xh-highlight text="版本 120 的兼容性清单" keyword="1.0">
    <span data-xh-part="root"></span>
  </xh-highlight>
  <xh-highlight text="取值写作 a*b 时的转义规则" keyword="1.0">
    <span data-xh-part="root"></span>
  </xh-highlight>
</div>

<script type="module">
  // 输入框里的原串直接交给三行，敲进去什么就找什么
  const box = document.getElementById("highlight-search");
  const input = document.getElementById("highlight-search-input");
  const rows = box.querySelectorAll("xh-highlight");

  input.addEventListener("input", () => {
    for (const row of rows) row.keyword = input.value;
  });
</script>
```

### 颜色

tone 决定命中片段使用哪族颜色，未命中的文本不受影响

```vue
<script setup lang="ts">
import { XhHighlight } from "@xihan-ui/vue";

const text = "曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。";
const tones = ["brand", "neutral", "success", "warning", "danger", "info"];
</script>

<template>
  <p v-for="tone in tones" :key="tone" style="margin: 0 0 6px">
    <XhHighlight :text="text" keyword="组件" :tone="tone" />
  </p>
</template>
```

```html
<p style="margin: 0 0 6px">
  <xh-highlight
    text="曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。"
    keyword="组件"
    tone="brand"
  >
    <span data-xh-part="root"></span>
  </xh-highlight>
</p>
<p style="margin: 0 0 6px">
  <xh-highlight
    text="曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。"
    keyword="组件"
    tone="neutral"
  >
    <span data-xh-part="root"></span>
  </xh-highlight>
</p>
<p style="margin: 0 0 6px">
  <xh-highlight
    text="曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。"
    keyword="组件"
    tone="success"
  >
    <span data-xh-part="root"></span>
  </xh-highlight>
</p>
<p style="margin: 0 0 6px">
  <xh-highlight
    text="曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。"
    keyword="组件"
    tone="warning"
  >
    <span data-xh-part="root"></span>
  </xh-highlight>
</p>
<p style="margin: 0 0 6px">
  <xh-highlight
    text="曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。"
    keyword="组件"
    tone="danger"
  >
    <span data-xh-part="root"></span>
  </xh-highlight>
</p>
<p style="margin: 0 0 6px">
  <xh-highlight
    text="曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。"
    keyword="组件"
    tone="info"
  >
    <span data-xh-part="root"></span>
  </xh-highlight>
</p>
```

## 设计指引

### 何时使用

- 在搜索结果、候选列表中标出命中原因。

### 何时不用

- 需要富文本或代码着色时，使用[代码视图](./code-view)。
- 强调一段固定内容时，使用[排印](./typography)的 `strong`。

### 特性

- `text` 接受单个词或一组词。
- `caseSensitive` 决定是否区分大小写。
- 命中片段落在 `mark` 部件上，样式归皮肤。
- `tone` 决定命中片段的颜色族，落在 `root` 上：一段内有多个命中，语气是整段的属性。

### 组合

- 放入[组合框](./combobox)的候选、[表格](./table)的单元格、[列表](./list)的条目标题。

### 最佳实践

- 高亮只用底色，不同时改字色与字重，避免一句话中出现过多重音。
- 关键词很短（一两个字符）时考虑不高亮，命中会过于分散。

### 反模式

- 用它做正文重点标注：那属于内容，不是检索反馈。

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
| `caseSensitive` | `boolean` |  | 区分大小写，默认不区分。 |
| `keyword` | `string \| readonly string[]` |  | 关键词，一个或一组。空串会被丢弃。 |
| `text` | `string` |  | 要显示的整段文本。命中位置按该串逐字符计算。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定命中片段使用哪族颜色。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` | 解析后的文本；未提供时为空串。 |
| `segments` | `readonly HighlightSegment[]` | 切分后的片段，依次拼接恒等于 text。 |
| `getRootProps` | `() => T['element']` |  |
| `getMarkProps` | `() => T['element']` | 铺到每个命中片段上的属性；每段相同，命中的是哪个关键词不写入 DOM。 |

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

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
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
