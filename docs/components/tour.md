# Tour 引导

一串聚光灯步骤，逐个指向界面上的元素并解释它。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tour" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tour.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tour" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tour" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tour.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

steps 是唯一事实源，组件只按下标取用；每步的 target 是一个 CSS 选择器，高亮框与浮层都锚在它上面

<XhDemo src="tour/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="tour"`：**`root`** · `backdrop` · `spotlight` · `positioner` · **`content`** · `title` · `description` · `progress-text` · `progress-indicator` · `progress-dot` · `prev-trigger` · `next-trigger` · `skip-trigger` · `close-trigger` · `arrow`

## 示例

### 居中步

不写 target 的那一步不锚定任何元素：浮层居中、不画高亮框、也不出箭头，适合当开场白与收尾

<XhDemo src="tour/02-centered" />

### 受控

传了 open 与 value 就由宿主说了算：内部不再自改，只发意图，浮层里的按钮与外面的进度读的是同一份状态

<XhDemo src="tour/03-controlled" />

### 按步定制正文

标题与说明之外，正文按当前步的 id 换成自己的一块内容；showBackdrop 关掉那层压暗，引导与页面一起看

<XhDemo src="tour/04-per-step" />

## 设计指引

### 何时使用

- 新功能上线、首次进入复杂界面时的一次性介绍。

### 何时不用

- 界面本身不好懂：改界面，别用引导补丁。
- 用户需要随时查阅的说明：写进帮助或[文字提示](./tooltip)。

### 特性

- 聚光灯把目标从遮罩里挖出来，`spotlightPadding` 决定挖多大。
- `autoScroll` 把目标滚进视野。
- 可以有居中的无目标步（开场与结束）。
- 步序与展开都可受控，另有完成与跳过两个回调。

### 组合

- 与[对话框](./dialog)配合做开场；结束后引导用户去[空状态](./empty-state)那一页或具体功能。

### 最佳实践

- 步数压到三到五步，多了没人走完。
- 跳过入口从第一步就要有，且要显眼。
- 只讲一次，记住用户已经看过。

### 反模式

