来源：https://ui.docs.xihanfun.com/components/masonry

# Masonry 瀑布流 `alpha`

将等宽、不等高的内容排列为瀑布流。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/masonry" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/masonry.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/masonry" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/masonry" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/masonry.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

按最短列排列卡片

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const cards = [
  { title: "快速上手", description: "几分钟完成安装并渲染第一个组件。" },
  { title: "无头内核", description: "行为、状态和无障碍逻辑独立于视图层，可在多个框架中复用。" },
  { title: "设计令牌", description: "统一颜色、间距和动效。" },
  { title: "多端适配", description: "同时支持 Vue、React 和 Web Components。" },
  { title: "无障碍", description: "内置键盘导航与语义属性。" },
  { title: "主题系统", description: "支持浅色、深色、高对比度和自定义品牌主题。" },
];
</script>

<template>
  <XhMasonry :columns="3" gap="md" style="inline-size: min(680px, 100%)">
    <article
      v-for="card in cards"
      :key="card.title"
      style="padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <strong>{{ card.title }}</strong>
      <p style="margin-block-end: 0; color: var(--xh-fg-muted)">{{ card.description }}</p>
    </article>
  </XhMasonry>
</template>
```

```html
<style>
  #masonry-basic article { padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
  #masonry-basic p { margin-block-end: 0; color: var(--xh-fg-muted); }
</style>
<xh-masonry id="masonry-basic" columns="3" gap="md" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(680px, 100%)">
    <div data-xh-part="column"></div><div data-xh-part="column"></div><div data-xh-part="column"></div>
    <div data-xh-part="item"><article><strong>快速上手</strong><p>几分钟完成安装并渲染第一个组件。</p></article></div>
    <div data-xh-part="item"><article><strong>无头内核</strong><p>行为、状态和无障碍逻辑独立于视图层，可在多个框架中复用。</p></article></div>
    <div data-xh-part="item"><article><strong>设计令牌</strong><p>统一颜色、间距和动效。</p></article></div>
    <div data-xh-part="item"><article><strong>多端适配</strong><p>同时支持 Vue、React 和 Web Components。</p></article></div>
    <div data-xh-part="item"><article><strong>无障碍</strong><p>内置键盘导航与语义属性。</p></article></div>
    <div data-xh-part="item"><article><strong>主题系统</strong><p>支持浅色、深色、高对比度和自定义品牌主题。</p></article></div>
  </div>
</xh-masonry>
```

## 组件结构

加粗的是必需部件。

`data-scope="masonry"`：**`root`** · **`column`** · `item`

## 示例

### 响应式列

根据容器宽度调整列数

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const items = ["概览", "组件", "主题", "发布"];
</script>

<template>
  <XhMasonry :columns="{ base: 1, sm: 2, md: 3 }" gap="sm" style="inline-size: min(720px, 100%)">
    <div
      v-for="(item, index) in items"
      :key="item"
      :style="`padding: ${16 + index * 6}px 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)`"
    >
      {{ item }}
    </div>
  </XhMasonry>
</template>
```

```html
<xh-masonry columns='{"base":1,"sm":2,"md":3}' gap="sm" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(720px, 100%)">
    <div data-xh-part="column"></div><div data-xh-part="column"></div><div data-xh-part="column"></div>
    <div data-xh-part="item"><div style="padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">概览</div></div>
    <div data-xh-part="item"><div style="padding: 22px 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">组件</div></div>
    <div data-xh-part="item"><div style="padding: 28px 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">主题</div></div>
    <div data-xh-part="item"><div style="padding: 34px 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">发布</div></div>
  </div>
</xh-masonry>
```

### 间距

设置列与项目之间的间距

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const items = ["设计", "开发", "测试", "发布"];
const gaps = ["sm", "lg"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <div v-for="gap in gaps" :key="gap" style="inline-size: min(280px, 100%)">
      <div style="margin-block-end: 8px; color: var(--xh-fg-muted); font-size: 13px">{{ gap }}</div>
      <XhMasonry :columns="2" :gap="gap">
        <div
          v-for="(item, index) in items"
          :key="item"
          :style="`padding: ${12 + index * 5}px 12px; border-radius: var(--xh-shape-control); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand)`"
        >
          {{ item }}
        </div>
      </XhMasonry>
    </div>
  </div>
</template>
```

```html
<style>
  #masonry-gap [data-card] { border-radius: var(--xh-shape-control); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand); }
</style>
<div id="masonry-gap" style="display: flex; flex-wrap: wrap; gap: 24px">
  <div style="inline-size: min(280px, 100%)"><div style="margin-block-end: 8px; color: var(--xh-fg-muted); font-size: 13px">sm</div><xh-masonry columns="2" gap="sm" style="display: contents"><div data-xh-part="root"><div data-xh-part="column"></div><div data-xh-part="column"></div><div data-xh-part="item"><div data-card style="padding: 12px">设计</div></div><div data-xh-part="item"><div data-card style="padding: 17px 12px">开发</div></div><div data-xh-part="item"><div data-card style="padding: 22px 12px">测试</div></div><div data-xh-part="item"><div data-card style="padding: 27px 12px">发布</div></div></div></xh-masonry></div>
  <div style="inline-size: min(280px, 100%)"><div style="margin-block-end: 8px; color: var(--xh-fg-muted); font-size: 13px">lg</div><xh-masonry columns="2" gap="lg" style="display: contents"><div data-xh-part="root"><div data-xh-part="column"></div><div data-xh-part="column"></div><div data-xh-part="item"><div data-card style="padding: 12px">设计</div></div><div data-xh-part="item"><div data-card style="padding: 17px 12px">开发</div></div><div data-xh-part="item"><div data-card style="padding: 22px 12px">测试</div></div><div data-xh-part="item"><div data-card style="padding: 27px 12px">发布</div></div></div></xh-masonry></div>
</div>
```

### 顺序排列

按文档顺序逐列填充

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const steps = ["创建项目", "配置主题", "添加组件", "连接数据", "运行测试", "发布应用"];
</script>

<template>
  <XhMasonry :columns="3" gap="sm" sequential style="inline-size: min(640px, 100%)">
    <div
      v-for="(step, index) in steps"
      :key="step"
      :style="`padding: ${14 + (index % 3) * 8}px 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)`"
    >
      <strong>{{ index + 1 }}</strong>
      <div style="margin-block-start: 6px">{{ step }}</div>
    </div>
  </XhMasonry>
</template>
```

