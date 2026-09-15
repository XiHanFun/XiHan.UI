来源：https://ui.docs.xihanfun.com/components/grid

# Grid 栅格 `alpha`

按行列排列内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/grid" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/grid.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/grid" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/grid" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/grid.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

创建等宽列

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle
  = "min-inline-size: 0; padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)";

const metrics = [
  { label: "活跃用户", value: "12,860" },
  { label: "转化率", value: "8.4%" },
  { label: "订单", value: "1,294" },
];
</script>

<template>
  <XhGridRoot :cols="3" gap="md" style="inline-size: min(600px, 100%)">
    <XhGridItem v-for="metric in metrics" :key="metric.label" :style="cellStyle">
      <div style="color: var(--xh-fg-muted); font-size: 13px">{{ metric.label }}</div>
      <strong style="display: block; margin-block-start: 8px; font-size: 24px">{{ metric.value }}</strong>
    </XhGridItem>
  </XhGridRoot>
</template>
```

```html
<style>
  #grid-basic [data-card] {
    min-inline-size: 0;
    padding: 16px;
    border-radius: var(--xh-shape-surface);
    background: var(--xh-bg-subtle);
  }
  #grid-basic [data-label] { color: var(--xh-fg-muted); font-size: 13px; }
  #grid-basic strong { display: block; margin-block-start: 8px; font-size: 24px; }
</style>
<xh-grid id="grid-basic" cols="3" gap="md" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(600px, 100%)">
    <div data-xh-part="item" data-card><div data-label>活跃用户</div><strong>12,860</strong></div>
    <div data-xh-part="item" data-card><div data-label>转化率</div><strong>8.4%</strong></div>
    <div data-xh-part="item" data-card><div data-label>订单</div><strong>1,294</strong></div>
  </div>
</xh-grid>
```

## 组件结构

加粗的是必需部件。

`data-scope="grid"`：**`root`** · `item`

## 示例

### 自适应列

根据最小列宽自动排列

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const features = ["无头内核", "Vue", "React", "Web Components", "设计令牌", "无障碍"];
</script>

<template>
  <XhGridRoot min-col-width="sm" gap="sm" style="inline-size: min(640px, 100%)">
    <XhGridItem
      v-for="feature in features"
      :key="feature"
      style="padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      {{ feature }}
    </XhGridItem>
  </XhGridRoot>
</template>
```

```html
<style>
  #grid-adaptive [data-card] { padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
</style>
<xh-grid id="grid-adaptive" min-col-width="sm" gap="sm" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(640px, 100%)">
    <div data-xh-part="item" data-card>无头内核</div>
    <div data-xh-part="item" data-card>Vue</div>
    <div data-xh-part="item" data-card>React</div>
    <div data-xh-part="item" data-card>Web Components</div>
    <div data-xh-part="item" data-card>设计令牌</div>
    <div data-xh-part="item" data-card>无障碍</div>
  </div>
</xh-grid>
```

### 跨列与错列

控制内容占用的列

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const itemStyle = "padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)";
</script>

<template>
  <XhGridRoot :cols="4" gap="sm" style="inline-size: min(640px, 100%)">
    <XhGridItem :span="3" :style="itemStyle">项目概览</XhGridItem>
    <XhGridItem :style="itemStyle">动态</XhGridItem>
    <XhGridItem :span="2" :style="itemStyle">任务</XhGridItem>
    <XhGridItem :span="2" :style="itemStyle">成员</XhGridItem>
    <XhGridItem :offset="1" :span="2" style="padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand)">居中区域</XhGridItem>
  </XhGridRoot>
</template>
```

```html
<style>
  #grid-span [data-card] { padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
</style>
<xh-grid id="grid-span" cols="4" gap="sm" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(640px, 100%)">
    <div data-xh-part="item" span="3" data-card>项目概览</div>
    <div data-xh-part="item" data-card>动态</div>
    <div data-xh-part="item" span="2" data-card>任务</div>
    <div data-xh-part="item" span="2" data-card>成员</div>
    <div data-xh-part="item" offset="1" span="2" data-card style="background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand)">居中区域</div>
  </div>
