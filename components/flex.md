来源：https://ui.docs.xihanfun.com/components/flex

# Flex 弹性布局 `alpha`

沿水平或垂直方向排列内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/flex" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/flex.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/flex" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/flex" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/flex.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

水平排列内容

```vue
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";
</script>

<template>
  <XhFlex align="center" gap="sm" aria-label="水平排列占位区块">
    <span data-demo-block="square" data-tone="brand" />
    <XhFlex orientation="vertical" gap="xs">
      <span data-demo-block="line" data-tone="info" style="--xh-demo-block-inline-size: 96px" />
      <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 64px" />
    </XhFlex>
  </XhFlex>
</template>
```

```html
<xh-flex align="center" gap="sm" aria-label="水平排列占位区块" style="display: contents">
  <div data-xh-part="root">
    <span data-demo-block="square" data-tone="brand"></span>
    <xh-flex orientation="vertical" gap="xs" style="display: contents">
      <div data-xh-part="root">
        <span data-demo-block="line" data-tone="info" style="--xh-demo-block-inline-size: 96px"></span>
        <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 64px"></span>
      </div>
    </xh-flex>
  </div>
</xh-flex>
```

## 组件结构

加粗的是必需部件。

`data-scope="flex"`：**`root`** · `split`

## 示例

### 方向

设置水平或垂直排列

```vue
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const items = [
  { id: "设计", tone: "brand" },
  { id: "开发", tone: "info" },
  { id: "测试", tone: "success" },
] as const;
</script>

<template>
  <XhFlex orientation="vertical" gap="lg">
    <XhFlex gap="sm">
      <span v-for="item in items" :key="item.id" data-demo-block :data-tone="item.tone" style="--xh-demo-block-inline-size: 72px" />
    </XhFlex>
    <XhFlex orientation="vertical" gap="sm" style="inline-size: 120px">
      <span v-for="item in items" :key="item.id" data-demo-block :data-tone="item.tone" />
    </XhFlex>
  </XhFlex>
</template>
```

```html
<xh-flex id="flex-direction" orientation="vertical" gap="lg" style="display: contents">
  <div data-xh-part="root">
    <xh-flex gap="sm" style="display: contents"><div data-xh-part="root"><span data-demo-block data-tone="brand" style="--xh-demo-block-inline-size: 72px"></span><span data-demo-block data-tone="info" style="--xh-demo-block-inline-size: 72px"></span><span data-demo-block data-tone="success" style="--xh-demo-block-inline-size: 72px"></span></div></xh-flex>
    <xh-flex orientation="vertical" gap="sm" style="display: contents"><div data-xh-part="root" style="inline-size: 120px"><span data-demo-block data-tone="brand"></span><span data-demo-block data-tone="info"></span><span data-demo-block data-tone="success"></span></div></xh-flex>
  </div>
</xh-flex>
```

### 对齐与分布

对齐内容并分配剩余空间

```vue
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";
</script>

<template>
  <XhFlex
    align="center"
    justify="between"
    aria-label="两端对齐占位区块"
    style="inline-size: min(360px, 100%); padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <XhFlex align="center" gap="sm">
      <span data-demo-block="square" data-tone="brand" />
      <XhFlex orientation="vertical" gap="xs">
        <span data-demo-block="line" data-tone="info" style="--xh-demo-block-inline-size: 88px" />
        <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 48px" />
      </XhFlex>
    </XhFlex>
    <span data-demo-block="line" data-tone="success" style="--xh-demo-block-inline-size: 64px" />
  </XhFlex>
</template>
```

```html
<xh-flex align="center" justify="between" aria-label="两端对齐占位区块" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(360px, 100%); padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <xh-flex align="center" gap="sm" style="display: contents">
      <div data-xh-part="root">
        <span data-demo-block="square" data-tone="brand"></span>
        <xh-flex orientation="vertical" gap="xs" style="display: contents"><div data-xh-part="root"><span data-demo-block="line" data-tone="info" style="--xh-demo-block-inline-size: 88px"></span><span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 48px"></span></div></xh-flex>
      </div>
    </xh-flex>
    <span data-demo-block="line" data-tone="success" style="--xh-demo-block-inline-size: 64px"></span>
  </div>
</xh-flex>
```

### 间距

使用预设间距

```vue
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const groups = [
  { gap: "sm", label: "紧凑" },
  { gap: "md", label: "标准" },
  { gap: "lg", label: "宽松" },
] as const;
</script>

<template>
  <XhFlex orientation="vertical" gap="md">
    <XhFlex v-for="group in groups" :key="group.gap" align="center" gap="md">
      <span style="inline-size: 48px; color: var(--xh-fg-muted)">{{ group.label }}</span>
      <XhFlex :gap="group.gap">
        <span v-for="item in 3" :key="item" data-demo-block="square" data-tone="brand" style="inline-size: 28px; block-size: 28px" />
      </XhFlex>
    </XhFlex>
  </XhFlex>
</template>
```

