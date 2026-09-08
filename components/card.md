来源：https://ui.docs.xihanfun.com/components/card

# 卡片 `card`

一块有边界的内容容器：封面、标题、正文与页脚各占一段。

## 何时使用

- 把一组相关信息收成一个可以整体感知的单元。
- 内容块之间需要视觉边界。

## 何时不用

- 页面上每一块都套卡片：边界失效，只剩噪音。
- 只是要一条分隔：用[分隔线](./separator)。

## 特性

- 七个部件全部可选，只写用得上的那几段。
- `split` 在各段之间画线，`hoverable` 给出悬停反馈。

## 示例

### 基础用法

除了 root，封面、头、身、脚都可选；只写用得上的那几段

```vue
<script setup lang="ts">
import { XhCardBody, XhCardDescription, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";
</script>

<template>
  <XhCardRoot variant="outline" style="max-inline-size: 360px">
    <XhCardHeader>
      <XhCardTitle>本月账单</XhCardTitle>
      <XhCardDescription>账期 7 月 1 日至 7 月 31 日</XhCardDescription>
    </XhCardHeader>
    <XhCardBody>共 128 笔支出，合计 3,240.00 元。</XhCardBody>
  </XhCardRoot>
</template>
```

```html
<xh-card variant="outline">
  <div data-xh-part="root" style="max-inline-size: 360px">
    <div data-xh-part="header">
      <div data-xh-part="title">本月账单</div>
      <div data-xh-part="description">账期 7 月 1 日至 7 月 31 日</div>
    </div>
    <div data-xh-part="body">共 128 笔支出，合计 3,240.00 元。</div>
  </div>
</xh-card>
```

### 形态

variant 只改描边、底色与投影怎么用，各段的排版三档一致

```vue
<script setup lang="ts">
import { XhCardBody, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";

const variants = ["outline", "subtle", "elevated", "ghost"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhCardRoot v-for="v in variants" :key="v" :variant="v" style="inline-size: 200px">
      <XhCardHeader>
        <XhCardTitle>{{ v }}</XhCardTitle>
      </XhCardHeader>
      <XhCardBody>一段用来看底色与描边的正文。</XhCardBody>
    </XhCardRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-card variant="outline">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">outline</div>
      </div>
      <div data-xh-part="body">一段用来看底色与描边的正文。</div>
    </div>
  </xh-card>

  <xh-card variant="subtle">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">subtle</div>
      </div>
      <div data-xh-part="body">一段用来看底色与描边的正文。</div>
    </div>
  </xh-card>

  <xh-card variant="elevated">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">elevated</div>
      </div>
      <div data-xh-part="body">一段用来看底色与描边的正文。</div>
    </div>
  </xh-card>

  <xh-card variant="ghost">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">ghost</div>
      </div>
      <div data-xh-part="body">一段用来看底色与描边的正文。</div>
    </div>
  </xh-card>
</div>
```

### 尺寸

size 换的是各段的内边距与标题字号，不写 size 即默认档

```vue
<script setup lang="ts">
import { XhCardBody, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
    <XhCardRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      variant="outline"
      style="inline-size: 200px"
    >
      <XhCardHeader>
        <XhCardTitle>{{ s.label }}</XhCardTitle>
      </XhCardHeader>
      <XhCardBody>正文。</XhCardBody>
    </XhCardRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
  <xh-card variant="outline" size="sm">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">小</div>
      </div>
      <div data-xh-part="body">正文。</div>
    </div>
  </xh-card>

  <!-- 中间一档不写 size -->
  <xh-card variant="outline">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">默认</div>
      </div>
      <div data-xh-part="body">正文。</div>
    </div>
  </xh-card>

  <xh-card variant="outline" size="lg">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">大</div>
      </div>
      <div data-xh-part="body">正文。</div>
    </div>
  </xh-card>
</div>
```

### 分段与悬停

split 在段与段之间画一条分隔线；hoverable 只在能用指针的设备上抬起

