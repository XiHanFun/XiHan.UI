# Flex 弹性布局

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

<XhDemo src="flex/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="flex"`：**`root`** · `split`

## 示例

### 方向

设置水平或垂直排列

<XhDemo src="flex/02-direction" />

### 对齐与分布

对齐内容并分配剩余空间

<XhDemo src="flex/03-align-justify" />

### 间距

使用预设间距

<XhDemo src="flex/04-gap" />

### 换行与行内

换行排列或随文字排布

<XhDemo src="flex/05-wrap-inline" />

### 分隔符

在相邻内容之间添加分隔符

<XhDemo src="flex/06-split" />

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
| `align` | `FlexAlign` |  | 交叉轴对齐：start / center / end / stretch / baseline，不写则横排按中线对齐、竖排拉伸。 |
| `gap` | `FlexGap` |  | 子项间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 |
| `inline` | `boolean` |  | 容器按行内盒排版，宽度收到内容。 |
| `justify` | `FlexJustify` |  | 主轴分布：start / center / end / between / around / evenly，不写则子项从主轴起点排起。 |
| `orientation` | `Orientation` |  | 主轴方向：horizontal 横排、vertical 竖排，缺省 horizontal。 |
| `wrap` | `boolean` |  | 一行放不下时折行。 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFlex` | `default` | — | 子项，按写进来的顺序排开。 |
| `XhFlex` | `split` | — | 分隔符的内容：写了它，组件在每两个子项之间各铺一个分隔符部件，逐缝重新求值一次。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getSplitProps` | `() => T['element']` | 分隔符节点。它是装饰件，恒带 aria-hidden：一排里夹着的竖线被逐条念出来只会打断内容。 |

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

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-flex-gap` | `root` | `gap` | `default`<br>`gap=lg`<br>`gap=md`<br>`gap=sm`<br>`gap=xl`<br>`gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs`<br>`--xh-space-0` | flex 的 root 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

- 使用逻辑方向属性，自动适配 RTL。
