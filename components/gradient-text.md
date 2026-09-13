来源：https://ui.docs.xihanfun.com/components/gradient-text

# GradientText 渐变文字

用于为短文本添加渐变色强调。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/gradient-text" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/gradient-text.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/gradient-text" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/gradient-text" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/gradient-text.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

使用默认品牌渐变

```vue
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";
</script>

<template>
  <p style="font-size: 32px; font-weight: 700">
    <XhGradientText>曦寒前端组件库</XhGradientText>
  </p>
</template>
```

```html
<p style="font-size: 32px; font-weight: 700">
  <xh-gradient-text>
    <span data-xh-part="root">曦寒前端组件库</span>
  </xh-gradient-text>
</p>
```

## 组件结构

加粗的是必需部件。

`data-scope="gradient-text"`：**`root`**

## 示例

### 自定义颜色

设置渐变两端颜色

```vue
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";

const gradients = [
  { label: "日落橙", from: "#f97316", to: "#ec4899" },
  { label: "极光紫", from: "#8b5cf6", to: "#06b6d4" },
  { label: "海洋蓝", from: "#0ea5e9", to: "#2563eb" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; font-size: 28px; font-weight: 700">
    <XhGradientText v-for="gradient in gradients" :key="gradient.label" :from="gradient.from" :to="gradient.to">
      {{ gradient.label }}
    </XhGradientText>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; font-size: 28px; font-weight: 700">
  <xh-gradient-text from="#f97316" to="#ec4899"><span data-xh-part="root">日落橙</span></xh-gradient-text>
  <xh-gradient-text from="#8b5cf6" to="#06b6d4"><span data-xh-part="root">极光紫</span></xh-gradient-text>
  <xh-gradient-text from="#0ea5e9" to="#2563eb"><span data-xh-part="root">海洋蓝</span></xh-gradient-text>
</div>
```

### 方向

设置渐变方向

```vue
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";

const directions = [
  { label: "向右", value: "to-right" },
  { label: "向下", value: "to-bottom" },
  { label: "右下", value: "to-bottom-right" },
  { label: "右上", value: "to-top-right" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 24px; font-weight: 700">
    <XhGradientText v-for="direction in directions" :key="direction.value" :direction="direction.value" from="#f97316" to="#2563eb">
      {{ direction.label }}
    </XhGradientText>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 24px; font-weight: 700">
  <xh-gradient-text direction="to-right" from="#f97316" to="#2563eb"><span data-xh-part="root">向右</span></xh-gradient-text>
  <xh-gradient-text direction="to-bottom" from="#f97316" to="#2563eb"><span data-xh-part="root">向下</span></xh-gradient-text>
  <xh-gradient-text direction="to-bottom-right" from="#f97316" to="#2563eb"><span data-xh-part="root">右下</span></xh-gradient-text>
  <xh-gradient-text direction="to-top-right" from="#f97316" to="#2563eb"><span data-xh-part="root">右上</span></xh-gradient-text>
</div>
```

### 行内强调

只为关键词添加渐变

```vue
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";
</script>

<template>
  <p style="font-size: 28px; font-weight: 700; line-height: 1.6">
    快速、轻量、高效、用心的
    <XhGradientText direction="to-bottom-right" from="#8b5cf6" to="#06b6d4">
      框架无关 Headless UI 组件库
    </XhGradientText>
  </p>
</template>
```

```html
<p style="font-size: 28px; font-weight: 700; line-height: 1.6">
  快速、轻量、高效、用心的
  <xh-gradient-text direction="to-bottom-right" from="#8b5cf6" to="#06b6d4">
    <span data-xh-part="root">框架无关 Headless UI 组件库</span>
  </xh-gradient-text>
</p>
```

### 颜色

使用预设语义颜色

```vue
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";

const tones = [
  { label: "品牌", value: "brand" },
  { label: "成功", value: "success" },
  { label: "警告", value: "warning" },
  { label: "危险", value: "danger" },
  { label: "信息", value: "info" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 24px; font-weight: 700">
    <XhGradientText v-for="tone in tones" :key="tone.value" :tone="tone.value">{{ tone.label }}</XhGradientText>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 24px; font-weight: 700">
  <xh-gradient-text tone="brand"><span data-xh-part="root">品牌</span></xh-gradient-text>
  <xh-gradient-text tone="success"><span data-xh-part="root">成功</span></xh-gradient-text>
  <xh-gradient-text tone="warning"><span data-xh-part="root">警告</span></xh-gradient-text>
  <xh-gradient-text tone="danger"><span data-xh-part="root">危险</span></xh-gradient-text>
  <xh-gradient-text tone="info"><span data-xh-part="root">信息</span></xh-gradient-text>
</div>
```

## 设计指引

### 何时使用

- 标题、品牌名称或营销短句。
- 需要突出显示的关键词。

### 何时不用

- 正文、表单标签和长篇内容。
- 对比度要求严格的关键信息。

### 特性

- 继承外部字号与字重，可用于行内文本。
- `from` 与 `to` 设置渐变两端颜色。
- `direction` 提供八个方向。
- `tone` 使用预设颜色；显式颜色优先。
- 高对比、强制色和打印环境自动使用实体前景色。

### 组合

- 嵌入[排印](./typography)标题中强调关键词。

### 最佳实践

- 使用明度接近的两端颜色。
- 每个视图只保留少量渐变强调。

### 反模式

- 不要用于正文或长段落。
- 不要使用几乎无法区分的两端颜色。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-gradient-text>` |
| Vue 组件 | `XhGradientText` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/gradient-text.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `direction` | `GradientTextDirection` |  | 渐变走向档位，缺省 to-right。 |
| `from` | `string` |  | 起点颜色，写成 CSS 变量交给皮肤；不给则用品牌色族。 |
| `to` | `string` |  | 终点颜色，写成 CSS 变量交给皮肤；不给则用品牌色族。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info；显式 from / to 优先。 |

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

`@xihan-ui/styles/gradient-text.css` 使用 `[data-scope="gradient-text"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-direction` | props.direction |
| `root` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-gradient-text-from` | `root` | `background-image` | `default` | `--xh-_gradient-text-from` | gradient-text 的 root 部件 background-image 覆盖槽。 |
| `--xh-gradient-text-to` | `root` | `background-image` | `default` | `--xh-_gradient-text-to` | gradient-text 的 root 部件 background-image 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
