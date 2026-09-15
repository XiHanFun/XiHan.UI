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

<XhDemo src="gradient-text/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="gradient-text"`：**`root`**

## 示例

### 自定义颜色

设置渐变两端颜色

<XhDemo src="gradient-text/02-colors" />

### 方向

设置渐变方向

<XhDemo src="gradient-text/03-direction" />

### 行内强调

只为关键词添加渐变

<XhDemo src="gradient-text/04-partial" />

### 颜色

使用预设语义颜色

<XhDemo src="gradient-text/05-tone" />

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

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-gradient-text-from` | `root` | `background-image` | `default` | `--xh-_gradient-text-from` | gradient-text 的 root 部件 background-image 覆盖槽。 |
| `--xh-gradient-text-to` | `root` | `background-image` | `default` | `--xh-_gradient-text-to` | gradient-text 的 root 部件 background-image 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