</xh-grid>
```

### 间距

设置栅格间距

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const groups = [
  { gap: "sm", label: "紧凑" },
  { gap: "md", label: "标准" },
  { gap: "lg", label: "宽松" },
] as const;
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: min(480px, 100%)">
    <div v-for="group in groups" :key="group.gap">
      <div style="margin-block-end: 6px; color: var(--xh-fg-muted); font-size: 13px">{{ group.label }}</div>
      <XhGridRoot :cols="3" :gap="group.gap">
        <XhGridItem
          v-for="item in 3"
          :key="item"
          style="block-size: 32px; border-radius: var(--xh-shape-control); background: var(--xh-bg-brand-subtle)"
        />
      </XhGridRoot>
    </div>
  </div>
</template>
```

```html
<style>
  #grid-gap { display: grid; gap: 16px; inline-size: min(480px, 100%); }
  #grid-gap [data-label] { margin-block-end: 6px; color: var(--xh-fg-muted); font-size: 13px; }
  #grid-gap [data-box] { block-size: 32px; border-radius: var(--xh-shape-control); background: var(--xh-bg-brand-subtle); }
</style>
<div id="grid-gap">
  <div><div data-label>紧凑</div><xh-grid cols="3" gap="sm" style="display: contents"><div data-xh-part="root"><div data-xh-part="item" data-box></div><div data-xh-part="item" data-box></div><div data-xh-part="item" data-box></div></div></xh-grid></div>
  <div><div data-label>标准</div><xh-grid cols="3" gap="md" style="display: contents"><div data-xh-part="root"><div data-xh-part="item" data-box></div><div data-xh-part="item" data-box></div><div data-xh-part="item" data-box></div></div></xh-grid></div>
  <div><div data-label>宽松</div><xh-grid cols="3" gap="lg" style="display: contents"><div data-xh-part="root"><div data-xh-part="item" data-box></div><div data-xh-part="item" data-box></div><div data-xh-part="item" data-box></div></div></xh-grid></div>
</div>
```

### 响应式列

在不同视口使用不同列数

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const sections = ["概览", "分析", "报告", "设置"];
</script>

<template>
  <XhGridRoot :cols="{ base: 1, sm: 2, lg: 4 }" gap="sm" style="inline-size: min(720px, 100%)">
    <XhGridItem
      v-for="section in sections"
      :key="section"
      style="padding: 20px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); text-align: center"
    >
      {{ section }}
    </XhGridItem>
  </XhGridRoot>
</template>
```

```html
<style>
  #grid-responsive [data-card] { padding: 20px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); text-align: center; }
</style>
<xh-grid id="grid-responsive" cols='{"base":1,"sm":2,"lg":4}' gap="sm" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(720px, 100%)">
    <div data-xh-part="item" data-card>概览</div>
    <div data-xh-part="item" data-card>分析</div>
    <div data-xh-part="item" data-card>报告</div>
    <div data-xh-part="item" data-card>设置</div>
  </div>
