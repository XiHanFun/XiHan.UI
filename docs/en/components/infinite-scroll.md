# InfiniteScroll

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/infinite-scroll).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/infinite-scroll" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/infinite-scroll.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/infinite-scroll" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/infinite-scroll" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/infinite-scroll.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="infinite-scroll"`: **`root`** · **`sentinel`** · `load-more-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-infinite-scroll>` |
| Vue components | `XhInfiniteScrollLoadMoreTrigger` `XhInfiniteScrollRoot` `XhInfiniteScrollSentinel` |
| Composable | `useInfiniteScroll` |
| State machine | `infiniteScrollMachine` |
| Skin | `@xihan-ui/styles/infinite-scroll.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `distance` | `number` |  |
| `disabled` | `boolean` |  |
| `loading` | `boolean` |  |
| `onLoad` | `() => void` |  |
| `edge` | `InfiniteScrollEdge` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `load` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhInfiniteScrollRoot` | `default` | `InfiniteScrollRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhInfiniteScrollRoot` | `target` | `HTMLElement \| null` |  |
| `XhInfiniteScrollRoot` | `children` | `SlotChildren<InfiniteScrollRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle` · `loading` · `paused`

**Events**: `SENTINEL.ENTER` · `LOAD` · `MODE.SYNC` · `PRESS.START` · `PRESS.END`

**Guards**: `isPaused` · `isLoading` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `phase` | `InfiniteScrollPhase` |
| `loading` | `boolean` |
| `disabled` | `boolean` |
| `getRootProps` | `() => T['element']` |
| `getSentinelProps` | `() => T['element']` |
| `getLoadMoreTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `infinite-scroll.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `sentinel` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/infinite-scroll.css` is written against `[data-scope="infinite-scroll"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-infinite-scroll` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `load-more-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `load-more-trigger` | `data-loading` | '' (present only while the condition holds) |
| `load-more-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `load-more-trigger` | `data-xh-action-control` | '' |
| `load-more-trigger` | `data-xh-action-display` | 'always' |
| `load-more-trigger` | `data-xh-action-profile` | 'row' |
| `load-more-trigger` | `data-xh-action-size` | 'md' |
| `load-more-trigger` | `data-xh-action-variant` | 'outline' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-infinite-scroll-load-more-bg` | `load-more-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-infinite-scroll-load-more-bg-active` | `load-more-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-infinite-scroll-load-more-bg-hover` | `load-more-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-infinite-scroll-load-more-border` | `load-more-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` |
| `--xh-infinite-scroll-load-more-border-hover` | `load-more-trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` |
| `--xh-infinite-scroll-load-more-fg` | `load-more-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-infinite-scroll-load-more-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-infinite-scroll-load-more-gap` | `load-more-trigger` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-infinite-scroll-load-more-h` | `load-more-trigger` | `block-size`<br>`min-block-size` | `default`<br>`xh-action-profile=row` | `--xh-_action-profile-visual-size` |
| `--xh-infinite-scroll-load-more-icon-size` | `load-more-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-infinite-scroll-load-more-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-infinite-scroll-load-more-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` |
| `--xh-infinite-scroll-sentinel-size` | `sentinel` | `block-size` | `default` | `--xh-stroke-thin` |
