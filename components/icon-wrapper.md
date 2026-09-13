来源：https://ui.docs.xihanfun.com/components/icon-wrapper

# IconWrapper 图标块

为图标提供统一的背景容器。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/icon-wrapper" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/icon-wrapper.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/icon-wrapper" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/icon-wrapper" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/icon-wrapper.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

显示带背景的图标

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { BellIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";
</script>

<template>
  <XhIconWrapper>
    <XhIcon :icon="BellIcon" />
  </XhIconWrapper>
</template>
```

```html
<xh-icon-wrapper>
  <span data-xh-part="root">
    <xh-icon>
      <svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M18 9a6 6 0 0 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z" />
        <path d="M13.7 19a2 2 0 0 1-3.4 0" />
      </svg>
    </xh-icon>
  </span>
</xh-icon-wrapper>
```

## 组件结构

加粗的是必需部件。

`data-scope="icon-wrapper"`：**`root`**

## 示例

### 变体

设置背景和边框样式

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIconWrapper v-for="variant in variants" :key="variant" :variant="variant">
      <XhIcon :icon="CheckIcon" />
    </XhIconWrapper>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px">
  <xh-icon-wrapper variant="solid"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12.5L9.5 18L20 6" /></svg></xh-icon></span></xh-icon-wrapper>
  <xh-icon-wrapper variant="subtle"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12.5L9.5 18L20 6" /></svg></xh-icon></span></xh-icon-wrapper>
  <xh-icon-wrapper variant="outline"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12.5L9.5 18L20 6" /></svg></xh-icon></span></xh-icon-wrapper>
  <xh-icon-wrapper variant="ghost"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12.5L9.5 18L20 6" /></svg></xh-icon></span></xh-icon-wrapper>
</div>
```

### 颜色

使用语义颜色

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const tones = ["brand", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIconWrapper v-for="tone in tones" :key="tone" variant="subtle" :tone="tone">
      <XhIcon :icon="StarIcon" />
    </XhIconWrapper>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px">
  <xh-icon-wrapper variant="subtle" tone="brand"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z" /></svg></xh-icon></span></xh-icon-wrapper>
  <xh-icon-wrapper variant="subtle" tone="success"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z" /></svg></xh-icon></span></xh-icon-wrapper>
  <xh-icon-wrapper variant="subtle" tone="warning"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z" /></svg></xh-icon></span></xh-icon-wrapper>
  <xh-icon-wrapper variant="subtle" tone="danger"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z" /></svg></xh-icon></span></xh-icon-wrapper>
  <xh-icon-wrapper variant="subtle" tone="info"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z" /></svg></xh-icon></span></xh-icon-wrapper>
</div>
```

### 尺寸

设置图标块大小

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { FolderIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIconWrapper v-for="size in sizes" :key="size" :size="size" variant="subtle" tone="brand">
      <XhIcon :icon="FolderIcon" />
    </XhIconWrapper>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px">
  <xh-icon-wrapper size="sm" variant="subtle" tone="brand"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21.5 18.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H9l2 3h8.5a2 2 0 0 1 2 2Z" /></svg></xh-icon></span></xh-icon-wrapper>
  <xh-icon-wrapper size="md" variant="subtle" tone="brand"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21.5 18.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H9l2 3h8.5a2 2 0 0 1 2 2Z" /></svg></xh-icon></span></xh-icon-wrapper>
  <xh-icon-wrapper size="lg" variant="subtle" tone="brand"><span data-xh-part="root"><xh-icon><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21.5 18.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H9l2 3h8.5a2 2 0 0 1 2 2Z" /></svg></xh-icon></span></xh-icon-wrapper>
</div>
```

## 设计指引

### 何时使用

- 突出功能入口、状态或分类图标。
- 统一一组图标的视觉尺寸。

### 何时不用

- 只需显示图标时，使用[图标](./icon)。
- 显示人物或组织形象时，使用[头像](./avatar)。

### 特性

- 支持三档尺寸。
- 支持四种变体和六种语义颜色。

### 组合

- 通常与[图标](./icon)、[空状态](./empty-state)或[列表](./list)组合使用。

### 最佳实践

- 同组图标块使用一致的尺寸和变体。
- 图标块不承载交互；可点击操作使用[按钮](./button)。

### 反模式

- 不要用图标块替代[徽标](./badge)显示计数。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-icon-wrapper>` |
| Vue 组件 | `XhIconWrapper` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/icon-wrapper.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info。 |
| `variant` | `ActionVariant` |  | 变体：solid / subtle / outline / ghost。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/icon-wrapper.css` 使用 `[data-scope="icon-wrapper"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-icon-wrapper-bg` | `root` | `background` | `default` | `--xh-bg-subtle` | icon-wrapper 的 root 部件 background 覆盖槽。 |
| `--xh-icon-wrapper-fg` | `root` | `color` | `default` | `--xh-fg-default` | icon-wrapper 的 root 部件 color 覆盖槽。 |
| `--xh-icon-wrapper-glyph-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | icon-wrapper 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-icon-wrapper-radius` | `root` | `border-radius` | `default` | `--xh-shape-pill` | icon-wrapper 的 root 部件 border-radius 覆盖槽。 |
| `--xh-icon-wrapper-shadow` | `root` | `box-shadow` | `variant=solid` | `--xh-_icon-wrapper-highlight` | icon-wrapper 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-icon-wrapper-size` | `root` | `block-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-h-lg`<br>`--xh-control-h-md`<br>`--xh-control-h-sm` | icon-wrapper 的 root 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