- 强制走完不许跳过。
- 引导目标在当前视口里不存在（还没渲染出来），聚光灯挖了个空。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tour>` |
| Vue 组件 | `XhTourArrow` `XhTourBackdrop` `XhTourCloseTrigger` `XhTourContent` `XhTourDescription` `XhTourNextTrigger` `XhTourPositioner` `XhTourPrevTrigger` `XhTourProgressDot` `XhTourProgressIndicator` `XhTourProgressText` `XhTourRoot` `XhTourSkipTrigger` `XhTourSpotlight` `XhTourTitle` |
| 组合式函数 | `useTour` |
| 状态机 | `tourMachine` |
| 皮肤 | `@xihan-ui/styles/tour.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `steps` | `TourStep[]` |  | 步骤清单。它同时是步序的上界与读屏"第 m 步，共 n 步"的分母。 |
| `value` | `number` |  | 当前步序（0 起）。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `number` |  | 非受控初值，默认 0。 |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 整份引导的首选放置位，默认 bottom；单步可用自己的 placement 覆盖。 |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  | 浮层与目标的间距（px）。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  | 层外交互关闭，默认 false：引导要退出得走 skip 或 close 这两个明确出口。 |
| `showBackdrop` | `boolean` |  | 画遮罩，默认 true。 |
| `spotlightPadding` | `number` |  | 高亮框在目标四周留出的空白（px），默认 8。 |
| `autoScroll` | `boolean` |  | 展开与换步时自动把目标滚进视口（nearest，已可见时不动），默认 true。 |
| `translations` | `Partial<TourTranslations>` |  |  |
| `onValueChange` | `(details: TourValueChangeDetails) => void` |  | 步序变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: TourOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onComplete` | `(details: TourCompleteDetails) => void` |  | 末步再按"下一步"：先发它，再按 onOpenChange 关闭。 |
| `onSkip` | `(details: TourSkipDetails) => void` |  | 用户主动放弃（skip-trigger 或 Escape）：先发它，再按 onOpenChange 关闭。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `TourOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `value-change` | `TourValueChangeDetails` | 步序变化；detail 为 `{ value: number }` |
| `complete` | `TourCompleteDetails` | 末步再按下一步；detail 为 `{ step: number }` |
| `skip` | `TourSkipDetails` | 用户放弃（跳过按钮或 Escape）；detail 为 `{ step: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTourRoot` | `default` | `TourRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `spotlight` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `prev-trigger` | 'open' \| 'closed' |
| `next-trigger` | 'open' \| 'closed' |
| `skip-trigger` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `VALUE.SET` · `STEP.PREV` · `STEP.NEXT` · `SKIP` · `GEOMETRY.SYNC` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled` · `isLastStep` · `isLastStepOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `number` | 当前步序，恒在 [0, count - 1] 内；清单为空时为 0。 |
| `count` | `number` |  |
| `currentStep` | `TourStep \| null` | 当前步的声明；清单为空时为 null。 |
| `firstStep` | `boolean` | 停在首步：上一步按钮据此禁用。 |
| `lastStep` | `boolean` | 停在末步：下一步按钮据此改文案（"完成"）。 |
| `anchored` | `boolean` | 这一步锚定了页面元素：居中步为 false，此时不画高亮框也不出箭头。 |
| `progressText` | `string` | "第 m 步，共 n 步"。作者没写 progress-text 的内容时由适配器填上。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: number) => void` | 直接跳到某一步；越界会被夹回 [0, count - 1]。 |
| `goToNextStep` | `() => void` | 末步再走一步 = 完成：先发 onComplete，再关闭。 |
| `goToPrevStep` | `() => void` |  |
| `skip` | `() => void` | 放弃引导：先发 onSkip，再关闭。 |
| `remeasure` | `() => void` | 重量高亮框与浮层位置：目标节点被外部改动（换位、变尺寸）后调它校准。 |
| `getRootProps` | `() => T['element']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getSpotlightProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getProgressTextProps` | `() => T['element']` |  |
| `getProgressIndicatorProps` | `() => T['element']` |  |
| `getProgressDotProps` | `(props: TourProgressDotProps) => T['element']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getSkipTriggerProps` | `() => T['button']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | open 且焦点在 content 上（不在按钮等控件上） | 走到下一步；停在末步时完成引导并关闭 |
| `Escape` | open 且 closeOnEscape | 放弃引导（发 onSkip）并关闭 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | open | 一概不接管：既不换步也不阻止默认行为，留给页面滚动与读屏浏览 |
| `Tab` / `Shift+Tab` | open | 焦点陷在 content 内循环，跑出去会被拉回来 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `backdrop` | `aria-hidden` | 'true' |
| `spotlight` | `aria-hidden` | 'true' |
| `content` | `aria-describedby` | `description` 部件的 id |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `aria-modal` | 'true' |
| `content` | `role` | 'dialog' |
| `progress-text` | `aria-live` | 'polite' |
| `progress-indicator` | `aria-hidden` | 'true' |
| `next-trigger` | `aria-label` | translations?.finish \| translations?.next |
| `close-trigger` | `aria-label` | translations?.close |
| `arrow` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/tour.css` 使用 `[data-scope="tour"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-step` | String(value) |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `spotlight` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-position` | 'anchored' \| 'center' |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-step` | String(value) |
| `progress-text` | `data-step` | String(value) |
| `progress-indicator` | `data-count` | String(count) |
| `progress-indicator` | `data-step` | String(value) |
| `progress-dot` | `data-complete` | ''（条件成立时才出现） |
| `progress-dot` | `data-current` | ''（条件成立时才出现） |
| `progress-dot` | `data-index` | String(index) |
| `prev-trigger` | `data-state` | 'open' \| 'closed' |
| `next-trigger` | `data-last` | ''（条件成立时才出现） |
| `next-trigger` | `data-state` | 'open' \| 'closed' |
| `skip-trigger` | `data-state` | 'open' \| 'closed' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tour-action-radius` | `next-trigger`<br>`prev-trigger`<br>`skip-trigger` | `border-radius` | `default` | `--xh-shape-control` | tour 的 next-trigger、prev-trigger、skip-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tour-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | tour 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-tour-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | tour 的 backdrop 部件 background 覆盖槽。 |
| `--xh-tour-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | tour 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-tour-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-bg-surface` | tour 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-tour-border` | `arrow`<br>`content` | `border` | `default` | `--xh-border-default` | tour 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-tour-close-bg-active` | `close-trigger` | `background` | `active` | `--xh-bg-subtle-active` | tour 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-tour-close-bg-hover` | `close-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | tour 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-tour-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | tour 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-tour-close-fg-hover` | `close-trigger` | `color` | `hover` | `--xh-fg-default` | tour 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-tour-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | tour 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tour-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='tour'][data-part='close-trigger'])` | `--xh-control-h-sm` | tour 的 close-trigger、content、title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-tour-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | tour 的 description 部件 color 覆盖槽。 |
| `--xh-tour-fg` | `content`<br>`root` | `color` | `default` | `--xh-fg-default` | tour 的 content、root 部件 color 覆盖槽。 |
| `--xh-tour-gap` | `content` | `gap` | `default` | `--xh-space-2` | tour 的 content 部件 gap 覆盖槽。 |
| `--xh-tour-icon-size` | `content`<br>`root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | tour 的 content、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tour-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | tour 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-tour-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w-lg` | tour 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-tour-next-bg` | `next-trigger` | `background` | `default` | `--xh-bg-brand` | tour 的 next-trigger 部件 background 覆盖槽。 |
| `--xh-tour-next-bg-hover` | `next-trigger` | `background` | `hover` | `--xh-bg-brand-hover` | tour 的 next-trigger 部件 background 覆盖槽。 |
| `--xh-tour-next-fg` | `next-trigger` | `color` | `default` | `--xh-fg-on-brand` | tour 的 next-trigger 部件 color 覆盖槽。 |
| `--xh-tour-next-shadow` | `next-trigger` | `box-shadow` | `default` | `--xh-_tour-next-highlight` | tour 的 next-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-tour-positioner-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | tour 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-tour-positioner-padding` | `positioner` | `padding` | `position=center` | `--xh-space-4` | tour 的 positioner 部件 padding 覆盖槽。 |
| `--xh-tour-progress-dot-bg` | `progress-dot` | `background` | `default` | `--xh-border-default` | tour 的 progress-dot 部件 background 覆盖槽。 |
| `--xh-tour-progress-dot-bg-complete` | `progress-dot` | `background` | `complete` | `--xh-border-strong` | tour 的 progress-dot 部件 background 覆盖槽。 |
| `--xh-tour-progress-dot-bg-current` | `progress-dot` | `background` | `current` | `--xh-bg-brand` | tour 的 progress-dot 部件 background 覆盖槽。 |
| `--xh-tour-progress-fg` | `progress-text` | `color` | `default` | `--xh-fg-subtle` | tour 的 progress-text 部件 color 覆盖槽。 |
| `--xh-tour-progress-font-size` | `progress-text` | `font-size` | `default` | `--xh-text-caption-size` | tour 的 progress-text 部件 font-size 覆盖槽。 |
| `--xh-tour-progress-indicator-gap` | `progress-indicator` | `gap` | `default` | `--xh-space-1` | tour 的 progress-indicator 部件 gap 覆盖槽。 |
| `--xh-tour-px` | `content` | `padding-inline` | `default` | `--xh-surface-px-md` | tour 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-tour-py` | `content` | `padding-block` | `default` | `--xh-surface-py-md` | tour 的 content 部件 padding-block 覆盖槽。 |
| `--xh-tour-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | tour 的 content 部件 border-radius 覆盖槽。 |
| `--xh-tour-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-sheet` | tour 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-tour-skip-trigger-px` | `next-trigger`<br>`prev-trigger`<br>`skip-trigger` | `padding-inline` | `default` | `--xh-control-px-md` | tour 的 next-trigger、prev-trigger、skip-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-tour-spotlight-layer` | `spotlight` | `z-index` | `default` | `--xh-_layer` | tour 的 spotlight 部件 z-index 覆盖槽。 |
| `--xh-tour-spotlight-radius` | `spotlight` | `border-radius` | `default` | `--xh-shape-surface` | tour 的 spotlight 部件 border-radius 覆盖槽。 |
| `--xh-tour-spotlight-ring` | `spotlight` | `box-shadow` | `default` | `--xh-ring-focus` | tour 的 spotlight 部件 box-shadow 覆盖槽。 |
| `--xh-tour-spotlight-shroud` | `spotlight` | `box-shadow` | `default` | `--xh-bg-overlay` | tour 的 spotlight 部件 box-shadow 覆盖槽。 |
| `--xh-tour-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | tour 的 title 部件 color 覆盖槽。 |
| `--xh-tour-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` | tour 的 title 部件 font-size 覆盖槽。 |
| `--xh-tour-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` | tour 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-fade-in` · `xh-fade-out` · `xh-overlay-pop-in` · `xh-pop-out` · `xh-tour-spotlight-in` · `xh-tour-spotlight-out` 随皮肤自带，不引用别处文件里的名字；`background` · `background-color` · `block-size` · `color` · `inline-size` · `inset-block-start` · `inset-inline-start` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
