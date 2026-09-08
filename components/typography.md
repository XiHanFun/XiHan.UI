来源：https://ui.docs.xihanfun.com/components/typography

# 排印 `typography`

一块正文的排版容器：管住段间距与最大行宽，标题、段落与行内文字各自拿自己的字号、字重与行高。

## 何时使用

- 渲染一段较长的正文：文章、说明、条款、AI 回复。
- 需要标题层级与段落节奏一致，而不想逐处写字号。

## 何时不用

- 只是一行标签或一句提示：直接写文本，别套整套排版。
- 要把长文本裁成几行：用[文本截断](./truncate)。
- 要渲染 Markdown：用 `@xihan-ui/markdown`，它产出的节点套一层 `prose` 部件即得排版。

## 特性

- `root` 管段间距与最大行宽；`level` 只换标题字号档位，用哪个标签由作者定。
- 行内文字三种形态：`muted` 弱化、`strong` 加重、`code` 等宽；与语气、字重是三条轴，可以一起写。
- `link` 是一个独立部件，链接样式不必另写。
- `prose` 收外来的整段 HTML：节点由内容自己带，标题、段落、列表、代码块、引用、表格按标签上样式。
- `align` 与 `weight` 落在 `root` 上，整块正文一起换；`weight` 也能只写在一段行内文字上。

## 示例

### 基础用法

root 管段间距与最大行宽，标题与段落各自拿字号、字重、行高

```vue
<script setup lang="ts">
import { XhTypographyHeading, XhTypographyParagraph, XhTypographyRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhTypographyRoot>
    <!-- as 决定渲染成哪个标签，要进文档大纲就自己写上去 -->
    <XhTypographyHeading as="h3" :level="3">版式约定</XhTypographyHeading>
    <XhTypographyParagraph>
      字号、字重与行高都收进令牌，不再逐处手写。段与段之间的间距由 root 统一给。
    </XhTypographyParagraph>
    <XhTypographyParagraph>
      最大行宽也由 root 管，整块正文不会拉成一行行难读的长句。
    </XhTypographyParagraph>
  </XhTypographyRoot>
</template>
```

```html
<xh-typography>
  <div data-xh-part="root">
    <!-- 标签由作者写，要进文档大纲就写 h1-h6 -->
    <h3 data-xh-part="heading" level="3">版式约定</h3>
    <p data-xh-part="paragraph">
      字号、字重与行高都收进令牌，不再逐处手写。段与段之间的间距由 root 统一给。
    </p>
    <p data-xh-part="paragraph">
      最大行宽也由 root 管，整块正文不会拉成一行行难读的长句。
    </p>
  </div>
</xh-typography>
```

### 标题档位

level 只换字号档位，用哪个标签由作者定；不传 level 即默认档

```vue
<script setup lang="ts">
import { XhTypographyHeading, XhTypographyRoot } from "@xihan-ui/vue";

// as const 让每一项是字面量类型，才对得上 level 收的 1-6 联合
const levels = [1, 2, 3, 4, 5, 6] as const;
</script>

<template>
  <XhTypographyRoot>
    <XhTypographyHeading v-for="l in levels" :key="l" :level="l">
      第 {{ l }} 档标题
    </XhTypographyHeading>
  </XhTypographyRoot>
</template>
```

```html
<xh-typography>
  <div data-xh-part="root">
    <p data-xh-part="heading" level="1">第 1 档标题</p>
    <p data-xh-part="heading" level="2">第 2 档标题</p>
    <p data-xh-part="heading" level="3">第 3 档标题</p>
    <p data-xh-part="heading" level="4">第 4 档标题</p>
    <p data-xh-part="heading" level="5">第 5 档标题</p>
    <p data-xh-part="heading" level="6">第 6 档标题</p>
  </div>
</xh-typography>
```

### 行内文字

variant 换形态：muted 弱化、strong 加重、code 等宽

```vue
<script setup lang="ts">
import {
  XhTypographyLink,
  XhTypographyParagraph,
  XhTypographyRoot,
  XhTypographyText,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTypographyRoot>
    <XhTypographyParagraph>
      不写 variant 就是一段普通正文，<XhTypographyText variant="muted">这一段弱化</XhTypographyText>，
      <XhTypographyText variant="strong">这一段加重</XhTypographyText>，
      档位写在 <XhTypographyText as="code" variant="code">data-level</XhTypographyText> 上。
    </XhTypographyParagraph>
    <XhTypographyParagraph>
      链接自带下划线，<XhTypographyLink href="#">不只靠颜色区分</XhTypographyLink>。
    </XhTypographyParagraph>
  </XhTypographyRoot>
</template>
```

