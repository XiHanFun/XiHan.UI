# Carousel 走马灯

在同一块区域内轮播若干张内容，一次显示一屏。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/carousel" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/carousel.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/carousel" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/carousel" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/carousel.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

张数由 slideCount 声明而不是从 DOM 计数，页数与指示点数量都由它计算

<XhDemo src="carousel/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="carousel"`：**`root`** · **`viewport`** · **`list`** · `item` · `prev-trigger` · `next-trigger` · `autoplay-trigger` · `indicator-group` · `indicator`

## 示例

### 受控

传入 page 后由宿主决定，组件只发 page-change 不自行修改页码，宿主写回后才变化

<XhDemo src="carousel/02-controlled" />

### 一屏多张

slidesPerPage 决定一屏显示几张，一次翻几张默认跟随它，因此仍是整屏翻页

<XhDemo src="carousel/03-slides-per-page" />

### 自动播放与暂停

autoplay 传毫秒即间隔；开启后必须渲染播放开关，自动翻页必须能够停止

<XhDemo src="carousel/04-autoplay" />

### 纵向轨道

orientation 换为 vertical 后轨道竖向位移，两端按钮落到上下两端，翻页识别上下方向键

<XhDemo src="carousel/05-vertical" />

### 指针拖拽

allowPointerDrag 开启后按住轨道即可拖动，松手落回整页；关闭则只有触摸的原生滚动

<XhDemo src="carousel/06-pointer-drag" />

### 指示点悬停切页

指示点上补一个原生 mouseenter 即为悬停切页，组件自带的点击翻页照常

<XhDemo src="carousel/07-indicator-hover" />

### 一次移动一张

slidesPerMove 与 slidesPerPage 分开提供：一屏显示三张、一次只移动一张，页数按剩余张数重新计算

<XhDemo src="carousel/08-slides-per-move" />

### 更换过渡效果

条目的内联样式只有尺寸与间距，位移之外的表现全部归作者：把条目叠放后按当前页调整透明度与缩放，翻页、键盘与指示点一概照常

<XhDemo src="carousel/09-effect" />

## 设计指引

### 何时使用

- 首屏营销位、图片画廊等内容并列且用户不需要全部浏览的场景。

### 何时不用

- 每一张都需要被看到时，并排铺开或使用[列表](./list)；轮播中第二张之后的点击率很低。
- 内容是导航入口。

### 特性

- `slidesPerPage` 与 `slidesPerMove` 分开：可以一屏三张、一次移动一张。
- 支持纵向轨道、指针拖拽、循环与自动播放。
- 拖拽松手后轨道带着松手速度落到目标页：轻甩一下也能翻页，往回甩则收回；不循环时首末页往外拖越拉越沉，松手弹回。
- 分页点为 8px 圆点，当前页拉长为 20px 品牌胶囊；自动播放时胶囊按停留间隔显示进度，临时暂停时同步冻结。
- 指示点可以配置为悬停即切页。

### 组合

- 每一张放[图片](./image)或[卡片](./card)。

### 最佳实践

- 开启自动播放时渲染 `autoplay-trigger`：它是唯一能停止自动翻页且不会被其他交互重新启动的入口。
- 自动播放在指针悬停或焦点进入时自动暂停，离开后重新计满一个间隔再翻页。
- 减弱动效时自动播放不会自行启动，播放开关是用户唯一的启动入口。
- 分页点应能看出总屏数与当前位置；自动播放时还应反馈本页剩余时间。翻页与播放按钮走 Action Control floating 档：48px 圆形磨砂面、图标 24px，按下缩放并换底。

### 反模式

