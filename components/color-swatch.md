来源：https://ui.docs.xihanfun.com/components/color-swatch

# ColorSwatch 颜色色块 `alpha`

把一个颜色画成一小块给人看：主题色一览、图例里的一格、当前选中的颜色。
它只负责「这是什么颜色」，不接点击、不改值——要挑颜色请用[颜色选择器](./color-picker)。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-swatch" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-swatch.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-swatch" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-swatch" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-swatch.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

把颜色串画成一小块：颜色旁边写出串本身，看得见也读得出

```vue
<script setup lang="ts">
import { XhColorSwatch } from "@xihan-ui/vue";

const colors = ["#e11d48", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
    <span v-for="color in colors" :key="color" style="display: inline-flex; align-items: center; gap: 6px">
      <XhColorSwatch :value="color" />
      <code style="font-size: 12px">{{ color }}</code>
    </span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-color-swatch value="#e11d48"><span data-xh-part="root"></span></xh-color-swatch>
    <code style="font-size: 12px">#e11d48</code>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-color-swatch value="#f59e0b"><span data-xh-part="root"></span></xh-color-swatch>
    <code style="font-size: 12px">#f59e0b</code>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-color-swatch value="#10b981"><span data-xh-part="root"></span></xh-color-swatch>
    <code style="font-size: 12px">#10b981</code>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-color-swatch value="#3b82f6"><span data-xh-part="root"></span></xh-color-swatch>
    <code style="font-size: 12px">#3b82f6</code>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-color-swatch value="#8b5cf6"><span data-xh-part="root"></span></xh-color-swatch>
    <code style="font-size: 12px">#8b5cf6</code>
  </span>
</div>
```

## 组件结构

加粗的是必需部件。

`data-scope="color-swatch"`：**`root`**

## 示例

### 尺寸

sm / md / lg 三档换的是边长与棋盘格粒度，圆角恒是内嵌档

```vue
<script setup lang="ts">
import { XhColorSwatch } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
    <XhColorSwatch value="#3b82f6" size="sm" label="小" />
    <XhColorSwatch value="#3b82f6" label="中" />
    <XhColorSwatch value="#3b82f6" size="lg" label="大" />
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
  <xh-color-swatch value="#3b82f6" size="sm" label="小"><span data-xh-part="root"></span></xh-color-swatch>
  <xh-color-swatch value="#3b82f6" label="中"><span data-xh-part="root"></span></xh-color-swatch>
  <xh-color-swatch value="#3b82f6" size="lg" label="大"><span data-xh-part="root"></span></xh-color-swatch>
</div>
```

### 透明度

半透明颜色铺在棋盘格上，看得出这是带透明度的颜色；三种写法解析成同一个颜色

```vue
<script setup lang="ts">
import { XhColorSwatch } from "@xihan-ui/vue";

// 同一个颜色的三种写法，与四档透明度
const values = ["#e11d48", "#e11d48bf", "rgba(225, 29, 72, 0.5)", "hsla(347, 77%, 50%, 0.25)"];
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
    <span v-for="value in values" :key="value" style="display: inline-flex; align-items: center; gap: 6px">
      <XhColorSwatch :value="value" size="lg" />
      <code style="font-size: 12px">{{ value }}</code>
    </span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-color-swatch value="#e11d48" size="lg"><span data-xh-part="root"></span></xh-color-swatch>
    <code style="font-size: 12px">#e11d48</code>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-color-swatch value="#e11d48bf" size="lg"><span data-xh-part="root"></span></xh-color-swatch>
    <code style="font-size: 12px">#e11d48bf</code>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-color-swatch value="rgba(225, 29, 72, 0.5)" size="lg"><span data-xh-part="root"></span></xh-color-swatch>
    <code style="font-size: 12px">rgba(225, 29, 72, 0.5)</code>
  </span>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <xh-color-swatch value="hsla(347, 77%, 50%, 0.25)" size="lg"><span data-xh-part="root"></span></xh-color-swatch>
    <code style="font-size: 12px">hsla(347, 77%, 50%, 0.25)</code>
  </span>
</div>
```

### 图例与无效值

label 给读屏一个有含义的名字；解析不出的串只剩棋盘格并标成无效

