来源：https://ui.docs.xihanfun.com/components/icon

# Icon 图标

用于显示矢量图标。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/icon" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/icon.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/icon" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/icon" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/icon.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

显示一个图标

```vue
<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhIcon :icon="CheckIcon" />
</template>
```

```html
<xh-icon>
  <svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 12.5L9.5 18L20 6" />
  </svg>
</xh-icon>
```

## 组件结构

加粗的是必需部件。

`data-scope="icon"`：**`root`** · `glyph`

## 示例

### 尺寸与描边

设置图标大小和描边粗细

```vue
<script setup lang="ts">
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIcon :icon="StarIcon" size="text" />
    <XhIcon :icon="StarIcon" size="sm" />
    <XhIcon :icon="StarIcon" size="md" />
    <XhIcon :icon="StarIcon" size="lg" />
    <XhIcon :icon="StarIcon" size="xl" />
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIcon :icon="StarIcon" size="lg" weight="light" />
    <XhIcon :icon="StarIcon" size="lg" />
    <XhIcon :icon="StarIcon" size="lg" weight="bold" />
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px">
  <xh-icon size="text"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z"/></svg></xh-icon>
  <xh-icon size="sm"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z"/></svg></xh-icon>
  <xh-icon size="md"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z"/></svg></xh-icon>
  <xh-icon size="lg"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z"/></svg></xh-icon>
  <xh-icon size="xl"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z"/></svg></xh-icon>
</div>
<div style="display: flex; align-items: center; gap: 12px">
  <xh-icon size="lg" weight="light"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z"/></svg></xh-icon>
  <xh-icon size="lg"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z"/></svg></xh-icon>
  <xh-icon size="lg" weight="bold"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z"/></svg></xh-icon>
</div>
```

### 可访问名称

为独立图标提供名称

```vue
<script setup lang="ts">
import { XIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhIcon :icon="XIcon" label="关闭" />
</template>
```

```html
<xh-icon label="关闭">
  <svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M6 6L18 18" />
    <path d="M18 6L6 18" />
  </svg>
</xh-icon>
```

### 自定义图形

直接提供 SVG 图形

```vue
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhIcon viewBox="0 0 24 24" size="lg" label="曦寒标记">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
    <path d="M8 8L16 16M16 8L8 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </XhIcon>
</template>
```

```html
<xh-icon size="lg" label="曦寒标记">
  <svg data-xh-part="root" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
    <path d="M8 8L16 16M16 8L8 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
</xh-icon>
```

### 颜色

使用语义颜色

```vue
<script setup lang="ts">
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";

const tones = ["brand", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <XhIcon v-for="tone in tones" :key="tone" :icon="StarIcon" :tone="tone" size="lg" />
</template>
```

```html
<xh-icon tone="brand" size="lg"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z" /></svg></xh-icon>
<xh-icon tone="success" size="lg"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z" /></svg></xh-icon>
<xh-icon tone="warning" size="lg"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z" /></svg></xh-icon>
<xh-icon tone="danger" size="lg"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z" /></svg></xh-icon>
<xh-icon tone="info" size="lg"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z" /></svg></xh-icon>
```

### 旋转与翻转

改变图标方向

```vue
<script setup lang="ts">
import { ArrowRightIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhIcon :icon="ArrowRightIcon" size="lg" />
  <XhIcon :icon="ArrowRightIcon" size="lg" :rotate="90" />
  <XhIcon :icon="ArrowRightIcon" size="lg" :rotate="180" />
  <XhIcon :icon="ArrowRightIcon" size="lg" :rotate="270" />
  <XhIcon :icon="ArrowRightIcon" size="lg" flip="horizontal" />
</template>
```

```html
<xh-icon size="lg"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12H20" /><path d="M14 6L20 12L14 18" /></svg></xh-icon>
<xh-icon size="lg" rotate="90"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12H20" /><path d="M14 6L20 12L14 18" /></svg></xh-icon>
<xh-icon size="lg" rotate="180"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12H20" /><path d="M14 6L20 12L14 18" /></svg></xh-icon>
<xh-icon size="lg" rotate="270"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12H20" /><path d="M14 6L20 12L14 18" /></svg></xh-icon>
<xh-icon size="lg" flip="horizontal"><svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12H20" /><path d="M14 6L20 12L14 18" /></svg></xh-icon>
```

## 设计指引

### 何时使用

- 为操作、状态或条目提供图形标识。
- 作为独立信息使用时提供可访问名称。

### 何时不用

- 需要带背景的图标时，使用[图标块](./icon-wrapper)。
- 照片或插画使用[图片](./image)。

### 特性

- 直接接收可摇树优化的图标记录。
- `label` 区分信息图标与装饰图标。
- 支持八档尺寸和三档描边粗细。
- 支持旋转与水平、垂直翻转。
- 颜色只作用于图标前景。

### 组合

- 放入[按钮](./button)或[图标块](./icon-wrapper)。

### 最佳实践

- 图标旁已有同义文字时保持装饰状态。
- 同一操作区域使用一致的描边粗细。

### 反模式

