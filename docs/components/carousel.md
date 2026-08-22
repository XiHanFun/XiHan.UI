# 走马灯 <Badge type="info" text="carousel" />

在同一块区域里轮播若干张内容，一次显示一屏。

## 何时使用

- 首屏的营销位、图片画廊这类"内容并列且用户不急着全看"的场景。

## 何时不用

- 每一张都重要、都需要被看到：并排铺开或做成[列表](./list)——轮播里第二张之后的点击率极低。
- 内容是导航入口。

## 特性

- `slidesPerPage` 与 `slidesPerMove` 分开：可以一屏三张、一次挪一张。
- 支持纵向轨道、指针拖拽、回绕与自动播放。
- 指示点可以做成悬停即切页。

## 示例

### 基础用法

张数由 slideCount 声明而不是从 DOM 数，页数与指示点数量都由它算出来

<XhDemo src="carousel/01-basic" />

### 受控

传了 page 就由宿主说了算，组件只发 page-change 不自己改页码，宿主写回它才动

<XhDemo src="carousel/02-controlled" />

### 一屏多张

slidesPerPage 决定一屏露几张，一次翻几张缺省跟着它走，所以仍是整屏翻

<XhDemo src="carousel/03-slides-per-page" />

### 自动播放与回绕

autoplay 给毫秒即间隔，鼠标停上去或焦点走进来都会把计时按住

<XhDemo src="carousel/04-autoplay" />

### 纵向轨道

orientation 换成 vertical 后轨道竖着位移，两端按钮落到上下两头，翻页认的是上下方向键

<XhDemo src="carousel/05-vertical" />

### 指针拖拽

allowPointerDrag 打开后按住轨道就能拖着走，松手落回整页；关掉则只有触摸的原生滚动

<XhDemo src="carousel/06-pointer-drag" />

### 指示点悬停切页

指示点上补一个原生 mouseenter 就是悬停切页，组件自带的点击翻页照旧

<XhDemo src="carousel/07-indicator-hover" />

### 一次挪一张

slidesPerMove 与 slidesPerPage 分开给：一屏露三张、一次只挪一张，页数按剩下的张数重新算

<XhDemo src="carousel/08-slides-per-move" />

### 换过渡效果

条目的内联样式只有尺寸与间距，位移之外的表现全归作者：把条目摞起来再按当前页调透明度与缩放，翻页、键盘与指示点一概照旧

<XhDemo src="carousel/09-effect" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-carousel>` |
| Vue 组件 | `XhCarouselIndicator` `XhCarouselIndicatorGroup` `XhCarouselItem` `XhCarouselItemGroup` `XhCarouselNextTrigger` `XhCarouselPrevTrigger` `XhCarouselRoot` `XhCarouselViewport` |
| 组合式函数 | `useCarousel` |
| 状态机 | `carouselMachine` |
| 皮肤 | `@xihan-ui/styles/carousel.css` |

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
| `autoplay` | `boolean \| number` |  | 自动播放。true 用默认间隔，数值即毫秒间隔；缺省 / false / 非正数一律不自动播放。 指针悬停或轮播内任一节点获得焦点时按住计时，离开后从头计满一整个间隔再翻。 |
| `allowPointerDrag` | `boolean` |  | 允许指针拖拽切页，默认 false。鼠标、触摸、触控笔一并门控。 打开后沿轨道那一轴的原生滚动会让位给拖拽，关掉则完全没有拖拽、触摸走原生滚动。 |
| `spacing` | `string` |  | 张与张之间的间距，任意 CSS 长度（如 '12px'）。落成条目自身的内边距，不影响位移算术。 |
| `translations` | `Partial<CarouselTranslations>` |  |  |
| `onPageChange` | `(details: CarouselPageChangeDetails) => void` |  | 页码变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `page-change` | `CarouselPageChangeDetails` | 页码变化；detail 为 `{ page: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCarouselRoot` | `default` | `CarouselRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | label.root |
| `root` | `aria-roledescription` | 'carousel' |
| `root` | `role` | 'region' |
| `viewport` | `aria-atomic` | 'false' |
| `viewport` | `aria-live` | 'off' \| 'polite' |
| `item` | `aria-label` | label.item(index + 1, slideCount) |
| `item` | `aria-roledescription` | 'slide' |
| `item` | `role` | 'group' |
| `prev-trigger` | `aria-controls` | `viewport` 部件的 id |
| `prev-trigger` | `aria-label` | label.prevTrigger |
| `next-trigger` | `aria-controls` | `viewport` 部件的 id |
| `next-trigger` | `aria-label` | label.nextTrigger |
| `indicator-group` | `aria-label` | label.indicatorGroup |
| `indicator-group` | `role` | 'group' |
| `indicator` | `aria-current` | 'true' \| 'false' |
| `indicator` | `aria-label` | label.indicator(index + 1) |

## 样式

默认皮肤 `@xihan-ui/styles/carousel.css` 按部件选择：`[data-scope="carousel"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-autoplay` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-paused` | ''（条件成立时才出现） |
| `viewport` | `data-dragging` | ''（条件成立时才出现） |
| `viewport` | `data-orientation` | props.orientation |
| `item-group` | `data-dragging` | ''（条件成立时才出现） |
| `item-group` | `data-orientation` | props.orientation |
| `item` | `data-index` | String(index) |
| `item` | `data-inview` | ''（条件成立时才出现） |
| `item` | `data-orientation` | props.orientation |
| `prev-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `prev-trigger` | `data-orientation` | props.orientation |
| `next-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-trigger` | `data-orientation` | props.orientation |
| `indicator-group` | `data-orientation` | props.orientation |
| `indicator` | `data-current` | ''（条件成立时才出现） |
| `indicator` | `data-index` | String(index) |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-carousel-duration` · `--xh-carousel-ease` · `--xh-carousel-gap` · `--xh-carousel-icon-size` · `--xh-carousel-indicator-bg` · `--xh-carousel-indicator-bg-hover` · `--xh-carousel-indicator-bg-selected` · `--xh-carousel-indicator-gap` · `--xh-carousel-indicator-radius` · `--xh-carousel-indicator-size` · `--xh-carousel-trigger-bg` · `--xh-carousel-trigger-bg-active` · `--xh-carousel-trigger-bg-hover` · `--xh-carousel-trigger-border` · `--xh-carousel-trigger-fg` · `--xh-carousel-trigger-radius` · `--xh-carousel-trigger-size` · `--xh-carousel-viewport-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 组合

- 每一张放[图片](./image)或[卡片](./card)。

## 最佳实践

- 自动播放要能暂停，且指针悬停或焦点进入时自动暂停。
- 指示点要能看出总共几屏、当前第几屏。

## 反模式

- 自动播放且不能暂停：读得慢的人永远读不完一张。
- 把关键信息或唯一的行动入口放在第三张之后。
