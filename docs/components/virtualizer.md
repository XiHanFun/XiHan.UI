# 虚拟滚动 <Badge type="info" text="virtualizer" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

一万条只渲可视区那几条，root 要有确定高度，条目的主轴尺寸由作者按 estimateSize 自己写

<XhDemo src="virtualizer/01-basic" />

### 动态高度

条目开了 measure 就把真实尺寸回喂给内核，estimateSize 只是首帧的起点，滚过一遍就收敛

<XhDemo src="virtualizer/02-dynamic" />

### 滚到指定条目

scrollToIndex 按 align 落位：start 贴上沿、center 居中、end 贴下沿，越界下标由内核夹住

<XhDemo src="virtualizer/03-scroll-to" />

### 横向列表

horizontal 把主轴换成行内轴：位移改写进行首侧，条目宽度由作者写，gap 由内核直接算进位移

<XhDemo src="virtualizer/04-horizontal" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-virtualizer>` |
| Vue 组件 | `XhVirtualizerContent` `XhVirtualizerItem` `XhVirtualizerRoot` `XhVirtualizerViewport` |
| 组合式函数 | `useVirtualizer` |
| 状态机 | `virtualizerMachine` |
| 皮肤 | `@xihan-ui/styles/virtualizer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="virtualizer"`：**`root`** · **`viewport`** · **`content`** · `item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 总条数，默认 0。 |
| `estimateSize` | `number \| ((index: number) => number)` |  | 每条的估算主轴尺寸（px）。等高列表可以直接给一个数字。 不给按 0 算：所有条目都会落进窗口，先渲出来再靠 measureElement 回喂真实尺寸。 |
| `overscan` | `number` |  | 可视区前后各多渲几条，默认 5。 |
| `horizontal` | `boolean` |  | 横向列表（主轴是行内轴），默认 false。 |
| `gap` | `number` |  | 相邻两条之间的主轴间距（px），默认 0。位移由内核直接算进去，不靠外边距。 |
| `getItemKey` | `(index: number) => string \| number` |  | 条目身份。默认即下标；列表会增删时给稳定 key，测量缓存才跟得住条目。 |
| `onChange` | `(details: VirtualizerChangeDetails) => void` |  | 该渲什么变了。只在快照真的变了时回调，滚动但可见区间没变不会触发。 |
| `scrollMargin` | `number` |  | 列表起点距滚动容器起点的距离（px），默认 0。 列表上方还有别的内容（页头、筛选栏）时给它，否则区间会整体偏掉那一截。 |
| `paddingStart` | `number` |  | 列表前后的内边距（px），默认 0。计进总长，第一条从 paddingStart 处起算。 |
| `paddingEnd` | `number` |  |  |
| `lanes` | `number` |  | 多列网格的列数，默认 1（单列）。条目按下标轮流落到各道上。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `change` | `VirtualizerChangeDetails` | 该渲什么变了；detail 为 `{ virtualItems, totalSize, startIndex, endIndex }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhVirtualizerRoot` | `default` | `VirtualizerRootSlotProps` |  |

## 状态机

内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `scrolling`

**事件**：`SCROLL.START` · `SCROLL.END` · `MEASURE`

## connect API

`useVirtualizer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `virtualItems` | `readonly VirtualizerItemState[]` | 此刻该渲染哪些下标，以及它们的位移与尺寸。 |
| `totalSize` | `number` | 整份列表的主轴总长（px）。 |
| `startIndex` | `number \| null` | 可视区首条下标（不含过扫描）；一条都排不下时为 null。 |
| `endIndex` | `number \| null` | 可视区末条下标（不含过扫描）；一条都排不下时为 null。 |
| `horizontal` | `boolean` |  |
| `lanes` | `number` |  |
| `scrolling` | `boolean` | 手正在滚。 |
| `scrollToIndex` | `(index: number, options?: VirtualizerScrollToOptions) => void` | 滚到第几条。越界下标由内核夹住。 |
| `measureElement` | `(element: HTMLElement \| null) => void` | 把条目节点的真实尺寸回喂给内核（动态高度用）。传 null 无副作用。 |
| `measure` | `() => void` | 丢掉全部实测尺寸重新按估算值排。视口换了一种排版时用得上。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: VirtualizerItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