- 不要为装饰图标重复提供名称。
- 不要只用图标表达不明确的状态。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-icon>` |
| Vue 组件 | `XhIcon` |
| 组合式函数 | `useIcon` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/icon.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `flip` | `IconFlip` |  | 翻转轴：horizontal / vertical / both，不翻转时不写。旋转与翻转同时提供时两者叠加。 |
| `icon` | `IconRecord` |  | 要绘制的图标。传入的是记录本身而不是名字： 名字需要运行期查表，查表就必须把全表静态引入，摇树完全失效。 |
| `label` | `string` |  | 可及名。 提供非空白文本 = 该图标是页面上唯一表达该信息的元素，输出 role="img" + aria-label； 缺席或全空白 = 装饰，输出 aria-hidden="true"。没有第三种形态。 |
| `rotate` | `IconRotate \| string` |  | 旋转档位：90 / 180 / 270，不旋转时不写。 接受字符串是因为 WC 侧的档位来自 DOM 属性；不是这三档的值一律不写出。 |
| `size` | `IconSize` |  | 直径档位，默认 md；默认档不输出 data-size。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info。 |
| `weight` | `IconWeight` |  | 描边粗细档位，默认 regular；默认档不输出 data-weight。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string \| undefined` | 解析后的可及名；装饰态为 undefined。 |
| `decorative` | `boolean` | 是否装饰态（label 未提供或全空白）。 |
| `nodes` | `readonly IconNode[]` | 要铺进 glyph 的图元树；未传 icon 时为空数组。 |
| `content` | `IconRecord \| undefined` | 当前铺设内容的身份。即 icon 本身：记录是模块级常量，引用相等即内容相等。 不用字符串签名：签名要遍历整棵树再拼串，每次 wire 都要付出一次。 |
| `getRootProps` | `() => T['element']` |  |
| `getGlyphProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-hidden` | 'true' \| undefined |
| `root` | `aria-label` | props.label \| undefined |
| `root` | `role` | undefined \| 'img' |

## 样式参考

### 皮肤

`@xihan-ui/styles/icon.css` 使用 `[data-scope="icon"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-flip` | props.flip |
| `root` | `data-icon` | icon?.name |
| `root` | `data-rotate` | rotateAttr(props.rotate) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-weight` | props.weight |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-icon-fg` | `root` | `color` | `default`<br>`tone` | `--xh-_tone-fg`<br>`currentColor` | icon 的 root 部件 color 覆盖槽。 |
| `--xh-icon-shift` | `root` | `vertical-align` | `default` | `--xh-glyph-baseline-shift` | icon 的 root 部件 vertical-align 覆盖槽。 |
| `--xh-icon-size` | `autoplay-trigger`<br>`branch-indicator`<br>`branch-trigger`<br>`cancel-trigger`<br>`caps-lock-indicator`<br>`clear-trigger`<br>`close-trigger`<br>`column-visibility-trigger`<br>`control`<br>`decrement-trigger`<br>`edit-trigger`<br>`ellipsis-trigger`<br>`expand-trigger`<br>`flip-horizontal-trigger`<br>`flip-vertical-trigger`<br>`increment-trigger`<br>`indicator`<br>`item`<br>`item-checkbox`<br>`item-close-trigger`<br>`item-delete-trigger`<br>`item-indicator`<br>`move-down-trigger`<br>`move-up-trigger`<br>`next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger`<br>`root`<br>`rotate-left-trigger`<br>`rotate-right-trigger`<br>`row-select-trigger`<br>`scroll-to-end-trigger`<br>`select-all-trigger`<br>`separator`<br>`sort-trigger`<br>`submit-trigger`<br>`to-source-trigger`<br>`to-target-trigger`<br>`trend`<br>`trigger`<br>`trigger-indicator`<br>`truncation`<br>`visibility-trigger`<br>`window-state-trigger`<br>`zoom-in-trigger`<br>`zoom-out-trigger` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `@media (min-width: 640px)`<br>`default`<br>`direction`<br>`empty`<br>`is([data-part='edit-trigger'], [data-part='submit-trigger'], [data-part='cancel-trigger'])`<br>`mode=send`<br>`mode=stop`<br>`not([aria-busy='true'])`<br>`size=2xl`<br>`size=3xl`<br>`size=4xl`<br>`size=lg`<br>`size=md`<br>`size=sm`<br>`size=text`<br>`size=xl`<br>`sort=asc`<br>`sort=desc`<br>`state=checked`<br>`state=completed`<br>`state=indeterminate`<br>`state=paused`<br>`state=running`<br>`state=visible` | `--xh-_color-swatch-picker-mark`<br>`--xh-glyph-size-2xl`<br>`--xh-glyph-size-3xl`<br>`--xh-glyph-size-4xl`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm`<br>`--xh-glyph-size-text`<br>`--xh-glyph-size-xl` | icon 的 autoplay-trigger、branch-indicator、branch-trigger、cancel-trigger、caps-lock-indicator、clear-trigger、close-trigger、column-visibility-trigger、control、decrement-trigger、edit-trigger、ellipsis-trigger、expand-trigger、flip-horizontal-trigger、flip-vertical-trigger、increment-trigger、indicator、item、item-checkbox、item-close-trigger、item-delete-trigger、item-indicator、move-down-trigger、move-up-trigger、next-trigger、next-year-trigger、prev-trigger、prev-year-trigger、root、rotate-left-trigger、rotate-right-trigger、row-select-trigger、scroll-to-end-trigger、select-all-trigger、separator、sort-trigger、submit-trigger、to-source-trigger、to-target-trigger、trend、trigger、trigger-indicator、truncation、visibility-trigger、window-state-trigger、zoom-in-trigger、zoom-out-trigger 部件 block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-icon-stroke` | `root` | `stroke-width` | `default`<br>`weight=bold`<br>`weight=light` | `--xh-glyph-stroke-bold`<br>`--xh-glyph-stroke-light`<br>`--xh-glyph-stroke-regular` | icon 的 root 部件 stroke-width 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
