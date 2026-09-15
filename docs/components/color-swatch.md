# ColorSwatch 颜色色块 <Badge type="info" text="alpha" />

把一个颜色绘制为一小块用于展示：主题色一览、图例中的一格、当前选中的颜色。它只负责表达“这是什么颜色”，不接受点击、不修改值；需要挑选颜色时使用[颜色选择器](./color-picker)。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-swatch" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-swatch.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-swatch" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-swatch" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-swatch.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

把颜色串绘制为一小块：颜色旁边写出串本身，可见也可读

<XhDemo src="color-swatch/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="color-swatch"`：**`root`**

## 示例

### 尺寸

sm / md / lg 三档改变边长与棋盘格粒度，圆角恒为内嵌档

<XhDemo src="color-swatch/02-sizes" />

### 透明度

半透明颜色铺在棋盘格上，可以看出这是带透明度的颜色；三种写法解析为同一个颜色

<XhDemo src="color-swatch/03-alpha" />

### 图例与无效值

label 为读屏提供有含义的名字；无法解析的串只剩棋盘格并标为无效

<XhDemo src="color-swatch/04-legend" />

## 设计指引

### 何时使用

- 在文字旁直观标出一个颜色：图例、标签、主题预览。
- 与颜色串并排展示，让用户既能看到也能读出。
- 作为其他控件中表示当前颜色的小块（颜色选择器的触发按钮使用的就是这一族）。

### 何时不用

- 用户需要在若干固定颜色中选一个时，使用[颜色色块选择器](./color-swatch-picker)，它每格的色块面使用的就是这一族。
- 用户需要自由调色时，使用[颜色选择器](./color-picker)。
- 只是给一段文字加底色或强调时，属于排版范畴，不使用颜色色块。

### 特性

- 支持 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`；无法解析时只绘制棋盘格底并带 `data-invalid`，不静默绘制为黑色。
- 半透明颜色铺在棋盘格上，能看出这是带透明度的颜色，而不是与页面底色混合成另一种颜色。
- 尺寸 sm / md / lg 三档改变边长与棋盘格粒度，圆角固定为内嵌档。
- 读屏按 `label` 读出，其次读颜色串；两者都没有时整块视为装饰。
- 高对比模式下退出强制着色以保留原色，描边换成系统前景色勾出轮廓；打印时保留底色。

### 组合

- 与[标签](./tag)、[列表](./list)条目并排作为图例；与[颜色选择器](./color-picker)搭配时，选择器的触发按钮自带同族色块，不需要再放一个。

### 最佳实践

- 颜色有含义时提供 `label`（“品牌红”“已完成”），只读出 `#e11d48` 无法表达含义。
- 色块旁写出颜色串或名称，颜色不能是唯一的信息通道。

### 反模式

- 将它当作按钮：色块不接受交互。
- 传颜色关键字（`red`、`transparent`）：不在支持的写法内，会被判定为无效。

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
| `label` | `string` |  | 读屏朗读该颜色的方式，例如「品牌红」。 未提供时朗读颜色串本身；串也没有时整块视为装饰，不进入可访问树。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，影响色块的边长与棋盘格粒度。 |
| `value` | `string` |  | 要展示的颜色串。识别 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`， 不识别颜色关键字。无法解析时色块只保留棋盘格底，并带 `data-invalid`。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | 原样透出的颜色串（未解析时也是它，使 data-value 与作者书写的一致）。 |
| `valid` | `boolean` | 颜色串解析成功。失败时 rgba 为兜底黑、色块只绘制棋盘格。 |
| `rgba` | `ColorRgba` |  |
| `css` | `string` | 绘制进色块的 CSS 颜色（rgba() 写法，带透明度）；解析失败时为空串。 |
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

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-color-swatch-border` | `root` | `--xh-swatch-border` | `default` | `--xh-border-default` | color-swatch 的 root 部件 --xh-swatch-border 覆盖槽。 |
| `--xh-color-swatch-border-invalid` | `root` | `--xh-swatch-border` | `invalid` | `--xh-border-invalid` | color-swatch 的 root 部件 --xh-swatch-border 覆盖槽。 |
| `--xh-color-swatch-radius` | `root` | `--xh-swatch-radius` | `default` | `--xh-shape-inset` | color-swatch 的 root 部件 --xh-swatch-radius 覆盖槽。 |
| `--xh-color-swatch-size` | `root` | `--xh-swatch-size` | `default` | `--xh-_swatch-size` | color-swatch 的 root 部件 --xh-swatch-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
