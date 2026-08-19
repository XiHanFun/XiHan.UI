# 虚拟滚动 <Badge type="info" text="virtualizer" />

只渲染窗口内的条目，列表再长也只画那几十个。

## 何时使用

- 条目上千甚至上万。
- 首屏卡顿的根源是 DOM 节点太多。

## 何时不用

- 条目只有几十上百条：虚拟化带来的复杂度不值得。
- 需要浏览器的页内查找命中所有条目：没渲染的条目搜不到。

## 特性

- 支持动态高度（量出来而不是猜）、横向列表与多列。
- `overscan` 决定窗口外多渲几个，滚动时不露白。
- 可以滚到指定条目。

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

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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

## 样式

默认皮肤 `@xihan-ui/styles/virtualizer.css` 按部件选择：`[data-scope="virtualizer"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | 'horizontal' \| 'vertical' |
| `root` | `data-scrolling` | ''（条件成立时才出现） |
| `viewport` | `data-orientation` | 'horizontal' \| 'vertical' |
| `content` | `data-orientation` | 'horizontal' \| 'vertical' |
| `item` | `data-index` | props.index |
| `item` | `data-lane` | item.lane \| undefined |
| `item` | `data-orientation` | 'horizontal' \| 'vertical' |

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[列表](./list)、[表格](./table)、[选择器](./select)的长选项列表、[穿梭框](./transfer)配合。

## 最佳实践

- 条目高度差异大时用动态高度模式，别用估值硬撑。
- 提供"滚到某条"的入口，否则用户永远找不回刚才看的位置。

## 反模式

- 在虚拟列表里放高度会突变的内容（图片没预留宽高比），滚动时位置乱跳。
- 依赖 Ctrl + F 查找。