- 自动播放且不能暂停，阅读较慢的用户无法读完。
- 把关键信息或唯一的行动入口放在第三张之后。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-carousel>` |
| Vue 组件 | `XhCarouselAutoplayTrigger` `XhCarouselIndicator` `XhCarouselIndicatorGroup` `XhCarouselItem` `XhCarouselList` `XhCarouselNextTrigger` `XhCarouselPrevTrigger` `XhCarouselRoot` `XhCarouselViewport` |
| 组合式函数 | `useCarousel` |
| 状态机 | `carouselMachine` |
| 皮肤 | `@xihan-ui/styles/carousel.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | `number` |  | 当前页，0 基。提供即受控：内部不再自行修改，只发 onPageChange。 页不等于张：一页可能同时显示多张（见 slidesPerPage）。 |
| `defaultPage` | `number` |  | 非受控初始页，默认 0。 |
| `slideCount` | `number` |  | 条目总数，由作者声明，不从 DOM 统计。 |
| `slidesPerPage` | `number` |  | 一屏显示的张数，默认 1。 |
| `slidesPerMove` | `number` |  | 一次翻动的张数，默认跟随 slidesPerPage（整屏翻页）。 |
| `orientation` | `Orientation` |  | 轨道方向，默认 horizontal；方向键的轴随之变化。 |
| `dir` | `Direction` |  | 文字方向。水平轴上同时作用于排版与位移方向：rtl 下下一张在左侧， 轨道也向正方向位移。纵向轨道不受影响。 |
| `loop` | `boolean` |  | 到达末尾是否回绕，默认 false。 |
| `autoplay` | `boolean \| number` |  | 自动播放。true 使用默认间隔，数值即毫秒间隔；未提供 / false / 非正数一律不自动播放。 指针悬停或轮播内任一节点获得焦点时暂停计时，离开后重新计满一个完整间隔再翻页。 减弱动效档下不自动起播：提供间隔也停在 idle，需要由用户按下播放开关。 |
| `allowPointerDrag` | `boolean` |  | 允许指针拖拽切页，默认 false。鼠标、触摸、触控笔一并门控。 开启后沿轨道轴的原生滚动让位给拖拽，关闭则完全没有拖拽、触摸使用原生滚动。 |
| `spacing` | `string` |  | 张与张之间的间距，任意 CSS 长度（如 '12px'）。落为条目自身的内边距，不影响位移计算。 |
| `translations` | `Partial<CarouselTranslations>` |  |  |
| `onPageChange` | `(details: CarouselPageChangeDetails) => void` |  | 页码变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `page-change` | `CarouselPageChangeDetails` | 页码变化；detail 为 `{ page: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCarouselAutoplayTrigger` | `default` | `{ stopped: boolean }` |  |
| `XhCarouselRoot` | `default` | `CarouselRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhCarouselAutoplayTrigger` | `children` | `SlotChildren<CarouselAutoplayTriggerSlotProps>` |  |  |
| `XhCarouselIndicator` | `index` | `number \| string` | 是 | 指示点对应的页码，0 基；兼收字符串。 |
| `XhCarouselItem` | `index` | `number \| string` | 是 | 该张的下标，0 基；兼收字符串。 |
| `XhCarouselRoot` | `children` | `SlotChildren<CarouselRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `autoplay-trigger` | 'paused' \| 'running' |

以下名称仅用于内部状态机。

**状态**：`idle` · `playing` · `playing.running` · `playing.paused`

**事件**：`PAGE.SET` · `PAGE.PREV` · `PAGE.NEXT` · `AUTOPLAY.START` · `AUTOPLAY.STOP` · `AUTOPLAY.PAUSE` · `AUTOPLAY.RESUME` · `after.autoplay` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `PRESS.START` · `PRESS.END`

**判据**：`isLastPauseSource` · `canAdvance` · `hasAutoplay` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `page` | `number` | 当前页，0 基；恒在 [0, max(totalPages-1, 0)] 内，slideCount 减小后也能读到可用的值。 |
| `totalPages` | `number` |  |
| `slideCount` | `number` | 归一化后的条目总数（负数 / 小数 / 未提供都已收敛为非负整数）。 |
| `slidesPerPage` | `number` |  |
| `slidesPerMove` | `number` |  |
| `orientation` | `Orientation` |  |
| `slideRange` | `{ start: number, end: number }` | 当前页显示的条目下标区间，0 基闭区间；没有条目时 end &lt; start。 |
| `pageSnapPoints` | `number[]` | 每一页的首张下标序列，长度即总页数。 |
| `canScrollPrev` | `boolean` |  |
| `canScrollNext` | `boolean` |  |
| `autoplaying` | `boolean` | 自动播放的计时进行中。 |
| `paused` | `boolean` | 自动播放已开启但被暂停（悬停 / 焦点 / 调用方）。 |
| `autoplayStopped` | `boolean` | 自动播放当前是否由用户停止：计时未进行（idle），或由调用方暂停。 与 `paused` 的差别在于它不计入悬停与焦点两路：这两路一离开即自动恢复， 若用它驱动播放 / 暂停开关的名字与图形，鼠标一碰按钮就会在两态之间跳动。 |
| `dragging` | `boolean` |  |
| `isInView` | `(index: number) => boolean` |  |
| `setPage` | `(page: number) => void` | 页码会被收敛进合法区间（loop 时回绕），越界入参不会写出越界的页。 |
| `goToPrev` | `() => void` |  |
| `goToNext` | `() => void` |  |
| `play` | `() => void` | 开始自动播放；autoplay prop 未提供正的间隔时无操作。 |
| `pause` | `() => void` | 暂停计时（来源记为 api），与悬停 / 焦点叠加计数。 |
| `resume` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: CarouselItemProps) => T['element']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getAutoplayTriggerProps` | `() => T['button']` | 播放 / 暂停开关。未配置自动播放（间隔为 0）时为原生 disabled。 |
| `getIndicatorGroupProps` | `() => T['element']` |  |
| `getIndicatorProps` | `(props: CarouselIndicatorProps) => T['button']` |  |

