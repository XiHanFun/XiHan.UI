# Spinner

Feedback component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/spinner).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/spinner" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/spinner.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/spinner" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/spinner" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/spinner.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="spinner"`: **`root`** · `label`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-spinner>` |
| Vue components | `XhSpinner` `XhSpinnerLabel` |
| State machine | `spinnerMachine` |
| Skin | `@xihan-ui/styles/spinner.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `delay` | `number` |  |
| `label` | `string` |  |
| `orientation` | `Orientation` |  |
| `size` | `Size` |  |
| `tone` | `Tone` |  |
| `translations` | `Partial<SpinnerTranslations>` |  |
| `variant` | `SpinnerVariant` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'visible' \| 'hidden' |

The following names are internal to the state machine.

**States**: `waiting` · `visible`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `label` | `string` |
| `visible` | `boolean` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | resolveLabel(props) |
| `root` | `aria-live` | 'polite' |
| `root` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/spinner.css` is written against `[data-scope="spinner"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-spinner` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'visible' \| 'hidden' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-spinner-duration` | `root` | `animation` | `default`<br>`variant=dots` | `--xh-motion-loop-spin` |
| `--xh-spinner-fg` | `root` | `background`<br>`border`<br>`border-color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`motion=reduce`<br>`tone`<br>`variant=arc`<br>`variant=dots`<br>`where([data-motion='reduce'])` | `--xh-_tone`<br>`--xh-fg-brand` |
| `--xh-spinner-gap` | `root` | `gap` | `default`<br>`orientation=vertical` | `--xh-control-gap-md`<br>`--xh-space-1_5` |
| `--xh-spinner-label-fg` | `label` | `color` | `default` | `--xh-fg-brand` |
| `--xh-spinner-label-size` | `label` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-spinner-label-weight` | `label` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-spinner-radius` | `root` | `border-radius` | `@media (forced-colors: active)`<br>`default`<br>`tone`<br>`variant=arc`<br>`variant=dots` | `--xh-shape-circle` |
| `--xh-spinner-size` | `root` | `block-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` |
| `--xh-spinner-thickness` | `root` | `-webkit-mask`<br>`border`<br>`mask` | `@media (forced-colors: active)`<br>`default`<br>`tone`<br>`variant=arc`<br>`variant=dots` | `--xh-stroke-thick` |
| `--xh-spinner-track` | `root` | `border-block-start-color` | `default`<br>`tone` | `transparent` |
