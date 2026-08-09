# 走马灯 <Badge type="info" text="carousel" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-carousel>` |
| Vue 组件 | `XhCarouselIndicator` `XhCarouselIndicatorGroup` `XhCarouselItem` `XhCarouselItemGroup` `XhCarouselNextTrigger` `XhCarouselPrevTrigger` `XhCarouselRoot` `XhCarouselViewport` |
| 组合式函数 | `useCarousel` |
| 状态机 | `carouselMachine` |
| 皮肤 | `@xihan-ui/styled/carousel.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="carousel"`：**`root`** · **`viewport`** · **`item-group`** · `item` · `prev-trigger` · `next-trigger` · `indicator-group` · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | `number` |  | 当前页，0 基。给定即受控：内部不再自改，只发 onPageChange。 页不是张：一页可能同时露出好几张（见 slidesPerPage）。 |
| `defaultPage` | `number` |  | 非受控初始页，默认 0。 |
| `slideCount` | `number` |  | 条目总数，由作者声明，不从 DOM 数。 |
| `slidesPerPage` | `number` |  | 一屏放几张，默认 1。 |
| `slidesPerMove` | `number` |  | 一次翻几张，默认跟随 slidesPerPage（整屏翻页）。 |
| `orientation` | `Orientation` |  | 轨道方向，默认 horizontal；方向键的轴跟着它走。 |
| `dir` | `Direction` |  | 文字方向。水平轴上同时作用于排版与位移方向：rtl 下"下一张"在左手边， 轨道也要往正方向位移。纵向轨道不受它影响。 |
| `loop` | `boolean` |  | 走到尽头是否回绕，默认 false。 |
| `autoplay` | `boolean | number` |  | 自动播放。true 用默认间隔，数值即毫秒间隔；缺省 / false / 非正数一律不自动播放。 指针悬停或轮播内任一节点获得焦点时按住计时，离开后从头计满一整个间隔再翻。 |
| `allowPointerDrag` | `boolean` |  | 允许指针拖拽切页，默认 false。鼠标、触摸、触控笔一并门控。 打开后沿轨道那一轴的原生滚动会让位给拖拽，关掉则完全没有拖拽、触摸走原生滚动。 |
| `spacing` | `string` |  | 张与张之间的间距，任意 CSS 长度（如 '12px'）。落成条目自身的内边距，不影响位移算术。 |
| `translations` | `Partial<CarouselTranslations>` |  |  |
| `onPageChange` | `(details: CarouselPageChangeDetails) => void` |  | 页码变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 状态机

**状态**：`idle` · `playing` · `playing.running` · `playing.paused`

**事件**：`PAGE.SET` · `PAGE.PREV` · `PAGE.NEXT` · `AUTOPLAY.START` · `AUTOPLAY.STOP` · `AUTOPLAY.PAUSE` · `AUTOPLAY.RESUME` · `after.autoplay` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END`

**判据**：`isLastPauseSource` · `canAdvance` · `hasAutoplay`

## connect API

`useCarousel` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `page` | `number` | 当前页，0 基；恒在 [0, max(totalPages-1, 0)] 内，slideCount 变小后也读得到一个可用的值。 |
| `totalPages` | `number` |  |
| `slideCount` | `number` | 归一后的条目总数（负数/小数/缺省都已收成非负整数）。 |
| `slidesPerPage` | `number` |  |
| `slidesPerMove` | `number` |  |
| `orientation` | `Orientation` |  |
| `slideRange` | `{ start: number, end: number }` | 当前页露出的条目下标区间，0 基闭区间；一张都没有时 end &lt; start。 |
| `pageSnapPoints` | `number[]` | 每一页的首张下标序列，长度即总页数。 |
| `canScrollPrev` | `boolean` |  |
| `canScrollNext` | `boolean` |  |
| `autoplaying` | `boolean` | 自动播放的计时正在走。 |
| `paused` | `boolean` | 自动播放开着但被按住（悬停 / 焦点 / 调用方）。 |
| `dragging` | `boolean` |  |
| `isInView` | `(index: number) => boolean` |  |
| `setPage` | `(page: number) => void` | 页码会被收进合法区间（loop 时回绕），越界入参不会写出越界的页。 |
| `goToPrev` | `() => void` |  |
| `goToNext` | `() => void` |  |
| `play` | `() => void` | 开始自动播放；autoplay prop 没给出正的间隔时无事发生。 |
| `pause` | `() => void` | 按住计时（来源记为 api），与悬停 / 焦点叠加计数。 |
| `resume` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getItemGroupProps` | `() => T['element']` |  |
| `getItemProps` | `(props: CarouselItemProps) => T['element']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getIndicatorGroupProps` | `() => T['element']` |  |
| `getIndicatorProps` | `(props: CarouselIndicatorProps) => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` | orientation=horizontal，焦点在轮播内 | 翻到下一页；rtl 下反向（走上一页） |
| `ArrowLeft` | orientation=horizontal，焦点在轮播内 | 翻到上一页；rtl 下反向（走下一页） |
| `ArrowDown` | orientation=vertical，焦点在轮播内 | 翻到下一页；横轨下不接管，放行给页面滚动 |
| `ArrowUp` | orientation=vertical，焦点在轮播内 | 翻到上一页；横轨下不接管，放行给页面滚动 |
| `Home` | 焦点在轮播内 | 跳到第一页 |
| `End` | 焦点在轮播内 | 跳到最后一页 |
| `Enter` / `Space` | 焦点在上一张 / 下一张按钮上 | 翻一页；由原生按钮的激活行为负责 |
| `Enter` / `Space` | 焦点在指示点上 | 跳到该指示点对应的页；由原生按钮的激活行为负责 |
| `Tab` / `Shift+Tab` | 任意时刻 | 在两端按钮与各指示点之间逐个停靠；到端点后禁用的按钮自动脱序 |
| `方向键` | 焦点在幻灯片内的输入控件上 | 不接管：交还给控件自己做光标移动 |