```vue
<script setup lang="ts">
import { XhColorSwatch } from "@xihan-ui/vue";

const legend = [
  { label: "已完成", value: "#10b981" },
  { label: "进行中", value: "#3b82f6" },
  { label: "已逾期", value: "#e11d48" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <ul style="display: flex; gap: 16px; margin: 0; padding: 0; list-style: none">
      <li v-for="item in legend" :key="item.value" style="display: inline-flex; align-items: center; gap: 6px">
        <!-- 读屏念「已完成」，不念 #10b981 -->
        <XhColorSwatch :value="item.value" :label="item.label" size="sm" />
        <span style="font-size: 13px">{{ item.label }}</span>
      </li>
    </ul>
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <!-- 颜色关键字不在支持的写法里：只画棋盘格，描边换成危险色，名字仍念作者写的串 -->
      <XhColorSwatch value="tomato" />
      <span style="font-size: 13px">tomato（无效：不认颜色关键字）</span>
    </span>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 8px">
  <ul style="display: flex; gap: 16px; margin: 0; padding: 0; list-style: none">
    <li style="display: inline-flex; align-items: center; gap: 6px">
      <!-- 读屏念「已完成」，不念 #10b981 -->
      <xh-color-swatch value="#10b981" label="已完成" size="sm"><span data-xh-part="root"></span></xh-color-swatch>
      <span style="font-size: 13px">已完成</span>
    </li>
    <li style="display: inline-flex; align-items: center; gap: 6px">
      <xh-color-swatch value="#3b82f6" label="进行中" size="sm"><span data-xh-part="root"></span></xh-color-swatch>
      <span style="font-size: 13px">进行中</span>
    </li>
    <li style="display: inline-flex; align-items: center; gap: 6px">
      <xh-color-swatch value="#e11d48" label="已逾期" size="sm"><span data-xh-part="root"></span></xh-color-swatch>
      <span style="font-size: 13px">已逾期</span>
    </li>
  </ul>
  <span style="display: inline-flex; align-items: center; gap: 6px">
    <!-- 颜色关键字不在支持的写法里：只画棋盘格，描边换成危险色，名字仍念作者写的串 -->
    <xh-color-swatch value="tomato"><span data-xh-part="root"></span></xh-color-swatch>
    <span style="font-size: 13px">tomato（无效：不认颜色关键字）</span>
  </span>
</div>
```

## 设计指引

### 何时使用

- 在文字旁边直观地标出一个颜色：图例、标签、主题预览。
- 与颜色串并排展示，让人既看得见又读得出。
- 作为别的控件里「当前颜色」的那一小块（取色器触发钮里用的就是它这一族）。

### 何时不用

- 用户要在若干固定颜色里挑一个：用[颜色色块选择器](./color-swatch-picker)，它每格的色块面用的就是这一族。
- 用户要自由调色：用[颜色选择器](./color-picker)，它的触发钮里的当前色块用的也是这一族。
- 只是想给一段文字加底色或强调：那是排版的事，不是颜色色块。

### 特性

- 认 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`；解析不出时只画棋盘格底并带 `data-invalid`，不静默画成黑。
- 半透明颜色铺在棋盘格上，看得出这是带透明度的颜色，而不是与页面底色混成另一种颜色。
- 尺寸 sm / md / lg 三档：换的是边长与棋盘格粒度，圆角恒是内嵌档。
- 读屏按 `label` 念，其次念颜色串；两者都没有时整块视为装饰。
- 高对比模式下退出强制着色保住原色，描边换成系统前景色把它框出来；打印时保留底色。

### 组合

- 与[标签](./tag)、[列表](./list)条目并排做图例；与[颜色选择器](./color-picker)搭配时它的触发钮自带同一族的色块，不必再放一枚。

### 最佳实践

- 颜色有含义时给 `label`（「品牌红」「已完成」），光念 `#e11d48` 听不出它代表什么。
- 色块旁边写出颜色串或名字，颜色不能是唯一的信息通道。

### 反模式

- 拿它当按钮：色块不接交互，点它不会发生任何事。
- 传颜色关键字（`red`、`transparent`）：它们不在支持的写法里，会被判成无效。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-swatch>` |
| Vue 组件 | `XhColorSwatch` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/color-swatch.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `label` | `string` |  | 读屏怎么念这块颜色，例如「品牌红」。 不给就念颜色串本身；串也没有时整块视为装饰，不进可访问树。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，换的是色块的边长与棋盘格粒度。 |
| `value` | `string` |  | 要展示的颜色串。认 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`， 不认颜色关键字。解析不出时色块只剩棋盘格底，并带 `data-invalid`。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | 原样透出的颜色串（未解析时也是它，好让 data-value 与作者写的一致）。 |
| `valid` | `boolean` | 颜色串解析成功。失败时 rgba 是兜底黑、色块只画棋盘格。 |
| `rgba` | `ColorRgba` |  |
| `css` | `string` | 画进色块的 CSS 颜色（rgba() 写法，带透明度）；解析失败时为空串。 |
| `getRootProps` | `() => T['element']` | 色块本体：role=img，名字取 label，其次取颜色串。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-hidden` | undefined \| 'true' |
| `root` | `aria-label` | props.label |
| `root` | `role` | 'img' \| undefined |

## 样式参考

### 皮肤

`@xihan-ui/styles/color-swatch.css` 使用 `[data-scope="color-swatch"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-value` | value \|\| undefined |
| `root` | `data-xh-swatch` | '' |
| `root` | `data-xh-swatch-size` | props.size |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-color-swatch-border` | `root` | `--xh-swatch-border` | `default` | `--xh-border-default` | color-swatch 的 root 部件 --xh-swatch-border 覆盖槽。 |
| `--xh-color-swatch-border-invalid` | `root` | `--xh-swatch-border` | `invalid` | `--xh-border-invalid` | color-swatch 的 root 部件 --xh-swatch-border 覆盖槽。 |
| `--xh-color-swatch-radius` | `root` | `--xh-swatch-radius` | `default` | `--xh-shape-inset` | color-swatch 的 root 部件 --xh-swatch-radius 覆盖槽。 |
| `--xh-color-swatch-size` | `root` | `--xh-swatch-size` | `default` | `--xh-_swatch-size` | color-swatch 的 root 部件 --xh-swatch-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
