# Virtualizer 虚拟滚动

只渲染窗口内的条目，列表再长也只绘制可见的几十条。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/virtualizer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/virtualizer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/virtualizer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/virtualizer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/virtualizer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一万条只渲染可视区内的几条，root 要有确定高度，条目的主轴尺寸由作者按 estimateSize 自行编写

<XhDemo src="virtualizer/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="virtualizer"`：**`root`** · **`viewport`** · **`content`** · `item`

## 示例

### 动态高度

条目开启 measure 后把真实尺寸回传给内核，estimateSize 只是首帧的起点，滚动一遍后即收敛

<XhDemo src="virtualizer/02-dynamic" />

### 滚动到指定条目

scrollToIndex 按 align 落位：start 贴上沿、center 居中、end 贴下沿，越界下标由内核夹取

<XhDemo src="virtualizer/03-scroll-to" />

### 横向列表

horizontal 把主轴换为行内轴：位移改写进行首侧，条目宽度由作者编写，gap 由内核直接计入位移

<XhDemo src="virtualizer/04-horizontal" />

### 挂载自绘滚动条

滚动容器是视口，提供一个 id 交给滚动条即可；虚拟滚动只管理渲染哪几条，滚动条只负责绘制滚动位置

<XhDemo src="virtualizer/05-scrollbar" />

### 与无限滚动组成一条长列表

哨兵放置在内容层之后而不是条目之间：窗口外的条目根本没有渲染，放在其中的哨兵永远无法进入可视区

<XhDemo src="virtualizer/06-composed" />

### 随整页滚动

scrollContainer 设为 window：列表铺在页面里，不另开滚动框，列表上方的内容不必再算 scrollMargin

<XhDemo src="virtualizer/07-window" />

### 聊天流

anchor 设为 end：从最新一条看起，贴底时新消息继续贴底；往前翻出历史时，给了 getItemKey 视口不跳

<XhDemo src="virtualizer/08-chat" />

### 分组标题

stickyIndices 登记标题的下标：滚过它之后它钉在起点，下一组的标题滚上来时接替

<XhDemo src="virtualizer/09-sticky" />

## 设计指引

### 何时使用

- 条目上千甚至上万。
- 首屏卡顿的根源是 DOM 节点太多。

### 何时不用

- 条目只有几十上百条时，虚拟化带来的复杂度不值得。
- 需要浏览器的页内查找命中所有条目时，未渲染的条目无法被搜索。

### 特性

- 支持动态高度（测量而非估算）、横向列表与多列。
- `overscan` 决定窗口外多渲染的条数，滚动时不露白。
- 可以滚到指定条目。
- 滚动容器由 `scrollContainer` 决定：缺省 `viewport` 是视口自己滚；`window` 是列表铺在页面里、随整页滚动，视口不再是滚动框也不占 Tab 位，列表在页面里的起点由内核现量（每次滚动都重量，页头折叠、上方内容加载完都跟得上），不必再算 `scrollMargin`。
- 条目增删时视口不跳：缺省（`anchor` 为 `start`）把视口里第一条按身份放回原处，往前插入条目（向上翻出历史）时它仍停在原来的位置。身份来自 `getItemKey`，没给时身份就是下标，往前插入只保住下标、内容会整体后移。
- `anchor` 为 `end` 时从最新一条看起：滚到底后内容再长（追加条目、条目长高）也继续贴底；用户往上翻离开底部就不再拽回，翻回底部重新贴底。列表不足一屏时条目贴着底部排。适合聊天与日志。
- `stickyIndices` 登记要钉在视口起点的条目（分组标题）：滚过它之后它一直钉着，直到下一个登记过的条目接替；它的条目外壳带 `data-fixed`，按 `position: sticky` 留在文档流里，自带实底 `--xh-virtualizer-sticky-bg`。钉住的标题读屏照常读到，不另建一份。

### 组合

