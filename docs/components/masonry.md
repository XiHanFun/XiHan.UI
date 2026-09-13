# Masonry 瀑布流 <Badge type="info" text="alpha" />

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

<XhDemo src="masonry/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="masonry"`：**`root`** · **`column`** · `item`

## 示例

### 响应式列

根据容器宽度调整列数

<XhDemo src="masonry/02-columns" />

### 间距

设置列与项目之间的间距

<XhDemo src="masonry/03-gap" />

### 顺序排列

按文档顺序逐列填充

<XhDemo src="masonry/04-sequential" />

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