## 无障碍

### 键盘

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
| `Enter` / `Space` | held on prev-trigger / next-trigger / autoplay-trigger / indicator, 该按钮未禁用 | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或按住途中转禁用（翻到边界、关掉 loop、去掉 autoplay）撤下。翻页与播放 / 暂停照旧由这一次按键的原生激活承担 |
| `Tab` / `Shift+Tab` | 任意时刻 | 在两端按钮与各指示点之间逐个停靠；到端点后禁用的按钮自动脱序 |
| `方向键` | 焦点在幻灯片内的输入控件上 | 不接管：交还给控件自己做光标移动 |

### ARIA

以下属性由 `connect` 生成。

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
| `autoplay-trigger` | `aria-controls` | `viewport` 部件的 id |
| `autoplay-trigger` | `aria-label` | label.autoplayTriggerPlay \| label.autoplayTriggerPause |
| `indicator-group` | `aria-label` | label.indicatorGroup |
| `indicator-group` | `role` | 'group' |
| `indicator` | `aria-current` | 'true' \| 'false' |
| `indicator` | `aria-label` | label.indicator(index + 1) |

## 样式参考

### 皮肤

`@xihan-ui/styles/carousel.css` 使用 `[data-scope="carousel"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-autoplay` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-paused` | ''（条件成立时才出现） |
| `viewport` | `data-dragging` | ''（条件成立时才出现） |
| `viewport` | `data-orientation` | props.orientation |
| `list` | `data-animating` | ''（条件成立时才出现） |
| `list` | `data-dragging` | ''（条件成立时才出现） |
| `list` | `data-orientation` | props.orientation |
| `item` | `data-index` | String(index) |
| `item` | `data-inview` | ''（条件成立时才出现） |
| `item` | `data-orientation` | props.orientation |
| `prev-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `prev-trigger` | `data-orientation` | props.orientation |
| `prev-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `prev-trigger` | `data-xh-action-control` | '' |
| `prev-trigger` | `data-xh-action-display` | 'always' |
| `prev-trigger` | `data-xh-action-profile` | 'floating' |
| `prev-trigger` | `data-xh-action-size` | 'md' |
| `next-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-trigger` | `data-orientation` | props.orientation |
| `next-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `next-trigger` | `data-xh-action-control` | '' |
| `next-trigger` | `data-xh-action-display` | 'always' |
| `next-trigger` | `data-xh-action-profile` | 'floating' |
| `next-trigger` | `data-xh-action-size` | 'md' |
| `autoplay-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `autoplay-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `autoplay-trigger` | `data-state` | 'paused' \| 'running' |
| `autoplay-trigger` | `data-xh-action-control` | '' |
| `autoplay-trigger` | `data-xh-action-display` | 'always' |
| `autoplay-trigger` | `data-xh-action-profile` | 'floating' |
| `autoplay-trigger` | `data-xh-action-size` | 'md' |
| `indicator-group` | `data-orientation` | props.orientation |
| `indicator` | `data-current` | ''（条件成立时才出现） |
| `indicator` | `data-index` | String(index) |
| `indicator` | `data-pressed` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-carousel-control-inset` | `autoplay-trigger`<br>`indicator-group`<br>`next-trigger`<br>`prev-trigger`<br>`root` | `inset-block-end`<br>`inset-block-start`<br>`inset-inline-end`<br>`inset-inline-start` | `default`<br>`orientation=vertical` | `--xh-space-3` | carousel 的 autoplay-trigger、indicator-group、next-trigger、prev-trigger、root 部件 inset-block-end、inset-block-start、inset-inline-end、inset-inline-start 覆盖槽。 |
| `--xh-carousel-duration` | `list` | `transition` | `default` | `--xh-motion-duration-slide` | carousel 的 list 部件 transition 覆盖槽。 |
| `--xh-carousel-ease` | `list` | `transition` | `default` | `--xh-motion-ease-slide` | carousel 的 list 部件 transition 覆盖槽。 |
| `--xh-carousel-icon-size` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-carousel-indicator-bg` | `indicator` | `background` | `@media (pointer: coarse)`<br>`default` | `--xh-bg-subtle-hover-opaque` | carousel 的 indicator 部件 background 覆盖槽。 |
| `--xh-carousel-indicator-bg-active` | `indicator` | `background` | `@media (pointer: coarse)`<br>`current`<br>`is(:active, [data-pressed])`<br>`not([data-current])`<br>`pressed` | `--xh-fg-default` | carousel 的 indicator 部件 background 覆盖槽。 |
| `--xh-carousel-indicator-bg-hover` | `indicator` | `background` | `current`<br>`hover`<br>`not([data-current])` | `--xh-fg-muted` | carousel 的 indicator 部件 background 覆盖槽。 |
| `--xh-carousel-indicator-bg-selected` | `indicator`<br>`root` | `background` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`not([data-autoplay], [data-paused])`<br>`paused` | `--xh-bg-brand` | carousel 的 indicator、root 部件 background 覆盖槽。 |
| `--xh-carousel-indicator-bg-selected-active` | `indicator` | `background` | `@media (pointer: coarse)`<br>`current`<br>`is(:active, [data-pressed])`<br>`pressed` | `--xh-bg-brand-active` | carousel 的 indicator 部件 background 覆盖槽。 |
| `--xh-carousel-indicator-bg-track` | `indicator`<br>`root` | `background` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`paused` | `--xh-bg-brand-subtle` | carousel 的 indicator、root 部件 background 覆盖槽。 |
| `--xh-carousel-indicator-fg-selected` | `indicator`<br>`root` | `color` | `autoplay`<br>`current`<br>`not([data-autoplay], [data-paused])`<br>`paused` | `--xh-fg-on-brand` | carousel 的 indicator、root 部件 color 覆盖槽。 |
| `--xh-carousel-indicator-gap` | `indicator-group` | `gap` | `default` | `--xh-space-1` | carousel 的 indicator-group 部件 gap 覆盖槽。 |
| `--xh-carousel-indicator-inset` | `indicator-group` | `inset-block-end` | `orientation=horizontal` | `--xh-space-3` | carousel 的 indicator-group 部件 inset-block-end 覆盖槽。 |
| `--xh-carousel-indicator-radius` | `indicator` | `border-radius` | `@media (pointer: coarse)`<br>`default` | `--xh-shape-circle` | carousel 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-carousel-indicator-radius-current` | `indicator`<br>`root` | `border-radius` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`paused` | `--xh-shape-pill` | carousel 的 indicator、root 部件 border-radius 覆盖槽。 |
| `--xh-carousel-indicator-size` | `indicator`<br>`indicator-group`<br>`root` | `block-size`<br>`inline-size` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`default`<br>`orientation=vertical`<br>`paused` | `--xh-space-2` | carousel 的 indicator、indicator-group、root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-carousel-indicator-size-current` | `indicator`<br>`indicator-group`<br>`root` | `block-size`<br>`inline-size` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`orientation=vertical`<br>`paused` | `--xh-space-5` | carousel 的 indicator、indicator-group、root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-carousel-indicator-target-size` | `indicator`<br>`root` | `min-block-size`<br>`min-inline-size` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`hover`<br>`is(:active, [data-pressed])`<br>`not([data-autoplay], [data-paused])`<br>`not([data-current])`<br>`paused`<br>`pressed` | `44px` | carousel 的 indicator、root 部件 min-block-size、min-inline-size 覆盖槽。 |
| `--xh-carousel-trigger-bg` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_carousel-trigger-bg`<br>`--xh-material-frosted-focus-surface` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-carousel-trigger-bg-active` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover-opaque` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 background-color 覆盖槽。 |
| `--xh-carousel-trigger-bg-hover` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle-opaque` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 background-color 覆盖槽。 |
| `--xh-carousel-trigger-border` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_carousel-trigger-border` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-carousel-trigger-fg` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-material-frosted-fg` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 color 覆盖槽。 |
| `--xh-carousel-trigger-radius` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 border-radius 覆盖槽。 |
| `--xh-carousel-trigger-shadow` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_carousel-trigger-shadow` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-carousel-trigger-shadow-hover` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_carousel-trigger-shadow` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-carousel-trigger-size` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=floating` | `--xh-_action-profile-visual-size` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-carousel-viewport-radius` | `viewport` | `border-radius` | `default` | `--xh-shape-surface` | carousel 的 viewport 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换 · 导航（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-carousel-duration` · `--xh-carousel-ease`。

关键帧 `xh-carousel-indicator-progress` 随皮肤自带，不引用别处文件里的名字；`background-color` · `block-size` · `inline-size` · `scale` · `transform` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：内核按组件所在的作用域判断减弱动效（最近的 `data-motion`、应用级覆盖、系统偏好），据此决定要不要动。

`prefers-reduced-motion: reduce` 下本组件另有降级规则；内核驱动的那段不经令牌层，由内核按元素判断后自行降级。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
