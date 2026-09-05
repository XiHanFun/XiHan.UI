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
- `span` 让一格横跨几列，`offset` 把它前面几列空出来。
- 四档断点取自令牌：`sm` 640px、`md` 768px、`lg` 1024px、`xl` 1280px。
- `cols`（含断点对象的每一档）与 `span` 收 1 至 12 的整数，`offset` 收 1 至 11 的整数；
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
| `gap` | `GridGap` |  | 行列间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 |
| `justifyItems` | `GridJustifyItems` |  | 每一项在自己那格里的行内对齐：start / center / end / stretch，不写则铺满格宽。 |

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
| `root` | `data-gap` | props.gap |
| `root` | `data-justify-items` | props.justifyItems |
| `item` | `data-offset` | tier(item.offset, MAX_COLUMN_OFFSET) |
| `item` | `data-span` | tier(item.span, MAX_COLUMN_COUNT) |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-grid-columns` · `--xh-grid-gap`

## 响应式

皮肤内置条件规则：`min-width: 1024px` · `min-width: 1280px` · `min-width: 640px` · `min-width: 768px`。

## 组合

- 表单里与[表单字段](./field)配合：字段占格，跨整行的字段写 `span`。

## 最佳实践

- 断点对象自窄到宽写，别只写 `lg`——比它窄的档会退回默认的一列。
- 需要多于 12 列的结构就拆成两块，别把列数往大了写——超过 12 的值按一列排。

## 反模式

- 用栅格做整页骨架：那是[布局](./layout)的事。
- 给格子写固定像素宽度，等宽约束当场失效。
