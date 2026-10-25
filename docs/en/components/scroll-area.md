# ScrollArea

Layout component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/scroll-area).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/scroll-area" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/scroll-area.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/scroll-area" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/scroll-area" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/scroll-area.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="scroll-area"`: **`root`** · **`viewport`** · **`content`** · `scrollbar`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-scroll-area>` |
| Vue components | `XhScrollAreaContent` `XhScrollAreaCorner` `XhScrollAreaRoot` `XhScrollAreaScrollbar` `XhScrollAreaThumb` `XhScrollAreaTrack` `XhScrollAreaViewport` |
| Composable | `useScrollArea` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/scroll-area.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `dir` | `Direction` |  |
| `forceVisible` | `boolean` |  |
| `hideDelay` | `number` |  |
| `onReachEnd` | `(details: ScrollAreaScrollDetails) => void` |  |
| `onScrollChange` | `(details: ScrollAreaScrollDetails) => void` |  |
| `orientation` | `ScrollAreaOrientation` |  |
| `size` | `Size` |  |
| `type` | `ScrollbarType` |  |
| `variant` | `ScrollAreaVariant` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `scroll-change` | `ScrollAreaScrollDetails` |
| `reach-end` | `ScrollAreaScrollDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhScrollAreaRoot` | `default` | `ScrollAreaRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhScrollAreaRoot` | `children` | `SlotChildren<ScrollAreaRootSlotProps>` |  |
| `XhScrollAreaScrollbar` | `orientation` | `Orientation` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `scrollbar` | 'visible' \| 'hidden' |
| `corner` | 'visible' \| 'hidden' |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `type` | `ScrollbarType` |
| `orientation` | `ScrollAreaOrientation` |
| `vertical` | `ScrollAreaAxisState` |
| `horizontal` | `ScrollAreaAxisState` |
| `draggingAxis` | `Orientation \| null` |
| `cornerVisible` | `boolean` |
| `scrollTo` | `(options: ScrollAreaScrollToOptions) => void` |
| `getRootProps` | `() => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getScrollbarProps` | `(props: ScrollAreaScrollbarProps) => T['element']` |
| `getTrackProps` | `(props: ScrollAreaScrollbarProps) => T['element']` |
| `getThumbProps` | `(props: ScrollAreaScrollbarProps) => T['element']` |
| `getCornerProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `scroll-area.kbd.tab` |
| `PageUp` / `PageDown` | `scroll-area.kbd.page` |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | `scroll-area.kbd.arrow` |
| `Home` / `End` | `scroll-area.kbd.edge` |
| `Space` / `Shift+Space` | `scroll-area.kbd.space` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `scrollbar` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/scroll-area.css` is written against `[data-scope="scroll-area"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-scroll-area` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-reveal-mode` | props.type |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `viewport` | `data-at-max-horizontal` | '' (present only while the condition holds) |
| `viewport` | `data-at-max-vertical` | '' (present only while the condition holds) |
| `viewport` | `data-at-min-horizontal` | '' (present only while the condition holds) |
| `viewport` | `data-at-min-vertical` | '' (present only while the condition holds) |
| `viewport` | `data-lane-horizontal` | '' (present only while the condition holds) |
| `viewport` | `data-lane-vertical` | '' (present only while the condition holds) |
| `viewport` | `data-native` | '' (present only while the condition holds) |
| `viewport` | `data-orientation` | props.orientation |
| `viewport` | `data-size` | props.size |
| `viewport` | `data-variant` | props.variant |
| `content` | `data-orientation` | props.orientation |
| `scrollbar` | `data-dragging` | '' (present only while the condition holds) |
| `scrollbar` | `data-gutter` | '' (present only while the condition holds) |
| `scrollbar` | `data-native` | '' (present only while the condition holds) |
| `scrollbar` | `data-orientation` | axis |
| `scrollbar` | `data-reveal-mode` | props.type |
| `scrollbar` | `data-scrolling` | '' (present only while the condition holds) |
| `scrollbar` | `data-size` | props.size |
| `scrollbar` | `data-state` | 'visible' \| 'hidden' |
| `corner` | `data-state` | 'visible' \| 'hidden' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-scroll-area-fade-size` | `viewport` | `-webkit-mask-image`<br>`mask-image` | `at-max-horizontal`<br>`at-max-vertical`<br>`at-min-horizontal`<br>`at-min-vertical`<br>`not([data-at-max-horizontal])`<br>`not([data-at-max-vertical])`<br>`not([data-at-min-horizontal])`<br>`not([data-at-min-vertical])`<br>`size=lg`<br>`size=sm`<br>`variant=fade` | `--xh-space-4`<br>`--xh-space-6`<br>`--xh-space-8` |
