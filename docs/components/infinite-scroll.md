# InfiniteScroll 无限滚动

取下一页的通用触发器，滚动只是默认的触发方式。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/infinite-scroll" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/infinite-scroll.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/infinite-scroll" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/infinite-scroll" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/infinite-scroll.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

哨兵滚进可视区就派 load，取完把 loading 写回 false

<XhDemo src="infinite-scroll/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="infinite-scroll"`：**`root`** · **`sentinel`** · `load-more-trigger`

## 示例

### 提前量

distance 把可视区沿块轴向外扩，哨兵还没露头就先取下一页

<XhDemo src="infinite-scroll/02-distance" />

### 取到没有了

最后一页取完把 disabled 打开，哨兵不再被观察，load 也不再派

<XhDemo src="infinite-scroll/03-disabled" />

### 状态透出

phase / loading / disabled 由组件交给宿主，加载提示与结束语都由宿主自己摆

<XhDemo src="infinite-scroll/04-slot-state" />

### 取下一页的按钮

与哨兵同一条通路：读屏在虚拟光标模式下不产生滚动事件，这颗按钮是它的键盘等价入口

<XhDemo src="infinite-scroll/05-load-more" />

## 设计指引

### 何时使用

- 时间流、消息列表这类用户只关心"再来一些"的内容。

### 何时不用

- 用户需要跳到确定位置或分享某一页：用[分页](./pagination)。
- 页面有页脚需要够得着：无限滚动会让页脚永远追不上。

### 特性

- `distance` 是提前量：距底部还有这么远就触发，用户感觉不到等待。
- `loading` 与 `disabled` 由组件交给宿主，加载提示与结束语都由宿主自己摆。
- 取完之后关掉即可，不会再触发。
- `load-more-trigger` 是同一条通路的另一个入口：一颗真按钮，取数中与关掉两段自动停用。

### 组合

- 与[列表](./list)、[骨架屏](./skeleton)配合。
- 与[虚拟滚动](./virtualizer)合成一条边滚边取的长列表：`target` 指向虚拟滚动的视口，哨兵摆在内容层之后；示例在虚拟滚动那一页。

### 最佳实践

- 明确的结束提示："没有更多了"比无声停止好。
- 加载失败要能重试，别静默停在那里。
- 摆一颗 `load-more-trigger`：读屏在虚拟光标模式下不产生滚动事件，只靠哨兵那条路取不到第二页。
- 按钮的文案写在按钮里，组件不代填名字——读屏念的与眼睛看的才是同一句。

### 反模式

- 页面底部有重要内容（页脚、版权、联系方式）却用无限滚动。
- 不给结束提示，用户一直往下滚。
- 与[虚拟滚动](./virtualizer)合用时把哨兵摆进条目之间：窗口外的条目不渲染，哨兵也就永远进不了可视区。
- 与[虚拟滚动](./virtualizer)合用时不给 `target`：提前量按整页可视区算，而真正在滚的是虚拟滚动的视口那一层。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-infinite-scroll>` |
| Vue 组件 | `XhInfiniteScrollLoadMoreTrigger` `XhInfiniteScrollRoot` `XhInfiniteScrollSentinel` |
| 组合式函数 | `useInfiniteScroll` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/infinite-scroll.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `distance` | `number` |  | 提前量（px）：哨兵离可视区还有这么远就算进入，默认 0（真正露头才算）。扩的是 getTargetEl 给出的那块可视区。 |
| `disabled` | `boolean` |  | 关掉：不再观察，也不再触发。列表已经没有下一页时用它。 |
| `loading` | `boolean` |  | 正在取数：其间不观察、不重复触发。取完由宿主写回 false。 |
| `onLoad` | `() => void` |  | 该取下一页了。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `load` | `` | 该取下一页了 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhInfiniteScrollRoot` | `default` | `InfiniteScrollRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**事件**：`SENTINEL.ENTER` · `LOAD` · `MODE.SYNC`

**判据**：`isPaused` · `isLoading`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `InfiniteScrollPhase` |  |
| `loading` | `boolean` | 正在取数。 |
| `disabled` | `boolean` | 已关掉，不再观察。 |
| `getRootProps` | `() => T['element']` |  |
| `getSentinelProps` | `() => T['element']` |  |
| `getLoadMoreTriggerProps` | `() => T['button']` | 取下一页的按钮。文案由作者写在按钮里，组件不代填。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `sentinel` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/infinite-scroll.css` 使用 `[data-scope="infinite-scroll"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-loading` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-infinite-scroll-load-more-bg` | `load-more-trigger` | `background` | `default` | `--xh-bg-canvas` | infinite-scroll 的 load-more-trigger 部件 background 覆盖槽。 |
| `--xh-infinite-scroll-load-more-bg-active` | `load-more-trigger` | `background` | `active` | `--xh-bg-subtle-active` | infinite-scroll 的 load-more-trigger 部件 background 覆盖槽。 |
| `--xh-infinite-scroll-load-more-bg-hover` | `load-more-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | infinite-scroll 的 load-more-trigger 部件 background 覆盖槽。 |
| `--xh-infinite-scroll-load-more-border` | `load-more-trigger` | `border` | `default` | `--xh-border-control` | infinite-scroll 的 load-more-trigger 部件 border 覆盖槽。 |
| `--xh-infinite-scroll-load-more-border-hover` | `load-more-trigger` | `border-color` | `hover` | `--xh-border-control-hover` | infinite-scroll 的 load-more-trigger 部件 border-color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-fg` | `load-more-trigger` | `color` | `default` | `--xh-fg-default` | infinite-scroll 的 load-more-trigger 部件 color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-text-body-size` | infinite-scroll 的 load-more-trigger 部件 font-size 覆盖槽。 |
| `--xh-infinite-scroll-load-more-gap` | `load-more-trigger` | `gap` | `default` | `--xh-control-gap-md` | infinite-scroll 的 load-more-trigger 部件 gap 覆盖槽。 |
| `--xh-infinite-scroll-load-more-h` | `load-more-trigger` | `min-block-size` | `default` | `--xh-control-h-md` | infinite-scroll 的 load-more-trigger 部件 min-block-size 覆盖槽。 |
| `--xh-infinite-scroll-load-more-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-control-px-md` | infinite-scroll 的 load-more-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-infinite-scroll-load-more-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-shape-control` | infinite-scroll 的 load-more-trigger 部件 border-radius 覆盖槽。 |
| `--xh-infinite-scroll-sentinel-size` | `sentinel` | `block-size` | `default` | `--xh-stroke-thin` | infinite-scroll 的 sentinel 部件 block-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
