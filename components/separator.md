来源：https://ui.docs.xihanfun.com/components/separator

# Separator 分隔线 `alpha`

分隔相关内容或内容分组。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/separator" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/separator.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/separator" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/separator" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/separator.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

分隔内容区域

```vue
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="inline-size: min(480px, 100%)">
    <strong>账户设置</strong>
    <p style="color: var(--xh-fg-muted)">管理个人资料与登录方式。</p>
    <XhSeparator />
    <strong style="display: block; margin-block-start: 16px">通知设置</strong>
    <p style="margin-block-end: 0; color: var(--xh-fg-muted)">选择需要接收的消息。</p>
  </div>
</template>
```

```html
<div style="inline-size: min(480px, 100%)">
  <strong>账户设置</strong>
  <p style="color: var(--xh-fg-muted)">管理个人资料与登录方式。</p>
  <xh-separator style="display: contents"><div data-xh-part="root"></div></xh-separator>
  <strong style="display: block; margin-block-start: 16px">通知设置</strong>
  <p style="margin-block-end: 0; color: var(--xh-fg-muted)">选择需要接收的消息。</p>
</div>
```

## 组件结构

加粗的是必需部件。

`data-scope="separator"`：**`root`** · `line` · `content`

## 示例

### 垂直分隔线

分隔行内内容

```vue
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; block-size: 24px">
    <span>概览</span><XhSeparator orientation="vertical" decorative /><span>分析</span><XhSeparator orientation="vertical" decorative /><span>报告</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px; block-size: 24px">
  <span>概览</span>
  <xh-separator orientation="vertical" decorative><div data-xh-part="root"></div></xh-separator>
  <span>分析</span>
  <xh-separator orientation="vertical" decorative><div data-xh-part="root"></div></xh-separator>
  <span>报告</span>
</div>
```

### 分组标题

在分隔线中显示标题

```vue
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 20px; inline-size: min(480px, 100%)">
    <XhSeparator decorative>基本信息</XhSeparator>
    <XhSeparator decorative align="start">联系方式</XhSeparator>
    <XhSeparator decorative align="end">其他信息</XhSeparator>
  </div>
</template>
```

```html
<div style="display: grid; gap: 20px; inline-size: min(480px, 100%)">
  <xh-separator decorative style="display: contents"><div data-xh-part="root"><div data-xh-part="line"></div><span data-xh-part="content">基本信息</span><div data-xh-part="line"></div></div></xh-separator>
  <xh-separator decorative align="start" style="display: contents"><div data-xh-part="root"><div data-xh-part="line"></div><span data-xh-part="content">联系方式</span><div data-xh-part="line"></div></div></xh-separator>
  <xh-separator decorative align="end" style="display: contents"><div data-xh-part="root"><div data-xh-part="line"></div><span data-xh-part="content">其他信息</span><div data-xh-part="line"></div></div></xh-separator>
</div>
```

### 变体

设置分隔线强度和线型

```vue
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; grid-template-columns: 64px minmax(0, 1fr); align-items: center; gap: 16px; inline-size: min(480px, 100%)">
    <span>默认</span><XhSeparator decorative />
    <span>弱化</span><XhSeparator decorative variant="subtle" />
    <span>强调</span><XhSeparator decorative variant="strong" />
    <span>虚线</span><XhSeparator decorative dashed />
  </div>
</template>
```

```html
<div style="display: grid; grid-template-columns: 64px minmax(0, 1fr); align-items: center; gap: 16px; inline-size: min(480px, 100%)">
  <span>默认</span><xh-separator decorative style="display: contents"><div data-xh-part="root"></div></xh-separator>
  <span>弱化</span><xh-separator decorative variant="subtle" style="display: contents"><div data-xh-part="root"></div></xh-separator>
  <span>强调</span><xh-separator decorative variant="strong" style="display: contents"><div data-xh-part="root"></div></xh-separator>
  <span>虚线</span><xh-separator decorative dashed style="display: contents"><div data-xh-part="root"></div></xh-separator>
</div>
```

## 设计指引

### 何时使用

- 分隔菜单、列表、工具栏或表单区域。
- 在分隔线中显示分组标题。

### 何时不用

- 只需留白时使用间距。
- 每项都需要分隔时优先调整列表结构。

### 特性

- 支持水平和垂直方向。
- 支持默认、弱化、强调和虚线样式。
- 支持居中或靠边的分组标题。
- `decorative` 可将纯视觉分隔线移出无障碍树。

### 组合

- 可用于[菜单](./menu)、[工具栏](./toolbar)和[面包屑](./breadcrumb)。

### 最佳实践

- 纯视觉分隔线使用 `decorative`。
- 垂直分隔线的父容器应有明确高度。

### 反模式

- 不要用分隔线替代语义标题。
- 不要在同一区域堆叠过多分隔线。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-separator>` |
| Vue 组件 | `XhSeparator` `XhSeparatorContent` `XhSeparatorLine` `XhSeparatorRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/separator.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `SeparatorAlign` |  | 分节文字的位置，默认居中；默认档不输出 data-align。 |
| `dashed` | `boolean` |  | 绘制为虚线；实线段与空白段的长度使用 --xh-separator-dash-length / -dash-gap 两个槽。 |
| `decorative` | `boolean` |  | 装饰性分隔：仅视觉分组，root 通过 role=none + aria-hidden 完整退出无障碍树。 |
| `orientation` | `'horizontal' \| 'vertical'` |  |  |
| `variant` | `SeparatorVariant` |  | 线的绘制方式，默认 default；默认档不输出 data-variant。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getLineProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/separator/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-hidden` | 'true' \| undefined |
| `root` | `aria-orientation` | 'vertical' \| undefined |
| `root` | `role` | 'none' \| 'separator' |
| `line` | `role` | 'none' |

## 样式参考

### 皮肤

`@xihan-ui/styles/separator.css` 使用 `[data-scope="separator"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-dashed` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-variant` | props.variant |
| `line` | `data-orientation` | props.orientation |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-separator-align-length` | `line`<br>`root` | `flex` | `align=end`<br>`align=start`<br>`first-child`<br>`last-child` | `--xh-space-6` | separator 的 line、root 部件 flex 覆盖槽。 |
| `--xh-separator-color` | `line`<br>`root` | `background` | `dashed`<br>`default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`variant=strong`<br>`variant=subtle` | `--xh-border-strong`<br>`--xh-material-frosted-separator`<br>`--xh-material-soft-separator` | separator 的 line、root 部件 background 覆盖槽。 |
| `--xh-separator-content-fg` | `content` | `color` | `default` | `--xh-fg-muted` | separator 的 content 部件 color 覆盖槽。 |
| `--xh-separator-content-font-size` | `content` | `font-size` | `default` | `--xh-text-secondary-size` | separator 的 content 部件 font-size 覆盖槽。 |
| `--xh-separator-dash-gap` | `line`<br>`root` | `background` | `dashed`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1_5` | separator 的 line、root 部件 background 覆盖槽。 |
| `--xh-separator-dash-length` | `line`<br>`root` | `background` | `dashed`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1_5` | separator 的 line、root 部件 background 覆盖槽。 |
| `--xh-separator-gap` | `content`<br>`root` | `gap` | `has([data-part='content'])` | `--xh-space-3` | separator 的 content、root 部件 gap 覆盖槽。 |
| `--xh-separator-radius` | `line`<br>`root` | `border-radius` | `default` | `--xh-shape-pill` | separator 的 line、root 部件 border-radius 覆盖槽。 |
| `--xh-separator-thickness` | `line`<br>`root` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thin` | separator 的 line、root 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
