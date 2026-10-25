# Carousel

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/carousel).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/carousel" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/carousel.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/carousel" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/carousel" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/carousel.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="carousel"`: **`root`** · **`viewport`** · **`list`** · `item` · `prev-trigger` · `next-trigger` · `autoplay-trigger` · `indicator-group` · `indicator`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-carousel>` |
| Vue components | `XhCarouselAutoplayTrigger` `XhCarouselIndicator` `XhCarouselIndicatorGroup` `XhCarouselItem` `XhCarouselList` `XhCarouselNextTrigger` `XhCarouselPrevTrigger` `XhCarouselRoot` `XhCarouselViewport` |
| Composable | `useCarousel` |
| State machine | `carouselMachine` |
| Skin | `@xihan-ui/styles/carousel.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `page` | `number` |  |
| `defaultPage` | `number` |  |
| `slideCount` | `number` |  |
| `slidesPerPage` | `number` |  |
| `slidesPerMove` | `number` |  |
| `orientation` | `Orientation` |  |
| `dir` | `Direction` |  |
| `loop` | `boolean` |  |
| `autoplay` | `boolean \| number` |  |
| `allowPointerDrag` | `boolean` |  |
| `spacing` | `string` |  |
| `effect` | `CarouselEffect` |  |
| `size` | `Size` |  |
| `translations` | `Partial<CarouselTranslations>` |  |
| `onPageChange` | `(details: CarouselPageChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `page-change` | `CarouselPageChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhCarouselAutoplayTrigger` | `default` | `{ stopped: boolean }` |
| `XhCarouselRoot` | `default` | `CarouselRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhCarouselAutoplayTrigger` | `children` | `SlotChildren<CarouselAutoplayTriggerSlotProps>` |  |
| `XhCarouselIndicator` | `index` | `number \| string` | Yes |
| `XhCarouselItem` | `index` | `number \| string` | Yes |
| `XhCarouselRoot` | `children` | `SlotChildren<CarouselRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `autoplay-trigger` | 'paused' \| 'running' |

The following names are internal to the state machine.

**States**: `idle` · `playing` · `playing.running` · `playing.paused`

**Events**: `PAGE.SET` · `PAGE.PREV` · `PAGE.NEXT` · `AUTOPLAY.START` · `AUTOPLAY.STOP` · `AUTOPLAY.PAUSE` · `AUTOPLAY.RESUME` · `after.autoplay` · `WRAP.SETTLE` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `PRESS.START` · `PRESS.END`

**Guards**: `isLastPauseSource` · `canAdvance` · `hasAutoplay` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `page` | `number` |
| `totalPages` | `number` |
| `slideCount` | `number` |
| `slidesPerPage` | `number` |
| `slidesPerMove` | `number` |
| `orientation` | `Orientation` |
| `slideRange` | `{ start: number, end: number }` |
| `pageSnapPoints` | `number[]` |
| `canScrollPrev` | `boolean` |
| `canScrollNext` | `boolean` |
| `autoplaying` | `boolean` |
| `paused` | `boolean` |
| `autoplayStopped` | `boolean` |
| `dragging` | `boolean` |
| `isInView` | `(index: number) => boolean` |
| `setPage` | `(page: number) => void` |
| `goToPrev` | `() => void` |
| `goToNext` | `() => void` |
| `play` | `() => void` |
| `pause` | `() => void` |
| `resume` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getListProps` | `() => T['element']` |
| `getItemProps` | `(props: CarouselItemProps) => T['element']` |
| `getPrevTriggerProps` | `() => T['button']` |
| `getNextTriggerProps` | `() => T['button']` |
| `getAutoplayTriggerProps` | `() => T['button']` |
| `getIndicatorGroupProps` | `() => T['element']` |
| `getIndicatorProps` | `(props: CarouselIndicatorProps) => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowRight` | `carousel.kbd.next` |
| `ArrowLeft` | `carousel.kbd.prev` |
| `ArrowDown` | `carousel.kbd.next-vertical` |
| `ArrowUp` | `carousel.kbd.prev-vertical` |
| `Home` | `carousel.kbd.first` |
| `End` | `carousel.kbd.last` |
| `Enter` / `Space` | `carousel.kbd.trigger` |
| `Enter` / `Space` | `carousel.kbd.indicator` |
| `Enter` / `Space` | `carousel.kbd.press` |
| `Tab` / `Shift+Tab` | `carousel.kbd.tab` |
| arrow keys | `carousel.kbd.editable` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | label.root |
| `root` | `aria-roledescription` | label.rootRoleDescription |
| `root` | `role` | 'region' |
| `viewport` | `aria-atomic` | 'false' |
| `viewport` | `aria-live` | 'off' \| 'polite' |
| `item` | `aria-label` | label.item(index + 1, slideCount) |
| `item` | `aria-roledescription` | label.itemRoleDescription |
| `item` | `role` | 'group' |
| `prev-trigger` | `aria-controls` | id of the `viewport` part |
| `prev-trigger` | `aria-label` | label.prevTrigger |
| `next-trigger` | `aria-controls` | id of the `viewport` part |
| `next-trigger` | `aria-label` | label.nextTrigger |
| `autoplay-trigger` | `aria-controls` | id of the `viewport` part |
| `autoplay-trigger` | `aria-label` | label.autoplayTriggerPlay \| label.autoplayTriggerPause |
| `indicator-group` | `aria-label` | label.indicatorGroup |
| `indicator-group` | `role` | 'group' |
| `indicator` | `aria-current` | 'true' \| 'false' |
| `indicator` | `aria-label` | label.indicator(index + 1) |

## Style reference

### Skin

`@xihan-ui/styles/carousel.css` is written against `[data-scope="carousel"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-carousel` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-autoplay` | '' (present only while the condition holds) |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-paused` | '' (present only while the condition holds) |
| `viewport` | `data-dragging` | '' (present only while the condition holds) |
| `viewport` | `data-orientation` | props.orientation |
| `list` | `data-animating` | '' (present only while the condition holds) |
| `list` | `data-dragging` | '' (present only while the condition holds) |
| `list` | `data-effect` | props.effect |
| `list` | `data-orientation` | props.orientation |
| `list` | `data-snapped` | '' (present only while the condition holds) |
| `item` | `data-index` | String(index) |
| `item` | `data-inview` | '' (present only while the condition holds) |
| `item` | `data-orientation` | props.orientation |
| `prev-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `prev-trigger` | `data-orientation` | props.orientation |
| `prev-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `prev-trigger` | `data-xh-action-control` | '' |
| `prev-trigger` | `data-xh-action-display` | 'always' |
| `prev-trigger` | `data-xh-action-profile` | 'floating' |
| `prev-trigger` | `data-xh-action-size` | props.size |
| `prev-trigger` | `data-xh-liquid` | '' |
| `prev-trigger` | `data-xh-material` | 'frosted' |
| `next-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `next-trigger` | `data-orientation` | props.orientation |
| `next-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `next-trigger` | `data-xh-action-control` | '' |
| `next-trigger` | `data-xh-action-display` | 'always' |
| `next-trigger` | `data-xh-action-profile` | 'floating' |
| `next-trigger` | `data-xh-action-size` | props.size |
| `next-trigger` | `data-xh-liquid` | '' |
| `next-trigger` | `data-xh-material` | 'frosted' |
| `autoplay-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `autoplay-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `autoplay-trigger` | `data-state` | 'paused' \| 'running' |
| `autoplay-trigger` | `data-xh-action-control` | '' |
| `autoplay-trigger` | `data-xh-action-display` | 'always' |
| `autoplay-trigger` | `data-xh-action-profile` | 'floating' |
| `autoplay-trigger` | `data-xh-action-size` | props.size |
| `autoplay-trigger` | `data-xh-liquid` | '' |
| `autoplay-trigger` | `data-xh-material` | 'frosted' |
| `indicator-group` | `data-orientation` | props.orientation |
| `indicator-group` | `data-xh-liquid` | '' |
| `indicator` | `data-current` | '' (present only while the condition holds) |
| `indicator` | `data-index` | String(index) |
| `indicator` | `data-pressed` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-carousel-control-inset` | `autoplay-trigger`<br>`indicator-group`<br>`next-trigger`<br>`prev-trigger`<br>`root` | `inset-block-end`<br>`inset-block-start`<br>`inset-inline-end`<br>`inset-inline-start` | `default`<br>`orientation=vertical` | `--xh-space-3` |
| `--xh-carousel-duration` | `item`<br>`list` | `transition`<br>`transition-duration` | `default`<br>`effect=fade` | `--xh-motion-duration-slide` |
| `--xh-carousel-ease` | `item`<br>`list` | `transition`<br>`transition-timing-function` | `default`<br>`effect=fade` | `--xh-motion-ease-slide` |
| `--xh-carousel-icon-size` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `--xh-icon-size` | `default` | `--xh-_carousel-trigger-glyph` |
| `--xh-carousel-indicator-bg` | `indicator` | `background` | `@media (pointer: coarse)`<br>`default` | `--xh-bg-subtle-hover-opaque` |
| `--xh-carousel-indicator-bg-active` | `indicator` | `background` | `@media (pointer: coarse)`<br>`current`<br>`is(:active, [data-pressed])`<br>`not([data-current])`<br>`pressed` | `--xh-fg-default` |
| `--xh-carousel-indicator-bg-hover` | `indicator` | `background` | `current`<br>`hover`<br>`not([data-current])` | `--xh-fg-muted` |
| `--xh-carousel-indicator-bg-selected` | `indicator`<br>`root` | `background` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`not([data-autoplay], [data-paused])`<br>`paused` | `--xh-bg-brand` |
| `--xh-carousel-indicator-bg-selected-active` | `indicator` | `background` | `@media (pointer: coarse)`<br>`current`<br>`is(:active, [data-pressed])`<br>`pressed` | `--xh-bg-brand-active` |
| `--xh-carousel-indicator-bg-track` | `indicator`<br>`root` | `background` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`paused` | `--xh-bg-brand-subtle` |
| `--xh-carousel-indicator-fg-selected` | `indicator`<br>`root` | `color` | `autoplay`<br>`current`<br>`not([data-autoplay], [data-paused])`<br>`paused` | `--xh-fg-on-brand` |
| `--xh-carousel-indicator-gap` | `indicator-group` | `gap` | `default` | `--xh-space-2` |
| `--xh-carousel-indicator-group-p` | `indicator-group` | `padding` | `material=liquid`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-space-2` |
| `--xh-carousel-indicator-group-radius` | `indicator-group` | `border-radius` | `material=liquid`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-shape-pill` |
| `--xh-carousel-indicator-inset` | `indicator-group` | `inset-block-end` | `orientation=horizontal` | `--xh-space-3` |
| `--xh-carousel-indicator-radius` | `indicator` | `border-radius` | `@media (pointer: coarse)`<br>`default` | `--xh-shape-circle` |
| `--xh-carousel-indicator-radius-current` | `indicator`<br>`root` | `border-radius`<br>`clip-path` | `@keyframes xh-carousel-indicator-progress`<br>`@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`paused` | `--xh-shape-pill` |
| `--xh-carousel-indicator-size` | `indicator`<br>`indicator-group`<br>`root` | `block-size`<br>`inline-size`<br>`inset-block`<br>`inset-inline` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`default`<br>`orientation=vertical`<br>`paused` | `--xh-space-1_5` |
| `--xh-carousel-indicator-size-current` | `indicator`<br>`indicator-group`<br>`root` | `block-size`<br>`inline-size` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`orientation=vertical`<br>`paused` | `--xh-space-5` |
| `--xh-carousel-indicator-target-size` | `indicator`<br>`root` | `min-block-size`<br>`min-inline-size` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`hover`<br>`is(:active, [data-pressed])`<br>`not([data-autoplay], [data-paused])`<br>`not([data-current])`<br>`paused`<br>`pressed` | `44px` |
| `--xh-carousel-indicator-thickness` | `indicator`<br>`indicator-group`<br>`root` | `block-size`<br>`inline-size`<br>`inset-block`<br>`inset-inline` | `@media (pointer: coarse)`<br>`autoplay`<br>`current`<br>`default`<br>`orientation=vertical`<br>`paused` | `--xh-carousel-indicator-size` |
| `--xh-carousel-trigger-bg` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_material-bg`<br>`--xh-_material-bg-focus` |
| `--xh-carousel-trigger-bg-active` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-bg-pressed`<br>`--xh-bg-subtle-hover-opaque` |
| `--xh-carousel-trigger-bg-hover` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_material-bg-hover`<br>`--xh-bg-subtle-opaque` |
| `--xh-carousel-trigger-border` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-border` |
| `--xh-carousel-trigger-fg` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-fg` |
| `--xh-carousel-trigger-radius` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` |
| `--xh-carousel-trigger-shadow` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-shadow` |
| `--xh-carousel-trigger-shadow-hover` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_material-shadow` |
| `--xh-carousel-trigger-size` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=floating` | `--xh-_carousel-trigger-size` |
| `--xh-carousel-viewport-radius` | `viewport` | `border-radius` | `default` | `--xh-shape-surface` |
