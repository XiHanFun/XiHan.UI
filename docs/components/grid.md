# 栅格 <Badge type="info" text="grid" />

二维排布容器：`cols` 定分几列，每一格按文档序依次落格。

## 何时使用

- 表单字段、卡片墙、统计面板这类需要列对齐的结构。
- 列数要随视口换档。

## 何时不用

- 只沿一条轴排：用[弹性布局](./flex)。
- 每一格的高度由内容决定且不要求行对齐（瀑布流）：栅格做不了，需要另外的实现。

## 特性

- 各列等宽，且每列的下限是 0：长内容不会把自己那列撑宽。
- `cols` 除了整数也收断点对象，逐档写各自的列数，没写的档沿用比它窄的那一档。
- `rows` 排出显式行轨道；不写则行数由内容自己撑出来。
- `minColWidth` 换一条路排列：给一档列宽下限，容器放得下几列就分几列，`cols` 那条轨道表让位。
  卡片墙用它比逐档写 `cols` 省事。
- `gap` 管两条轴，`rowGap` 与 `columnGap` 各自只管一条，不写则跟着 `gap` 走。
- `span` 让一格横跨几列，`offset` 把它前面几列空出来；两者与 `cols` 一样收断点对象，
  窄屏收成一列时把 `span` 也收回 1，那一格才不会溢出。
- 四档断点取自令牌：`sm` 640px、`md` 768px、`lg` 1024px、`xl` 1280px。
- `cols` / `rows` / `span`（含断点对象的每一档）收 1 至 12 的整数，`offset` 收 1 至 11 的整数；
  范围外的值——0、负数、小数、超过上限——一律按没写算：`cols` 落回一列、`span` 占一列、`offset` 不错列。
- DOM 上只出得来皮肤有规则接的取值：`data-cols` 恒在 1 至 12 之间，`data-span` 与 `data-offset`
  要么落在范围内、要么不出现。

## 示例

### 基础用法

二维排布容器：cols 定分几列，gap 走间距档位，每一格按文档序依次落格

<XhDemo src="grid/01-basic" />

### 列数

cols 收 1 到 12 的整数；各列等宽，放不下的格子自动换到下一行

<XhDemo src="grid/02-cols" />

### 间距档位

gap 收的是档位名不是像素：xs / sm / md / lg / xl 逐档指向一个间距令牌，行距与列距同吃这一份

<XhDemo src="grid/03-gap" />

### 跨列与错列

span 让一格横跨几列；offset 让一格改从第 offset + 1 条列线起排，把它前面那几列空出来

<XhDemo src="grid/04-span-offset" />

### 格内对齐

align 管每一项在自己那格里的块向落点，justify-items 管行内落点；两轴缺省都是铺满整格

<XhDemo src="grid/05-align-justify" />

### 响应式列数

cols 除了整数也收断点对象，逐档写各自的列数：窄视口一列，越宽排得越密，拖动窗口即可看到换档

<XhDemo src="grid/06-responsive-cols" />

### 断点档位一览

四档断点取自令牌：sm 640px、md 768px、lg 1024px、xl 1280px；自窄到宽依次接管，视口到哪一档就用哪一档的列数

<XhDemo src="grid/07-breakpoints" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-grid>` |
| Vue 组件 | `XhGridItem` `XhGridRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/grid.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="grid"`：**`root`** · `item`

## Props

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

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props?: GridItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/grid.css` 按部件选择：`[data-scope="grid"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-grid-column-gap` | `root` | `column-gap` | `column-gap=lg`<br>`column-gap=md`<br>`column-gap=sm`<br>`column-gap=xl`<br>`column-gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs` | grid 的 root 部件 column-gap 覆盖槽。 |
| `--xh-grid-columns` | `root` | `grid-template-columns` | `default`<br>`min-col` | `--xh-_grid-col-min`<br>`--xh-_grid-cols` | grid 的 root 部件 grid-template-columns 覆盖槽。 |
| `--xh-grid-gap` | `root` | `gap` | `default`<br>`gap=lg`<br>`gap=md`<br>`gap=sm`<br>`gap=xl`<br>`gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs`<br>`--xh-space-0` | grid 的 root 部件 gap 覆盖槽。 |
| `--xh-grid-row-gap` | `root` | `row-gap` | `row-gap=lg`<br>`row-gap=md`<br>`row-gap=sm`<br>`row-gap=xl`<br>`row-gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs` | grid 的 root 部件 row-gap 覆盖槽。 |
| `--xh-grid-rows` | `root` | `grid-template-rows` | `rows` | `--xh-_grid-rows` | grid 的 root 部件 grid-template-rows 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 1280px` · `min-width: 640px` · `min-width: 768px`。

## 组合

- 表单里与[表单字段](./field)配合：字段占格，跨整行的字段写 `span`。

## 最佳实践

- 断点对象自窄到宽写，别只写 `lg`——比它窄的档会退回默认的一列。
- 需要多于 12 列的结构就拆成两块，别把列数往大了写——超过 12 的值按一列排。

## 反模式

- 用栅格做整页骨架：那是[布局](./layout)的事。
- 给格子写固定像素宽度，等宽约束当场失效。