```vue
<script setup lang="ts">
import { XhCardBody, XhCardFooter, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhCardRoot variant="outline" split style="inline-size: 220px">
      <XhCardHeader>
        <XhCardTitle>分段</XhCardTitle>
      </XhCardHeader>
      <XhCardBody>头、身、脚之间各有一条线。</XhCardBody>
      <XhCardFooter>底部操作位</XhCardFooter>
    </XhCardRoot>

    <XhCardRoot variant="outline" hoverable style="inline-size: 220px">
      <XhCardHeader>
        <XhCardTitle>可悬停</XhCardTitle>
      </XhCardHeader>
      <XhCardBody>把指针移上来看抬起效果。</XhCardBody>
    </XhCardRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-card variant="outline" split>
    <div data-xh-part="root" style="inline-size: 220px">
      <div data-xh-part="header">
        <div data-xh-part="title">分段</div>
      </div>
      <div data-xh-part="body">头、身、脚之间各有一条线。</div>
      <div data-xh-part="footer">底部操作位</div>
    </div>
  </xh-card>

  <xh-card variant="outline" hoverable>
    <div data-xh-part="root" style="inline-size: 220px">
      <div data-xh-part="header">
        <div data-xh-part="title">可悬停</div>
      </div>
      <div data-xh-part="body">把指针移上来看抬起效果。</div>
    </div>
  </xh-card>
</div>
```

### 带封面

封面顶到根的边上、不吃内边距，圆角由根统一裁

```vue
<script setup lang="ts">
import { XhCardBody, XhCardDescription, XhCardHeader, XhCardMedia, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";
</script>

<template>
  <XhCardRoot variant="elevated" style="max-inline-size: 300px">
    <XhCardMedia>
      <div
        style="
          block-size: 120px;
          background: linear-gradient(135deg, var(--xh-bg-brand), var(--xh-bg-subtle));
        "
      />
    </XhCardMedia>
    <XhCardHeader>
      <XhCardTitle>七月总结</XhCardTitle>
      <XhCardDescription>封面是任意内容，放图片或自绘都行</XhCardDescription>
    </XhCardHeader>
    <XhCardBody>正文。</XhCardBody>
  </XhCardRoot>
</template>
```

```html
<xh-card variant="elevated">
  <div data-xh-part="root" style="max-inline-size: 300px">
    <div data-xh-part="media">
      <div
        style="
          block-size: 120px;
          background: linear-gradient(135deg, var(--xh-bg-brand), var(--xh-bg-subtle));
        "
      ></div>
    </div>
    <div data-xh-part="header">
      <div data-xh-part="title">七月总结</div>
      <div data-xh-part="description">封面是任意内容，放图片或自绘都行</div>
    </div>
    <div data-xh-part="body">正文。</div>
  </div>
</xh-card>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-card>` |
| Vue 组件 | `XhCardBody` `XhCardDescription` `XhCardFooter` `XhCardHeader` `XhCardMedia` `XhCardRoot` `XhCardTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/card.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="card"`：**`root`** · `media` · `header` · `title` · `description` · `body` · `footer`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `hoverable` | `boolean` |  | 指针悬停时抬起：只落 data-hoverable，抬多少由皮肤定。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定各段的内边距与标题字号。 |
| `split` | `boolean` |  | 分段：在头、身、脚之间画分隔线。 |
| `variant` | `CardVariant` |  | 形态：outline / subtle / elevated / ghost，决定描边、底色与投影怎么用。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getMediaProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/card.css` 按部件选择：`[data-scope="card"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-card-bg` · `--xh-card-body-pt` · `--xh-card-border` · `--xh-card-border-hover` · `--xh-card-description-fg` · `--xh-card-description-font-size` · `--xh-card-divider` · `--xh-card-fg` · `--xh-card-footer-gap` · `--xh-card-footer-pt` · `--xh-card-header-gap` · `--xh-card-header-pb` · `--xh-card-radius` · `--xh-card-shadow` · `--xh-card-shadow-hover` · `--xh-card-title-font-size`

## 动效

`border-color` · `box-shadow` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`hover: hover`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## 组合

- 里面放[描述列表](./descriptions)、[表格](./table)、[统计数值](./statistic)；页脚放[按钮组](./button-group)。

## 最佳实践

- 整卡可点时要有明显的悬停与聚焦反馈，并让整卡进 Tab 序列。
- 卡片内的留白统一，别让每张卡的内边距不一样。

## 反模式

- 卡片套卡片：两层边界互相削弱。
- 整卡可点的同时卡内还有别的按钮：点哪里会发生什么不可预期。