```html
<xh-typography>
  <div data-xh-part="root">
    <p data-xh-part="paragraph">
      不写 variant 就是一段普通正文，<span data-xh-part="text" variant="muted">这一段弱化</span>，
      <span data-xh-part="text" variant="strong">这一段加重</span>，
      档位写在 <code data-xh-part="text" variant="code">data-level</code> 上。
    </p>
    <p data-xh-part="paragraph">
      链接自带下划线，<a data-xh-part="link" href="#">不只靠颜色区分</a>。
    </p>
  </div>
</xh-typography>
```

### 语气

tone 决定这一段行内文字用哪族颜色，与 variant 是两个轴，可以一起写

```vue
<script setup lang="ts">
import { XhTypographyParagraph, XhTypographyRoot, XhTypographyText } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"];
</script>

<template>
  <XhTypographyRoot>
    <XhTypographyParagraph v-for="t in tones" :key="t">
      <XhTypographyText :tone="t">{{ t }} 语气的一段文字</XhTypographyText>
    </XhTypographyParagraph>
    <XhTypographyParagraph>
      <XhTypographyText tone="danger" variant="strong">此操作不可撤销</XhTypographyText>
    </XhTypographyParagraph>
  </XhTypographyRoot>
</template>
```

```html
<xh-typography>
  <div data-xh-part="root">
    <p data-xh-part="paragraph">
      <span data-xh-part="text" tone="brand">brand 语气的一段文字</span>
    </p>
    <p data-xh-part="paragraph">
      <span data-xh-part="text" tone="neutral">neutral 语气的一段文字</span>
    </p>
    <p data-xh-part="paragraph">
      <span data-xh-part="text" tone="success">success 语气的一段文字</span>
    </p>
    <p data-xh-part="paragraph">
      <span data-xh-part="text" tone="warning">warning 语气的一段文字</span>
    </p>
    <p data-xh-part="paragraph">
      <span data-xh-part="text" tone="danger">danger 语气的一段文字</span>
    </p>
    <p data-xh-part="paragraph">
      <span data-xh-part="text" tone="info">info 语气的一段文字</span>
    </p>
    <p data-xh-part="paragraph">
      <span data-xh-part="text" tone="danger" variant="strong">此操作不可撤销</span>
    </p>
  </div>
</xh-typography>
```

### 尺寸

size 换的是整块正文的字号与段间距，不传 size 即默认档

```vue
<script setup lang="ts">
import { XhTypographyHeading, XhTypographyParagraph, XhTypographyRoot } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <XhTypographyRoot v-for="s in sizes" :key="s.label" :size="s.size">
      <XhTypographyHeading :level="4">{{ s.label }}档</XhTypographyHeading>
      <XhTypographyParagraph>正文字号与段间距跟着档位走，标题档位另由 level 决定。</XhTypographyParagraph>
    </XhTypographyRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 24px">
  <xh-typography size="sm">
    <div data-xh-part="root">
      <p data-xh-part="heading" level="4">小档</p>
      <p data-xh-part="paragraph">正文字号与段间距跟着档位走，标题档位另由 level 决定。</p>
    </div>
  </xh-typography>

  <!-- 中间一档不写 size -->
  <xh-typography>
    <div data-xh-part="root">
      <p data-xh-part="heading" level="4">默认档</p>
      <p data-xh-part="paragraph">正文字号与段间距跟着档位走，标题档位另由 level 决定。</p>
    </div>
  </xh-typography>

  <xh-typography size="lg">
    <div data-xh-part="root">
      <p data-xh-part="heading" level="4">大档</p>
      <p data-xh-part="paragraph">正文字号与段间距跟着档位走，标题档位另由 level 决定。</p>
    </div>
  </xh-typography>
</div>
```

### 富文本

prose 收外来的整段 HTML：节点由内容自己带，样式按标签给

```vue
<script setup lang="ts">
import { XhTypographyProse, XhTypographyRoot } from "@xihan-ui/vue";

// Markdown 渲染器产出的那一串 HTML，这里直接写死当样例
const html = `
  <h3>安装</h3>
  <p>包管理器装上 <code>@xihan-ui/vue</code>，再把皮肤引进来。</p>
  <pre><code>pnpm add @xihan-ui/vue @xihan-ui/styles</code></pre>
  <ul><li>组件按需引入</li><li>皮肤整份引入</li></ul>
  <blockquote>皮肤只引一次，重复引入会让层序失效。</blockquote>
`;
</script>

<template>
  <XhTypographyRoot>
    <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -- 这个部件本来就是拿来放一段外来 HTML 的，它不收插槽内容 -->
    <XhTypographyProse v-html="html" />
  </XhTypographyRoot>
</template>
```

