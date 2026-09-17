# InfiniteScroll 无限滚动 <Badge type="info" text="alpha" />

获取下一页的通用触发器，滚动只是默认的触发方式。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/infinite-scroll" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/infinite-scroll.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/infinite-scroll" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/infinite-scroll" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/infinite-scroll.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

哨兵滚进可视区即派发 load，取数完成后把 loading 写回 false

<XhDemo src="infinite-scroll/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="infinite-scroll"`：**`root`** · **`sentinel`** · `load-more-trigger`

## 示例

### 提前量

distance 把可视区沿块轴向外扩展，哨兵尚未出现就先取下一页

<XhDemo src="infinite-scroll/02-distance" />

### 没有更多数据

最后一页取完后开启 disabled，哨兵不再被观察，load 也不再派发

<XhDemo src="infinite-scroll/03-disabled" />

### 状态透出

phase / loading / disabled 由组件交给宿主，加载提示与结束语都由宿主自行放置

<XhDemo src="infinite-scroll/04-slot-state" />

### 取下一页的按钮

与哨兵同一条通路：读屏在虚拟光标模式下不产生滚动事件，该按钮是它的键盘等价入口

<XhDemo src="infinite-scroll/05-load-more" />

## 设计指引

### 何时使用

- 时间流、消息列表等用户只需要继续加载的内容。

### 何时不用

- 用户需要跳到确定位置或分享某一页时，使用[分页](./pagination)。
- 页面有页脚需要可达时，无限滚动会使页脚无法到达。

### 特性

- `distance` 是提前量：距底部该距离时触发，用户感觉不到等待。
- `loading` 与 `disabled` 由组件交给宿主，加载提示与结束语由宿主放置。
- 加载完成后关闭即可，不会再触发。
- `load-more-trigger` 是同一通路的另一个入口：一个真实按钮，取数中与关闭时自动停用。它是铺满一行的独立动作条目：宽度由容器给、高度随内容，中性描边与透明底，按下只换面不缩放。

### 组合

- 与[列表](./list)、[骨架屏](./skeleton)配合。
- 与[虚拟滚动](./virtualizer)组合为边滚边取的长列表：`target` 指向虚拟滚动的视口，哨兵放在内容层之后；示例见虚拟滚动页面。

### 最佳实践

- 提供明确的结束提示：“没有更多了”优于无声停止。
- 加载失败时可以重试，不静默停止。
- 放置一个 `load-more-trigger`：读屏在虚拟光标模式下不产生滚动事件，只靠哨兵无法获取第二页。
- 按钮的文案写在按钮内，组件不代填名称，读屏读出的与视觉一致。

### 反模式

- 页面底部有重要内容（页脚、版权、联系方式）却用无限滚动。
- 不提供结束提示，用户持续向下滚动。
- 与[虚拟滚动](./virtualizer)合用时把哨兵放在条目之间：窗口外的条目不渲染，哨兵永远无法进入可视区。
- 与[虚拟滚动](./virtualizer)合用时不提供 `target`：提前量按整页可视区计算，而实际滚动的是虚拟滚动的视口。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-infinite-scroll>` |
| Vue 组件 | `XhInfiniteScrollLoadMoreTrigger` `XhInfiniteScrollRoot` `XhInfiniteScrollSentinel` |
| 组合式函数 | `useInfiniteScroll` |
| 状态机 | `infiniteScrollMachine` |
| 皮肤 | `@xihan-ui/styles/infinite-scroll.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `distance` | `number` |  | 提前量（px）：哨兵距可视区该距离即视为进入，默认 0（实际出现才计）。扩展的是 getTargetEl 给出的可视区。 |
| `disabled` | `boolean` |  | 关闭：不再观察，也不再触发。列表已没有下一页时使用。 |
| `loading` | `boolean` |  | 正在取数：期间不观察、不重复触发。取完由宿主写回 false。 |
| `onLoad` | `() => void` |  | 应取下一页。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `load` | `` | 应取下一页 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhInfiniteScrollRoot` | `default` | `InfiniteScrollRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `loading` · `paused`

**事件**：`SENTINEL.ENTER` · `LOAD` · `MODE.SYNC`

**判据**：`isPaused` · `isLoading`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `InfiniteScrollPhase` |  |
| `loading` | `boolean` | 正在取数。 |
| `disabled` | `boolean` | 已关闭，不再观察。 |
| `getRootProps` | `() => T['element']` |  |
| `getSentinelProps` | `() => T['element']` |  |
| `getLoadMoreTriggerProps` | `() => T['button']` | 取下一页的按钮。文案由作者写在按钮中，组件不代填。 |

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
| `load-more-trigger` | `data-xh-action-control` | '' |
| `load-more-trigger` | `data-xh-action-display` | 'always' |
| `load-more-trigger` | `data-xh-action-profile` | 'row' |
| `load-more-trigger` | `data-xh-action-size` | 'md' |
| `load-more-trigger` | `data-xh-action-variant` | 'outline' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-infinite-scroll-load-more-bg` | `load-more-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | infinite-scroll 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-bg-active` | `load-more-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | infinite-scroll 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-bg-hover` | `load-more-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | infinite-scroll 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-border` | `load-more-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` | infinite-scroll 的 load-more-trigger 部件 border 覆盖槽。 |
| `--xh-infinite-scroll-load-more-border-hover` | `load-more-trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` | infinite-scroll 的 load-more-trigger 部件 border-color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-fg` | `load-more-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | infinite-scroll 的 load-more-trigger 部件 color 覆盖槽。 |
| `--xh-infinite-scroll-load-more-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-text-body-size` | infinite-scroll 的 load-more-trigger 部件 font-size 覆盖槽。 |
| `--xh-infinite-scroll-load-more-gap` | `load-more-trigger` | `gap` | `default` | `--xh-_action-profile-gap` | infinite-scroll 的 load-more-trigger 部件 gap 覆盖槽。 |
| `--xh-infinite-scroll-load-more-h` | `load-more-trigger` | `block-size`<br>`min-block-size` | `default`<br>`xh-action-profile=row` | `--xh-_action-profile-visual-size` | infinite-scroll 的 load-more-trigger 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-infinite-scroll-load-more-icon-size` | `load-more-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | infinite-scroll 的 load-more-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-infinite-scroll-load-more-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | infinite-scroll 的 load-more-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-infinite-scroll-load-more-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` | infinite-scroll 的 load-more-trigger 部件 border-radius 覆盖槽。 |
| `--xh-infinite-scroll-sentinel-size` | `sentinel` | `block-size` | `default` | `--xh-stroke-thin` | infinite-scroll 的 sentinel 部件 block-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