```html
<style>
  #masonry-sequential [data-card] { padding: 18px 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
  #masonry-sequential [data-card] div { margin-block-start: 6px; }
</style>
<xh-masonry id="masonry-sequential" columns="3" gap="sm" sequential style="display: contents">
  <div data-xh-part="root" style="inline-size: min(640px, 100%)">
    <div data-xh-part="column"></div><div data-xh-part="column"></div><div data-xh-part="column"></div>
    <div data-xh-part="item"><div data-card><strong>1</strong><div>创建项目</div></div></div>
    <div data-xh-part="item"><div data-card><strong>2</strong><div>配置主题</div></div></div>
    <div data-xh-part="item"><div data-card><strong>3</strong><div>添加组件</div></div></div>
    <div data-xh-part="item"><div data-card><strong>4</strong><div>连接数据</div></div></div>
    <div data-xh-part="item"><div data-card><strong>5</strong><div>运行测试</div></div></div>
    <div data-xh-part="item"><div data-card><strong>6</strong><div>发布应用</div></div></div>
  </div>
</xh-masonry>
```

## 设计指引

### 何时使用

- 展示图片墙、卡片流或长短不一的摘要。
- 希望内容按最短列排列并减少空白。

### 何时不用

- 等高或跨列内容使用[栅格](./grid)。
- 单轴排列使用[弹性布局](./flex)。
- 大量数据使用[虚拟滚动](./virtualizer)。

### 特性

- 默认按最短列排列，也支持按顺序逐列填充。
- 支持固定列数和响应式列数。
- 支持五档行列间距。

### 组合

- 常与[卡片](./card)、[图片](./image)或[骨架屏](./skeleton)组合使用。

### 最佳实践

- 图片应提供宽高或宽高比，减少加载后的重排。
- 避免在会重排的项目中放置不可恢复的交互状态。
- Web Components 需按最大列数提供空的 `column` 节点。

### 反模式

- 不要用 CSS 多栏替代瀑布流布局。
- 不要对有严格顺序的内容使用最短列策略。
- 不要用项目外边距代替 `gap`。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-masonry>` |
| Vue 组件 | `XhMasonry` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/masonry.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `columns` | `MasonryColumns` |  | 分几列，不写按三列。也收断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数， 没写的档沿用比它窄的那一档。换档看的是容器自身的宽度，不是视口宽度。 |
| `gap` | `MasonryGap` |  | 列与列、项与项之间的间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 |
| `sequential` | `boolean` |  | 按文档序逐列填：项成段落进各列，读起来仍是「先走完左列，再走下一列」。 不写则最短列优先，视觉上更齐平，但相邻的两项未必挨着。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getColumnProps` | `(props: MasonryColumnProps) => T['element']` |  |
| `getItemProps` | `(props: MasonryItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

- 最短列策略会改变 DOM 顺序。
- 顺序有意义的内容使用 `sequential`。
- 需要稳定焦点顺序时使用[栅格](./grid)。

## 样式参考

### 皮肤

`@xihan-ui/styles/masonry.css` 使用 `[data-scope="masonry"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-gap` | props.gap |
| `root` | `data-sequential` | ''（条件成立时才出现） |
| `column` | `data-index` | String(column.index) |
| `item` | `data-column` | String(item.column) |
| `item` | `data-index` | String(item.index) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-masonry-gap` | `column`<br>`root` | `gap` | `default`<br>`gap=lg`<br>`gap=md`<br>`gap=sm`<br>`gap=xl`<br>`gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs`<br>`--xh-space-0` | masonry 的 column、root 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### 响应式

- 响应式列数根据容器宽度计算。
- 内容或容器尺寸变化后自动重新排列。

### RTL

- 列顺序和间距自动适配 RTL。
