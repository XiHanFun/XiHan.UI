# 无限滚动 <Badge type="info" text="infinite-scroll" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

哨兵滚进可视区就派 load，取完把 loading 写回 false

<XhDemo src="infinite-scroll/01-basic" />

### 提前量

distance 把可视区沿块轴向外扩，哨兵还没露头就先取下一页

<XhDemo src="infinite-scroll/02-distance" />

### 取到没有了

最后一页取完把 disabled 打开，哨兵不再被观察，load 也不再派

<XhDemo src="infinite-scroll/03-disabled" />

### 默认插槽透出状态

phase / loading / disabled 从插槽拿，加载提示与结束语都由宿主自己摆

<XhDemo src="infinite-scroll/04-slot-state" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-infinite-scroll>` |
| Vue 组件 | `XhInfiniteScrollRoot` `XhInfiniteScrollSentinel` |
| 组合式函数 | `useInfiniteScroll` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/infinite-scroll.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="infinite-scroll"`：**`root`** · **`sentinel`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `distance` | `number` |  | 提前量（px）：哨兵离可视区还有这么远就算进入，默认 0（真正露头才算）。扩的是 getTargetEl 给出的那块可视区。 |
| `disabled` | `boolean` |  | 关掉：不再观察，也不再触发。列表已经没有下一页时用它。 |
| `loading` | `boolean` |  | 正在取数：其间不观察、不重复触发。取完由宿主写回 false。 |
| `onLoad` | `() => void` |  | 该取下一页了。 |

## 状态机

**事件**：`SENTINEL.ENTER` · `MODE.SYNC`

**判据**：`isPaused` · `isLoading`

## connect API

`useInfiniteScroll` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `InfiniteScrollPhase` |  |
| `loading` | `boolean` | 正在取数。 |
| `disabled` | `boolean` | 已关掉，不再观察。 |
| `getRootProps` | `() => T['element']` |  |
| `getSentinelProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
