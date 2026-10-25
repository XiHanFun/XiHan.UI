# Scrollbar

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/scrollbar).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/scrollbar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/scrollbar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/scrollbar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/scrollbar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/scrollbar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="scrollbar"`: **`root`** · **`track`** · **`thumb`** · `corner`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-scrollbar>` |
| Vue components | `XhScrollbarCorner` `XhScrollbarRoot` `XhScrollbarThumb` `XhScrollbarTrack` |
| Composable | `useScrollbar` |
| State machine | `scrollbarMachine` |
| Skin | `@xihan-ui/styles/scrollbar.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `orientation` | `Orientation` |  |
| `type` | `ScrollbarType` |  |
| `hideDelay` | `number` |  |
| `minThumbSize` | `number` |  |
| `step` | `number` |  |
| `size` | `Size` |  |
| `anchor` | `ScrollbarAnchor` |  |
| `disabled` | `boolean` |  |
| `focusable` | `boolean` |  |
| `controls` | `string` |  |
| `gutter` | `boolean` |  |
| `forceVisible` | `boolean` |  |
| `dir` | `Direction` |  |
| `translations` | `Partial<ScrollbarTranslations>` |  |
| `onScrollStart` | `(details: ScrollbarScrollDetails) => void` |  |
| `onScrollEnd` | `(details: ScrollbarScrollDetails) => void` |  |
| `onDragStart` | `(details: ScrollbarScrollDetails) => void` |  |
| `onDragEnd` | `(details: ScrollbarScrollDetails) => void` |  |
| `onScrollChange` | `(details: ScrollbarScrollDetails) => void` |  |
| `onReachEnd` | `(details: ScrollbarScrollDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `name` | `CustomEvent` |
| `scroll-start` | `` |
| `scroll-end` | `` |
| `drag-start` | `` |
| `drag-end` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhScrollbarRoot` | `default` | `ScrollbarRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhScrollbarRoot` | `scrollable` | `ScrollbarTarget` |  |
| `XhScrollbarRoot` | `children` | `SlotChildren<ScrollbarRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'visible' \| 'hidden' |
| `corner` | 'visible' \| 'hidden' |

The following names are internal to the state machine.

**States**: `hidden` · `visible` · `hiding` · `dragging`

**Events**: `MEASURE` · `SCROLL` · `SCROLL.IDLE` · `POINTER.ENTER` · `POINTER.LEAVE` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `TRACK.CLICK` · `STEP` · `SCROLL.TO` · `after.hideDelay`

**Guards**: `showsOnHover` · `showsOnScroll` · `staysVisible` · `canInteract`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `orientation` | `Orientation` |
| `type` | `ScrollbarType` |
| `overflow` | `boolean` |
| `visible` | `boolean` |
| `native` | `boolean` |
| `hover` | `boolean` |
| `dragging` | `boolean` |
| `scrolling` | `boolean` |
| `thumbSize` | `number` |
| `thumbOffset` | `number` |
| `scroll` | `number` |
| `max` | `number` |
| `scrollTo` | `(offset: number) => void` |
| `scrollBy` | `(delta: number) => void` |
| `measure` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getTrackProps` | `() => T['element']` |
| `getThumbProps` | `() => T['element']` |
| `getCornerProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowUp` / `ArrowLeft` | `scrollbar.kbd.back` |
| `ArrowDown` / `ArrowRight` | `scrollbar.kbd.forward` |
| `PageUp` | `scrollbar.kbd.page-back` |
| `PageDown` | `scrollbar.kbd.page-forward` |
| `Home` | `scrollbar.kbd.start` |
| `End` | `scrollbar.kbd.end` |
| `Tab` / `Shift+Tab` | `scrollbar.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-hidden` | undefined \| 'true' |
| `thumb` | `aria-controls` | props.controls \| undefined |
| `thumb` | `aria-disabled` | 'true' \| undefined |
| `thumb` | `aria-label` | translations.thumb \| undefined |
| `thumb` | `aria-orientation` | props.orientation \| undefined |
| `thumb` | `aria-valuemax` | Math.round(max) \| undefined |
| `thumb` | `aria-valuemin` | 0 \| undefined |
| `thumb` | `aria-valuenow` | Math.round(metrics.scroll) \| undefined |
| `thumb` | `role` | 'scrollbar' \| undefined |

## Style reference

### Skin

`@xihan-ui/styles/scrollbar.css` is written against `[data-scope="scrollbar"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-scrollbar` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-anchor` | 'layer' \| undefined |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-gutter` | '' (present only while the condition holds) |
| `root` | `data-native` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-reveal-mode` | props.type |
| `root` | `data-scrolling` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'visible' \| 'hidden' |
| `track` | `data-disabled` | '' (present only while the condition holds) |
| `track` | `data-orientation` | props.orientation |
| `thumb` | `data-disabled` | '' (present only while the condition holds) |
| `thumb` | `data-dragging` | '' (present only while the condition holds) |
| `thumb` | `data-orientation` | props.orientation |
| `corner` | `data-orientation` | props.orientation |
| `corner` | `data-size` | props.size |
| `corner` | `data-state` | 'visible' \| 'hidden' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-scrollbar-corner-bg` | `corner` | `background` | `default` | `--xh-scrollbar-track-bg` |
| `--xh-scrollbar-thumb-bg` | `thumb` | `background` | `default` | `--xh-fg-scrollbar-thumb` |
| `--xh-scrollbar-thumb-bg-active` | `thumb` | `background` | `dragging` | `--xh-fg-scrollbar-thumb-active` |
| `--xh-scrollbar-thumb-bg-disabled` | `thumb` | `background` | `disabled` | `--xh-border-subtle` |
| `--xh-scrollbar-thumb-bg-hover` | `thumb` | `background` | `hover` | `--xh-fg-scrollbar-thumb-hover` |
| `--xh-scrollbar-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-scrollbar-track-bg` | `corner`<br>`track` | `background` | `default` | `--xh-bg-scrollbar-track`<br>`transparent` |
