# Grid 栅格

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

<XhDemo src="grid/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="grid"`：**`root`** · `item`

## 示例

### 自适应列

根据最小列宽自动排列

<XhDemo src="grid/02-adaptive" />

### 跨列与错列

控制内容占用的列

<XhDemo src="grid/03-span" />

### 间距

设置栅格间距

<XhDemo src="grid/04-gap" />

### 响应式列

在不同视口使用不同列数

<XhDemo src="grid/05-responsive" />

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
| `align` | `GridAlign` |  | 每一项在所在格中的块向对齐：start / center / end / stretch / baseline，未提供时铺满格高。 |
| `cols` | `GridCols` |  | 列数：1 至 12 的整数，未提供时按一列排列；范围外的值也按一列排列。 各列等宽，且每列的下限是 0，长内容不会把所在列撑宽。 也接受断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，未写的档沿用更窄的一档。 |
| `columnGap` | `GridGap` |  | 只改列间距，档位同 gap；未提供时跟随 gap。 |
| `gap` | `GridGap` |  | 行列间距档位：xs / sm / md / lg / xl，未提供时不留间距。档位对应的数值由皮肤决定。 |
| `justifyItems` | `GridJustifyItems` |  | 每一项在所在格中的行内对齐：start / center / end / stretch，未提供时铺满格宽。 |
| `minColWidth` | `GridMinColWidth` |  | 每列的最小宽度：xs / sm / md / lg 四档，各对应一个列宽下限令牌。提供后列数改由容器宽度 除以该下限得出（放得下几列即几列），`cols` 的轨道表不再生效。不接受裸像素值。 |
| `rowGap` | `GridGap` |  | 只改行间距，档位同 gap；未提供时跟随 gap。 |
| `rows` | `GridRowCount` |  | 行数：1 至 12 的整数，未提供时行数由内容撑出；范围外的值按未提供处理。 提供后把这几行排为显式轨道，超出的项落入隐式行。 |

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

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
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
