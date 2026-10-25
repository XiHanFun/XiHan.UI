# LoadingBar

Feedback component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/loading-bar).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/loading-bar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/loading-bar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/loading-bar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/loading-bar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/loading-bar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="loading-bar"`: **`root`** · `track` · **`range`** · `peg`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-loading-bar>` |
| Vue components | `XhLoadingBarPeg` `XhLoadingBarRange` `XhLoadingBarRoot` `XhLoadingBarTrack` |
| Composable | `useLoadingBar` |
| State machine | `loadingBarMachine` |
| Skin | `@xihan-ui/styles/loading-bar.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `value` | `number` |  |
| `defaultValue` | `number` |  |
| `loading` | `boolean` |  |
| `height` | `string \| number` |  |
| `tone` | `Tone` |  |
| `trickle` | `boolean` |  |
| `trickleSpeed` | `number` |  |
| `minimum` | `number` |  |
| `fadeDuration` | `number` |  |
| `translations` | `Partial<LoadingBarTranslations>` |  |
| `onValueChange` | `(details: LoadingBarValueChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `LoadingBarValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhLoadingBarRoot` | `default` | `LoadingBarRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhLoadingBarRoot` | `children` | `SlotChildren<LoadingBarRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'idle' \| 'loading' \| 'complete' \| 'finishing' |
| `track` | 'idle' \| 'loading' \| 'complete' \| 'finishing' |
| `range` | 'idle' \| 'loading' \| 'complete' \| 'finishing' |
| `peg` | 'idle' \| 'loading' \| 'complete' \| 'finishing' |

The following names are internal to the state machine.

**States**: `idle` · `loading` · `complete` · `finishing`

**Events**: `LOADING.START` · `LOADING.END` · `TRICKLE.SYNC` · `after.trickleSpeed` · `FILL.DONE` · `FADE.DONE`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `phase` | `LoadingBarPhase` |
| `value` | `number` |
| `visible` | `boolean` |
| `indeterminate` | `boolean` |
| `getRootProps` | `() => T['element']` |
| `getTrackProps` | `() => T['element']` |
| `getRangeProps` | `() => T['element']` |
| `getPegProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/TR/wai-aria-1.2/#progressbar). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | translations.root |
| `root` | `aria-valuemax` | String(LOADING_BAR_MAX) |
| `root` | `aria-valuemin` | '0' |
| `root` | `aria-valuenow` | String(value) \| undefined |
| `root` | `role` | 'progressbar' |
| `peg` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/loading-bar.css` is written against `[data-scope="loading-bar"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-loading-bar` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-indeterminate` | '' (present only while the condition holds) |
| `root` | `data-state` | 'idle' \| 'loading' \| 'complete' \| 'finishing' |
| `root` | `data-tone` | props.tone |
| `track` | `data-state` | 'idle' \| 'loading' \| 'complete' \| 'finishing' |
| `range` | `data-state` | 'idle' \| 'loading' \| 'complete' \| 'finishing' |
| `peg` | `data-state` | 'idle' \| 'loading' \| 'complete' \| 'finishing' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-loading-bar-fade` | `root` | `transition` | `default` | `--xh-motion-duration-exit` |
| `--xh-loading-bar-layer` | `root` | `z-index` | `default` | `--xh-layer-sticky` |
| `--xh-loading-bar-peg-fg` | `peg` | `background` | `default` | `--xh-loading-bar-range` |
| `--xh-loading-bar-peg-w` | `peg` | `inline-size` | `default` | `--xh-space-8` |
| `--xh-loading-bar-range` | `peg`<br>`range` | `background` | `default` | `--xh-_tone-soft` |
| `--xh-loading-bar-range-radius` | `range` | `border-end-end-radius`<br>`border-start-end-radius` | `default` | `--xh-shape-pill` |
| `--xh-loading-bar-speed` | `range` | `transition` | `default` | `--xh-motion-duration-move` |
| `--xh-loading-bar-track` | `track` | `background` | `default` | `transparent` |