```html
<style>
  #flex-gap [data-label] {
    inline-size: 48px;
    color: var(--xh-fg-muted);
  }
</style>
<xh-flex id="flex-gap" orientation="vertical" gap="md" style="display: contents">
  <div data-xh-part="root">
    <xh-flex align="center" gap="md" style="display: contents">
      <div data-xh-part="root"><span data-label>紧凑</span><xh-flex gap="sm" style="display: contents"><div data-xh-part="root"><span data-demo-block="square" data-tone="brand" style="inline-size: 28px; block-size: 28px"></span><span data-demo-block="square" data-tone="brand" style="inline-size: 28px; block-size: 28px"></span><span data-demo-block="square" data-tone="brand" style="inline-size: 28px; block-size: 28px"></span></div></xh-flex></div>
    </xh-flex>
    <xh-flex align="center" gap="md" style="display: contents">
      <div data-xh-part="root"><span data-label>标准</span><xh-flex gap="md" style="display: contents"><div data-xh-part="root"><span data-demo-block="square" data-tone="brand" style="inline-size: 28px; block-size: 28px"></span><span data-demo-block="square" data-tone="brand" style="inline-size: 28px; block-size: 28px"></span><span data-demo-block="square" data-tone="brand" style="inline-size: 28px; block-size: 28px"></span></div></xh-flex></div>
    </xh-flex>
    <xh-flex align="center" gap="md" style="display: contents">
      <div data-xh-part="root"><span data-label>宽松</span><xh-flex gap="lg" style="display: contents"><div data-xh-part="root"><span data-demo-block="square" data-tone="brand" style="inline-size: 28px; block-size: 28px"></span><span data-demo-block="square" data-tone="brand" style="inline-size: 28px; block-size: 28px"></span><span data-demo-block="square" data-tone="brand" style="inline-size: 28px; block-size: 28px"></span></div></xh-flex></div>
    </xh-flex>
  </div>
</xh-flex>
```

### 换行与行内

换行排列或随文字排布

```vue
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const tags = [
  { id: 1, tone: "brand", width: "56px" },
  { id: 2, tone: "info", width: "72px" },
  { id: 3, tone: "success", width: "64px" },
  { id: 4, tone: "warning", width: "80px" },
  { id: 5, tone: "danger", width: "68px" },
] as const;
</script>

<template>
  <XhFlex orientation="vertical" gap="lg">
    <XhFlex wrap gap="sm" style="max-inline-size: 280px">
      <span
        v-for="tag in tags"
        :key="tag.id"
        data-demo-block
        :data-tone="tag.tone"
        :style="{ '--xh-demo-block-inline-size': tag.width, '--xh-demo-block-block-size': '24px', '--xh-demo-block-radius': 'var(--xh-shape-pill)' }"
      />
    </XhFlex>
    <XhFlex inline gap="xs" aria-label="行内占位区块">
      <span data-demo-block data-tone="brand" style="--xh-demo-block-inline-size: 68px; --xh-demo-block-block-size: 24px; --xh-demo-block-radius: var(--xh-shape-pill)" />
      <span data-demo-block data-tone="success" style="--xh-demo-block-inline-size: 60px; --xh-demo-block-block-size: 24px; --xh-demo-block-radius: var(--xh-shape-pill)" />
    </XhFlex>
  </XhFlex>
</template>
```

```html
<xh-flex id="flex-wrap" orientation="vertical" gap="lg" style="display: contents">
  <div data-xh-part="root">
    <xh-flex wrap gap="sm" style="display: contents"><div data-xh-part="root" style="max-inline-size: 280px"><span data-demo-block data-tone="brand" style="--xh-demo-block-inline-size: 56px; --xh-demo-block-block-size: 24px; --xh-demo-block-radius: var(--xh-shape-pill)"></span><span data-demo-block data-tone="info" style="--xh-demo-block-inline-size: 72px; --xh-demo-block-block-size: 24px; --xh-demo-block-radius: var(--xh-shape-pill)"></span><span data-demo-block data-tone="success" style="--xh-demo-block-inline-size: 64px; --xh-demo-block-block-size: 24px; --xh-demo-block-radius: var(--xh-shape-pill)"></span><span data-demo-block data-tone="warning" style="--xh-demo-block-inline-size: 80px; --xh-demo-block-block-size: 24px; --xh-demo-block-radius: var(--xh-shape-pill)"></span><span data-demo-block data-tone="danger" style="--xh-demo-block-inline-size: 68px; --xh-demo-block-block-size: 24px; --xh-demo-block-radius: var(--xh-shape-pill)"></span></div></xh-flex>
    <xh-flex inline gap="xs" aria-label="行内占位区块" style="display: contents"><div data-xh-part="root"><span data-demo-block data-tone="brand" style="--xh-demo-block-inline-size: 68px; --xh-demo-block-block-size: 24px; --xh-demo-block-radius: var(--xh-shape-pill)"></span><span data-demo-block data-tone="success" style="--xh-demo-block-inline-size: 60px; --xh-demo-block-block-size: 24px; --xh-demo-block-radius: var(--xh-shape-pill)"></span></div></xh-flex>
  </div>
</xh-flex>
```