- `collectionVirtualizer` 是正式集合接线口：[树](./tree)、[列表框](./listbox)、[选择器](./select)、[组合框](./combobox)、[穿梭框](./transfer)与[表格](./table)把完整 collection 交给各自状态机，只用 `virtualItems` 裁剪 DOM。表格按可见数据行计数，每个虚拟条目装一行数据行。[日志](./log)接上它之后，粘底改跟 Virtualizer 的视口与内容层（`getViewportElement` / `getContentElement`）走。
- 集合接线时 `count` 必须等于当前语义序列长度；不一致会明确抛错，避免方向键与可见窗口指向两份数据。
- 集合自身已有焦点模型，把 `viewportTabIndex` 设为 `-1`，不要让虚拟视口额外占一个 Tab 位。
- 与[无限滚动](./infinite-scroll)组合为边滚边取的长列表：哨兵放在内容层之后，取数目标指向视口层。

### 最佳实践

- 条目高度差异大时使用动态高度模式，不依赖估值。
- 条目会增删的列表（消息、动态流）一律给 `getItemKey`：实测尺寸、视口钉住与节点复用都按它认条目。
- 提供滚动到指定条目的入口，否则用户无法找回之前的位置。
- Web Components 跨嵌套宿主组合时，语义条目根用 `data-xh-part-owner` 声明归属；Virtualizer 外壳仍归 `virtualizer`，两台宿主不会争写同一节点。

### 反模式

