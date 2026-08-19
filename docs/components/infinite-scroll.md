# 无限滚动 <Badge type="info" text="infinite-scroll" />

滚到接近底部时触发一次加载。

## 何时使用

- 时间流、消息列表这类用户只关心"再来一些"的内容。

## 何时不用

- 用户需要跳到确定位置或分享某一页：用[分页](./pagination)。
- 页面有页脚需要够得着：无限滚动会让页脚永远追不上。

## 特性

- `distance` 是提前量：距底部还有这么远就触发，用户感觉不到等待。
- `loading` 与 `disabled` 由组件交给宿主，加载提示与结束语都由宿主自己摆。
- 取完之后关掉即可，不会再触发。

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

### 状态透出

phase / loading / disabled 由组件交给宿主，加载提示与结束语都由宿主自己摆

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

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `load` | `` | 该取下一页了 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhInfiniteScrollRoot` | `default` | `InfiniteScrollRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `sentinel` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `sentinel` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/infinite-scroll.css` 按部件选择：`[data-scope="infinite-scroll"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-state` | state.get() |
| `sentinel` | `data-state` | state.get() |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-infinite-scroll-sentinel-size`

## 组合

- 与[列表](./list)、[虚拟滚动](./virtualizer)、[骨架屏](./skeleton)配合。

## 最佳实践

- 明确的结束提示："没有更多了"比无声停止好。
- 加载失败要能重试，别静默停在那里。

## 反模式

- 页面底部有重要内容（页脚、版权、联系方式）却用无限滚动。
- 不给结束提示，用户一直往下滚。
