# Sparkline <Badge type="tip" text="new" />

Charts component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/sparkline).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/sparkline" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/sparkline.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/sparkline" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/sparkline" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/sparkline.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="sparkline"`: **`root`** · `summary` · `band` · `reference-line` · `area-fill` · `line` · `bar` · `dot`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-sparkline>` |
| Vue components | `XhSparkline` |
| Composable | `useSparkline` |
| State machine | `sparklineMachine` |
| Skin | `@xihan-ui/styles/sparkline.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `data` | `readonly (number \| null \| undefined)[] \| readonly ChartRow[]` |  |
| `x` | `string` |  |
| `y` | `string` |  |
| `variant` | `SparklineVariant` |  |
| `curve` | `SparklineCurve` |  |
| `markers` | `SparklineMarkers` |  |
| `band` | `readonly [number, number]` |  |
| `reference` | `SparklineReference` |  |
| `tone` | `Tone` |  |
| `format` | `NumberFormatSpec \| ((value: number) => string)` |  |
| `animated` | `boolean` |  |
| `locale` | `string` |  |
| `translations` | `Partial<SparklineTranslations>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'error' \| 'empty' \| undefined |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `RESIZE` · `METRICS` · `SCENE.FRAME`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `model` | `SparklineModel` |
| `scene` | `Scene` |
| `measured` | `boolean` |
| `empty` | `boolean` |
| `summary` | `string` |
| `getRootProps` | `() => T['element']` |
| `getSummaryProps` | `() => T['element']` |
| `getMarkProps` | `(mark: Mark) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-describedby` | id of the `summary` part |
| `root` | `role` | 'img' |

## Style reference

### Skin

`@xihan-ui/styles/sparkline.css` is written against `[data-scope="sparkline"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-sparkline` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-state` | 'error' \| 'empty' \| undefined |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-sparkline-accent-color` | `bar`<br>`dot`<br>`root` | `fill` | `default`<br>`marker`<br>`not([data-tone='neutral'])`<br>`tone`<br>`tone=neutral` | `--xh-_tone`<br>`--xh-chart-categorical-1` |
| `--xh-sparkline-band-bg` | `band` | `fill` | `default` | `--xh-bg-subtle` |
| `--xh-sparkline-bar-max` | `root` | `--xh-_chart-metric-bar-max` | `default` | `--xh-chart-bar-max` |
| `--xh-sparkline-bar-radius` | `root` | `--xh-_chart-metric-radius` | `default` | `--xh-shape-inset` |
| `--xh-sparkline-color` | `area-fill`<br>`bar`<br>`line`<br>`root` | `fill`<br>`stroke` | `default`<br>`not([data-tone='neutral'])`<br>`tone`<br>`tone=neutral` | `--xh-_tone`<br>`--xh-chart-deemphasis` |
| `--xh-sparkline-height` | `root` | `block-size` | `default` | `--xh-text-body-line-h`<br>`1lh` |
| `--xh-sparkline-line-width` | `legend-swatch`<br>`line`<br>`root`<br>`tooltip-swatch` | `--xh-_chart-dash`<br>`background`<br>`block-size`<br>`stroke-width` | `@media (forced-colors: active)`<br>`@media print`<br>`default`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-line-width` |
| `--xh-sparkline-marker-size` | `legend-swatch`<br>`root`<br>`tooltip-swatch` | `background` | `@media (forced-colors: active)`<br>`@media print`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-point-size` |
| `--xh-sparkline-reference-color` | `reference-line` | `stroke` | `default` | `--xh-chart-label` |
| `--xh-sparkline-width` | `root` | `inline-size` | `default` | `6rem` |