```html
<xh-typography>
  <div data-xh-part="root">
    <div data-xh-part="prose">
      <h3>安装</h3>
      <p>包管理器装上 <code>@xihan-ui/web-components</code>，再把皮肤引进来。</p>
      <pre><code>pnpm add @xihan-ui/web-components @xihan-ui/styles</code></pre>
      <ul>
        <li>元素按需注册</li>
        <li>皮肤整份引入</li>
      </ul>
      <blockquote>皮肤只引一次，重复引入会让层序失效。</blockquote>
    </div>
  </div>
</xh-typography>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-typography>` |
| Vue 组件 | `XhTypographyHeading` `XhTypographyLink` `XhTypographyParagraph` `XhTypographyProse` `XhTypographyRoot` `XhTypographyText` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/typography.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="typography"`：**`root`** · `heading` · `paragraph` · `text` · `link` · `prose`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `TypographyAlign` |  | 对齐：start / center / end / justify，整块正文跟着换。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，整块正文的字号与段间距跟着换档。 |
| `weight` | `TypographyWeight` |  | 字重：regular / medium / semibold / bold，整块正文跟着换。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getHeadingProps` | `(props?: TypographyHeadingProps) => T['element']` |  |
| `getParagraphProps` | `() => T['element']` |  |
| `getTextProps` | `(props?: TypographyTextProps) => T['element']` |  |
| `getLinkProps` | `() => T['element']` |  |
| `getProseProps` | `() => T['element']` | 富文本容器：外来的 HTML（Markdown 渲染结果）铺进来，样式按标签给。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/typography.css` 按部件选择：`[data-scope="typography"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-size` | props.size |
| `root` | `data-weight` | props.weight |
| `heading` | `data-level` | levelAttr(heading.level) |
| `text` | `data-tone` | text.tone |
| `text` | `data-variant` | text.variant |
| `text` | `data-weight` | text.weight |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-typography-block-gap` · `--xh-typography-code-bg` · `--xh-typography-code-font` · `--xh-typography-code-font-size` · `--xh-typography-code-px` · `--xh-typography-code-py` · `--xh-typography-code-radius` · `--xh-typography-fg` · `--xh-typography-font-size` · `--xh-typography-font-weight` · `--xh-typography-heading-fg` · `--xh-typography-heading-font-size` · `--xh-typography-heading-font-weight` · `--xh-typography-heading-gap` · `--xh-typography-heading-leading` · `--xh-typography-leading` · `--xh-typography-link-fg` · `--xh-typography-link-fg-hover` · `--xh-typography-link-radius` · `--xh-typography-link-underline-offset` · `--xh-typography-measure` · `--xh-typography-prose-block-gap` · `--xh-typography-prose-cell-border` · `--xh-typography-prose-cell-px` · `--xh-typography-prose-cell-py` · `--xh-typography-prose-fg` · `--xh-typography-prose-font-size` · `--xh-typography-prose-h1` · `--xh-typography-prose-h2` · `--xh-typography-prose-h3` · `--xh-typography-prose-h4` · `--xh-typography-prose-h5` · `--xh-typography-prose-h6` · `--xh-typography-prose-heading-fg` · `--xh-typography-prose-heading-font-weight` · `--xh-typography-prose-heading-gap` · `--xh-typography-prose-item-gap` · `--xh-typography-prose-leading` · `--xh-typography-prose-link-fg` · `--xh-typography-prose-link-radius` · `--xh-typography-prose-list-ps` · `--xh-typography-prose-pre-bg` · `--xh-typography-prose-pre-padding` · `--xh-typography-prose-pre-radius` · `--xh-typography-prose-quote-border` · `--xh-typography-prose-quote-fg` · `--xh-typography-prose-quote-ps` · `--xh-typography-prose-rule-border` · `--xh-typography-prose-strong-font-weight` · `--xh-typography-prose-th-font-weight` · `--xh-typography-text-fg-muted` · `--xh-typography-text-fg-tone` · `--xh-typography-text-font-weight`

## 动效

`color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`hover: hover`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[文本高亮](./highlight)配合做检索命中标记；与[代码视图](./code-view)配合放整段代码。

## 最佳实践

- 最大行宽交给 `root`，别让正文横贯整个宽屏——一行超过约四十个汉字就很难回到下一行的行首。
- 标题层级按文档结构选标签，视觉大小用 `level` 单独调，两件事分开。

## 反模式

- 为了字大就用 `<h1>`：读屏用户按标题跳转时会撞见错的结构。
- 在正文块里塞交互控件却不留间距，点击目标会挤在一起。