### 分隔符

在相邻内容之间添加分隔符

```vue
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const ruleStyle
  = "display: block; inline-size: 1px; block-size: 1em; background: var(--xh-border-default)";

const actions = ["编辑", "复制", "归档", "删除"];
const tones = ["brand", "info", "success", "danger"] as const;
</script>

<template>
  <XhFlex gap="sm">
    <template #split>
      <span :style="ruleStyle" />
    </template>
    <span
      v-for="(action, index) in actions"
      :key="action"
      data-demo-block="line"
      :data-tone="tones[index]"
      :aria-label="action"
      style="--xh-demo-block-inline-size: 48px"
    />
  </XhFlex>
</template>
```

```html
<style>
  #flex-split [data-rule] {
    display: block;
    inline-size: 1px;
    block-size: 1em;
    background: var(--xh-border-default);
  }
</style>

<xh-flex id="flex-split" gap="sm" style="display: contents">
  <div data-xh-part="root">
    <span data-demo-block="line" data-tone="brand" aria-label="编辑" style="--xh-demo-block-inline-size: 48px"></span>
    <span data-xh-part="split"><span data-rule></span></span>
    <span data-demo-block="line" data-tone="info" aria-label="复制" style="--xh-demo-block-inline-size: 48px"></span>
    <span data-xh-part="split"><span data-rule></span></span>
    <span data-demo-block="line" data-tone="success" aria-label="归档" style="--xh-demo-block-inline-size: 48px"></span>
    <span data-xh-part="split"><span data-rule></span></span>
    <span data-demo-block="line" data-tone="danger" aria-label="删除" style="--xh-demo-block-inline-size: 48px"></span>
  </div>
</xh-flex>
```

## 设计指引

### 何时使用

- 排列按钮、图标、标签或表单项。
- 控制内容的对齐、分布、间距和换行。
- 在相邻内容之间插入统一的分隔符。

### 何时不用

- 二维布局或跨列内容使用[栅格](./grid)。
- 分隔页面区域使用[分隔线](./separator)。
- 仅需一个固定间距时可直接使用 CSS。

### 特性

- 支持水平、垂直和行内布局。
- 支持五档间距、对齐和主轴分布。
- 支持换行和自动分隔符。

### 组合

- 可与[分隔线](./separator)组合为操作列表。

### 最佳实践

- 优先使用间距档位保持页面节奏一致。
- 可换行内容使用 `gap`，不要用子项外边距拼接。
- 动态移除可聚焦内容时，由业务层处理焦点交接。

### 反模式

- 不要用多层 Flex 模拟二维网格。
- 不要用负外边距修正对齐。
- 不要在分隔符中放置有意义的内容。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-flex>` |
| Vue 组件 | `XhFlex` `XhFlexSplit` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/flex.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `FlexAlign` |  | 交叉轴对齐：start / center / end / stretch / baseline，未提供时横向按中线对齐、纵向拉伸。 |
| `gap` | `FlexGap` |  | 子项间距档位：xs / sm / md / lg / xl，未提供时不留间距。档位对应的数值由皮肤决定。 |
| `inline` | `boolean` |  | 容器按行内盒排版，宽度收缩到内容。 |
| `justify` | `FlexJustify` |  | 主轴分布：start / center / end / between / around / evenly，未提供时子项从主轴起点排列。 |
| `orientation` | `Orientation` |  | 主轴方向：horizontal 横向、vertical 纵向，默认 horizontal。 |
| `wrap` | `boolean` |  | 一行放不下时换行。 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFlex` | `default` | — | 子项，按写入的顺序排列。 |
| `XhFlex` | `split` | — | 分隔符的内容：写了它，组件在每两个子项之间各铺设一个分隔符部件，逐缝隙重新求值一次。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getSplitProps` | `() => T['element']` | 分隔符节点。它是装饰件，恒带 aria-hidden：一排中夹杂的竖线被逐条朗读只会打断内容。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `split` | `aria-hidden` | 'true' |

- 分隔符自动隐藏于辅助技术。
- 容器不预设语义角色。

## 样式参考

### 皮肤

`@xihan-ui/styles/flex.css` 使用 `[data-scope="flex"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-gap` | props.gap |
| `root` | `data-inline` | ''（条件成立时才出现） |
| `root` | `data-justify` | props.justify |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-wrap` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-flex-gap` | `root` | `gap` | `default`<br>`gap=lg`<br>`gap=md`<br>`gap=sm`<br>`gap=xl`<br>`gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs`<br>`--xh-space-0` | flex 的 root 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

- 使用逻辑方向属性，自动适配 RTL。