- 在虚拟列表内放高度会突变的内容（图片未预留宽高比），滚动时位置跳动。
- 依赖 Ctrl + F 查找。
- 把[无限滚动](./infinite-scroll)的哨兵放进条目之间：窗口外的条目不渲染，哨兵也不渲染，第二页无法获取。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-virtualizer>` |
| Vue 组件 | `XhVirtualizerContent` `XhVirtualizerItem` `XhVirtualizerRoot` `XhVirtualizerViewport` |
| 组合式函数 | `useVirtualizer` |
| 状态机 | `virtualizerMachine` |
| 皮肤 | `@xihan-ui/styles/virtualizer.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` |  | 总条数，默认 0。 |
| `estimateSize` | `number \| ((index: number) => number)` |  | 每条的估算主轴尺寸（px）。等高列表可以直接提供一个数字。 未提供时按 0 计算：所有条目都会落进窗口，先渲染出来再依靠 measureElement 回填真实尺寸。 |
| `overscan` | `number` |  | 可视区前后各多渲染的条数，默认 5。 |
| `horizontal` | `boolean` |  | 横向列表（主轴是行内轴），默认 false。 |
| `gap` | `number` |  | 相邻两条之间的主轴间距（px），默认 0。位移由内核直接计算，不依靠外边距。 |
| `getItemKey` | `(index: number) => string \| number` |  | 条目身份。默认即下标；列表会增删时提供稳定 key，测量缓存才能跟随条目。 |
| `onRangeChange` | `(details: VirtualizerRangeChangeDetails) => void` |  | 应渲染的区间变化。只在快照实际变化时回调，滚动但可见区间未变不会触发。 |
| `scrollMargin` | `number` |  | 列表起点距滚动容器起点的距离（px），默认 0。 列表上方还有其他内容（页头、筛选栏）时提供它，否则区间会整体偏移该段距离。 |
| `paddingStart` | `number` |  | 列表前后的内边距（px），默认 0。计入总长，第一条从 paddingStart 处起算。 |
| `paddingEnd` | `number` |  |  |
| `lanes` | `number` |  | 多列网格的列数，默认 1（单列）。条目按下标轮流落到各列上。 |
| `viewportTabIndex` | `number` |  | viewport 的 Tab 位；独立列表默认 0，组合进有自身焦点模型的集合时设为 -1。window 形态下视口不滚动，不占 Tab 位。 |
| `scrollContainer` | `VirtualizerScrollContainer` |  | 滚动容器：viewport（缺省）是视口节点自己滚；window 是列表铺在页面里、随整页滚动， 列表在页面里的起点由内核现量，不必再给 scrollMargin。 |
| `anchor` | `VirtualizerAnchor` |  | 条目增删时钉住哪一头。start（缺省）把视口里第一条按身份放回原处：往前插入条目（向上翻出历史）视口不跳， 需要 getItemKey 给出稳定身份。end 另外从底部看起、已经滚到底时内容再长也继续贴底（聊天流）， 列表不足一屏时条目贴着底部排。 |
| `stickyIndices` | `number[]` |  | 钉在视口起点的条目下标（分组标题）：滚过它之后它一直钉着，直到下一个钉住的条目接替。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `range-change` | `VirtualizerRangeChangeDetails` | 应渲染的区间变化；detail 为 `{ virtualItems, totalSize, startIndex, endIndex }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhVirtualizerRoot` | `default` | `VirtualizerRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhVirtualizerItem` | `value` | `number \| string` | 是 | 该节点的下标。 |
| `XhVirtualizerItem` | `measure` | `boolean` |  | 是否把真实尺寸回传给内核；未开启时条目尺寸按 estimateSize 计算。 |
| `XhVirtualizerRoot` | `children` | `SlotChildren<VirtualizerRootSlotProps>` |  |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `scrolling`

**事件**：`SCROLL.START` · `SCROLL.END` · `MEASURE`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `virtualItems` | `readonly VirtualizerItemState[]` | 当前应渲染的下标，以及它们的位移与尺寸。 |
| `totalSize` | `number` | 整份列表的主轴总长（px）。 |
| `startIndex` | `number \| null` | 可视区首条下标（不含过扫描）；没有任何条目可容纳时为 null。 |
| `endIndex` | `number \| null` | 可视区末条下标（不含过扫描）；没有任何条目可容纳时为 null。 |
| `horizontal` | `boolean` |  |
| `lanes` | `number` |  |
| `scrolling` | `boolean` | 正在滚动。 |
| `collectionVirtualizer` | `CollectionVirtualizer` | 交给集合组件的正式虚拟化桥。 |
| `scrollToIndex` | `(index: number, options?: VirtualizerScrollToOptions) => void` | 滚动到某一条。越界下标由内核夹取。 |
| `measureElement` | `(element: HTMLElement \| null) => void` | 把条目节点的真实尺寸回填给内核（动态高度使用）。传 null 无副作用。 |
| `measure` | `() => void` | 丢弃全部实测尺寸重新按估算值排列。视口更换排版时使用。 |
| `registerItemElement` | `(index: number, element: HTMLElement \| null) => void` | 适配器在条目 ref 挂载 / 卸载时登记；业务作者通常不直接调用。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: VirtualizerItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/virtualizer.css` 按 `[data-scope="virtualizer"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-virtualizer` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | 'horizontal' \| 'vertical' |
| `root` | `data-scrolling` | ''（条件成立时才出现） |
| `viewport` | `data-anchor` | 'end' \| undefined |
| `viewport` | `data-orientation` | 'horizontal' \| 'vertical' |
| `viewport` | `data-scroll-container` | 'window' \| undefined |
| `content` | `data-orientation` | 'horizontal' \| 'vertical' |
| `item` | `data-fixed` | ''（条件成立时才出现） |
| `item` | `data-index` | props.index |
| `item` | `data-lane` | item.lane \| undefined |
| `item` | `data-orientation` | 'horizontal' \| 'vertical' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-virtualizer-sticky-bg` | `item` | `background` | `fixed` | `--xh-bg-surface` | virtualizer 的 item 部件 background 覆盖槽。 |
| `--xh-virtualizer-sticky-layer` | `item` | `z-index` | `fixed` | `--xh-layer-sticky` | virtualizer 的 item 部件 z-index 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