</xh-grid>
```

## 设计指引

### 何时使用

- 排列表单字段、卡片或统计数据。
- 根据视口宽度调整列数。

### 何时不用

- 单轴排列使用[弹性布局](./flex)。
- 不需要行对齐的错落内容使用[瀑布流](./masonry)。

### 特性

- 支持 1 至 12 列和响应式列数。
- 支持自适应最小列宽。
- 支持统一或独立的行列间距。
- 支持跨列、错列和格内对齐。

### 组合

- 可与[表单字段](./field)组合为响应式表单。

### 最佳实践

- 响应式配置从 `base` 开始定义。
- 需要超过 12 列时拆分为多个栅格区域。

### 反模式

- 不要用栅格替代整页[布局](./layout)。
- 不要为等宽格子设置固定宽度。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-grid>` |
| Vue 组件 | `XhGridItem` `XhGridRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/grid.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `GridAlign` |  | 每一项在自己那格里的块向对齐：start / center / end / stretch / baseline，不写则铺满格高。 |
| `cols` | `GridCols` |  | 列数：1 至 12 的整数，不写按一列排；范围外的值也按一列排。 各列等宽，且每列的下限是 0，长内容不会把自己那列撑宽。 也收断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，没写的档沿用比它窄的那一档。 |
| `columnGap` | `GridGap` |  | 只改列间距，档位同 gap；不写则跟着 gap 走。 |
| `gap` | `GridGap` |  | 行列间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 |
| `justifyItems` | `GridJustifyItems` |  | 每一项在自己那格里的行内对齐：start / center / end / stretch，不写则铺满格宽。 |
| `minColWidth` | `GridMinColWidth` |  | 每列最少多宽：xs / sm / md / lg 四档，各指一个列宽下限令牌。写了它，列数改由容器宽度 除以这个下限得出（放得下几列就几列），`cols` 那条轨道表不再生效。不收裸像素值。 |
| `rowGap` | `GridGap` |  | 只改行间距，档位同 gap；不写则跟着 gap 走。 |
| `rows` | `GridRowCount` |  | 行数：1 至 12 的整数，不写则行数由内容自己撑出来；范围外的值也按不写算。 写了就把这几行排成显式轨道，超出的项落进隐式行。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props?: GridItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/grid.css` 使用 `[data-scope="grid"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-cols` | cols.base |
| `root` | `data-cols-lg` | cols.lg |
| `root` | `data-cols-md` | cols.md |
| `root` | `data-cols-sm` | cols.sm |
| `root` | `data-cols-xl` | cols.xl |
| `root` | `data-column-gap` | props.columnGap |
| `root` | `data-gap` | props.gap |
| `root` | `data-justify-items` | props.justifyItems |
| `root` | `data-min-col` | props.minColWidth |
| `root` | `data-row-gap` | props.rowGap |
| `root` | `data-rows` | tier(props.rows, MAX_COLUMN_COUNT) |
| `item` | `data-offset` | offset.base |
| `item` | `data-offset-lg` | offset.lg |
| `item` | `data-offset-md` | offset.md |
| `item` | `data-offset-sm` | offset.sm |
| `item` | `data-offset-xl` | offset.xl |
| `item` | `data-span` | span.base |
| `item` | `data-span-lg` | span.lg |
| `item` | `data-span-md` | span.md |
| `item` | `data-span-sm` | span.sm |
| `item` | `data-span-xl` | span.xl |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-grid-column-gap` | `root` | `column-gap` | `column-gap=lg`<br>`column-gap=md`<br>`column-gap=sm`<br>`column-gap=xl`<br>`column-gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs` | grid 的 root 部件 column-gap 覆盖槽。 |
| `--xh-grid-columns` | `root` | `grid-template-columns` | `default`<br>`min-col` | `--xh-_grid-col-min`<br>`--xh-_grid-cols` | grid 的 root 部件 grid-template-columns 覆盖槽。 |
| `--xh-grid-gap` | `root` | `gap` | `default`<br>`gap=lg`<br>`gap=md`<br>`gap=sm`<br>`gap=xl`<br>`gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs`<br>`--xh-space-0` | grid 的 root 部件 gap 覆盖槽。 |
| `--xh-grid-row-gap` | `root` | `row-gap` | `row-gap=lg`<br>`row-gap=md`<br>`row-gap=sm`<br>`row-gap=xl`<br>`row-gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs` | grid 的 root 部件 row-gap 覆盖槽。 |
| `--xh-grid-rows` | `root` | `grid-template-rows` | `rows` | `--xh-_grid-rows` | grid 的 root 部件 grid-template-rows 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 1280px` · `min-width: 640px` · `min-width: 768px`。
