# Progress

Feedback component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/progress).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/progress" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/progress.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/progress" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/progress" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/progress.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="progress"`: **`root`** · `canvas` · `track` · `range` · `buffer` · `label` · `threshold` · `target` · `scale` · `scale-tick` · `scale-label` · `needle`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-progress>` |
| Vue components | `XhProgress` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/progress.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `buffer` | `number` |  |
| `gapDegree` | `number` |  |
| `gapPosition` | `ProgressGapPosition` |  |
| `indeterminate` | `boolean` |  |
| `indicator` | `ProgressIndicator` |  |
| `locale` | `string` |  |
| `max` | `number` |  |
| `scale` | `boolean \| ProgressScaleOptions` |  |
| `semantics` | `ProgressSemantics` |  |
| `size` | `Size` |  |
| `steps` | `number` |  |
| `striped` | `boolean` |  |
| `strokeWidth` | `number` |  |
| `target` | `number` |  |
| `thresholds` | `readonly ProgressThreshold[]` |  |
| `tone` | `Tone` |  |
| `translations` | `Partial<ProgressTranslations>` |  |
| `value` | `number` |  |
| `valueText` | `string` |  |
| `variant` | `ProgressVariant` |  |

### ProgressThreshold

Elements of `thresholds`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `number` | Yes |
| `tone` | `Tone` | Yes |
| `label` | `string` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'indeterminate' \| 'complete' \| 'loading' |
| `label` | 'complete' \| 'loading' |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `variant` | `ProgressVariant` |
| `semantics` | `ProgressSemantics` |
| `ratio` | `number` |
| `percent` | `number` |
| `steps` | `number` |
| `buffer` | `number \| null` |
| `getRootProps` | `() => T['element']` |
| `getCanvasProps` | `() => T['element']` |
| `getTrackProps` | `() => T['element']` |
| `getRangeProps` | `() => T['element']` |
| `getBufferProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `bands` | `readonly ProgressBand[]` |
| `ticks` | `readonly ProgressTick[]` |
| `target` | `number \| null` |
| `indicator` | `ProgressIndicator` |
| `getThresholdProps` | `(band: ProgressBand) => T['element']` |
| `getTargetProps` | `() => T['element']` |
| `getScaleProps` | `() => T['element']` |
| `getScaleTickProps` | `(tick: ProgressTick) => T['element']` |
| `getScaleLabelProps` | `(tick: ProgressTick) => T['element']` |
| `getNeedleProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/meter/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-valuemax` | String(max) |
| `root` | `aria-valuemin` | '0' |
| `root` | `aria-valuenow` | undefined \| String(value) |
| `root` | `aria-valuetext` | props.valueText |
| `root` | `role` | 'meter' \| 'progressbar' |
| `canvas` | `aria-hidden` | 'true' |
| `scale` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/progress.css` is written against `[data-scope="progress"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-progress` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-banded` | '' (present only while the condition holds) |
| `root` | `data-indicator` | 'needle' \| undefined |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'indeterminate' \| 'complete' \| 'loading' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `canvas` | `data-variant` | props.variant |
| `track` | `data-stepped` | '' (present only while the condition holds) |
| `range` | `data-empty` | '' (present only while the condition holds) |
| `range` | `data-indicator` | 'needle' \| undefined |
| `range` | `data-striped` | '' (present only while the condition holds) |
| `range` | `data-tone` | active?.tone |
| `buffer` | `data-tone` | props.tone |
| `buffer` | `data-variant` | props.variant |
| `label` | `data-indicator` | 'needle' \| undefined |
| `label` | `data-state` | 'complete' \| 'loading' |
| `label` | `data-variant` | props.variant |
| `threshold` | `data-tone` | band.tone |
| `threshold` | `data-variant` | props.variant |
| `target` | `data-variant` | props.variant |
| `scale` | `data-variant` | props.variant |
| `scale-tick` | `data-variant` | props.variant |
| `scale-label` | `data-variant` | props.variant |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-progress-buffer` | `buffer` | `background` | `default` | `--xh-_tone-subtle-active` |
| `--xh-progress-buffer-radius` | `buffer` | `border-radius` | `default` | `--xh-progress-range-radius` |
| `--xh-progress-indeterminate-duration` | `range` | `animation` | `state=indeterminate` | `--xh-motion-loop-shimmer` |
| `--xh-progress-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-progress-label-font-size` | `label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-progress-linecap` | `range` | `stroke-linecap` | `variant=circle`<br>`variant=dashboard` | `round` |
| `--xh-progress-needle-color` | `needle` | `fill` | `default` | `--xh-fg-default` |
| `--xh-progress-range` | `range` | `background`<br>`stroke` | `default`<br>`variant=circle`<br>`variant=dashboard` | `--xh-_tone` |
| `--xh-progress-range-radius` | `buffer`<br>`range` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-progress-size` | `root` | `block-size`<br>`inline-size` | `size=lg`<br>`size=sm`<br>`variant=circle`<br>`variant=dashboard` | `10rem`<br>`5rem`<br>`7.5rem` |
| `--xh-progress-step-gap` | `track` | `-webkit-mask-image`<br>`mask-image` | `stepped` | `--xh-space-0_5` |
| `--xh-progress-stripe-color` | `range` | `background-image` | `striped` | `--xh-_tone-active` |
| `--xh-progress-stripe-duration` | `range` | `animation` | `state=loading`<br>`striped` | `--xh-motion-loop-shimmer` |
| `--xh-progress-stripe-size` | `range` | `background-position`<br>`background-size` | `@keyframes xh-progress-stripes`<br>`striped` | `--xh-space-4` |
| `--xh-progress-target-color` | `target` | `background`<br>`stroke` | `variant=circle`<br>`variant=dashboard`<br>`variant=line` | `--xh-fg-default` |
| `--xh-progress-target-radius` | `target` | `border-radius` | `variant=line` | `--xh-shape-pill` |
| `--xh-progress-thickness` | `root`<br>`target`<br>`track` | `block-size` | `banded`<br>`default`<br>`size=lg`<br>`size=sm`<br>`variant=line` | `--xh-track-band-thickness-lg`<br>`--xh-track-band-thickness-md`<br>`--xh-track-band-thickness-sm`<br>`--xh-track-thickness-lg`<br>`--xh-track-thickness-md`<br>`--xh-track-thickness-sm` |
| `--xh-progress-threshold-color` | `threshold` | `background`<br>`stroke` | `variant=circle`<br>`variant=dashboard`<br>`variant=line` | `--xh-_tone-subtle-active` |
| `--xh-progress-track` | `track` | `background`<br>`stroke` | `default`<br>`variant=circle`<br>`variant=dashboard` | `--xh-bg-subtle-hover` |
| `--xh-progress-track-radius` | `track` | `border-radius` | `default` | `--xh-shape-pill` |
