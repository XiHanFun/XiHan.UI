# Slider

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/slider).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/slider" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/slider.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/slider" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/slider" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/slider.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="slider"`: **`root`** · `label` · **`control`** · **`track`** · `range` · **`thumb`** · `value-text` · `tick-group` · `tick` · `tick-label` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-slider>` |
| Vue components | `XhSliderControl` `XhSliderHiddenInput` `XhSliderLabel` `XhSliderRange` `XhSliderRoot` `XhSliderThumb` `XhSliderTickGroup` `XhSliderTrack` `XhSliderValueText` |
| Composable | `useSlider` |
| State machine | `sliderMachine` |
| Skin | `@xihan-ui/styles/slider.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `number[]` |  |
| `defaultValue` | `number[]` |  |
| `min` | `number` |  |
| `max` | `number` |  |
| `step` | `number` |  |
| `largeStep` | `number` |  |
| `orientation` | `Orientation` |  |
| `dir` | `Direction` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `name` | `string` |  |
| `minStepsBetweenThumbs` | `number` |  |
| `marks` | `SliderMark[]` |  |
| `snapToMarks` | `boolean` |  |
| `inverted` | `boolean` |  |
| `draggableRange` | `boolean` |  |
| `trackFill` | `boolean` |  |
| `getValueText` | `(details: SliderValueTextDetails) => string` |  |
| `onValueChange` | `(details: SliderValueChangeDetails) => void` |  |
| `onValueChangeEnd` | `(details: SliderValueChangeEndDetails) => void` |  |

### SliderMark

Elements of `marks`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `number` | Yes |
| `label` | `string` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `SliderValueTextDetails` |
| `value-change-end` | `SliderValueChangeEndDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhSliderRoot` | `default` | `SliderRootSlotProps` |
| `XhSliderRoot` | `label` | — |
| `XhSliderTickGroup` | `tick` | `SliderTickGroupTickSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhSliderRoot` | `label` | `ReactNode` |  |
| `XhSliderRoot` | `children` | `SlotChildren<SliderRootSlotProps>` |  |
| `XhSliderThumb` | `index` | `number \| string` |  |
| `XhSliderTickGroup` | `tick` | `SlotChildren<SliderTickSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle` · `dragging`

**Events**: `VALUE.SET` · `THUMB.STEP` · `THUMB.TO_MIN` · `THUMB.TO_MAX` · `THUMB.SET` · `THUMB.FOCUS` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `FORM.RESET`

**Guards**: `canDrag`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `number[]` |
| `range` | `{ start: number, end: number }` |
| `thumbs` | `SliderThumbState[]` |
| `marks` | `SliderMarkMeta[]` |
| `dragging` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `valueText` | `(index: number) => string` |
| `setValue` | `(next: number[]) => void` |
| `setThumbValue` | `(index: number, next: number) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getTrackProps` | `() => T['element']` |
| `getRangeProps` | `() => T['element']` |
| `getThumbProps` | `(index: number) => T['element']` |
| `getValueTextProps` | `(index: number) => T['element']` |
| `getTickGroupProps` | `() => T['element']` |
| `getTickProps` | `(props: SliderTickProps) => T['element']` |
| `getTickLabelProps` | `(props: SliderTickProps) => T['element']` |
| `getHiddenInputProps` | `(index: number) => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowRight` / `ArrowUp` | `slider.kbd.increment` |
| `ArrowLeft` / `ArrowDown` | `slider.kbd.decrement` |
| `PageUp` | `slider.kbd.large-increment` |
| `PageDown` | `slider.kbd.large-decrement` |
| `Home` | `slider.kbd.min` |
| `End` | `slider.kbd.max` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `thumb` | `aria-disabled` | 'true' \| 'false' |
| `thumb` | `aria-label` | props.ariaLabel |
| `thumb` | `aria-labelledby` | id of the `label` part \| undefined |
| `thumb` | `aria-orientation` | props.orientation |
| `thumb` | `aria-valuemax` | String(thumb.max) |
| `thumb` | `aria-valuemin` | String(thumb.min) |
| `thumb` | `aria-valuenow` | String(thumb.value) |
| `thumb` | `aria-valuetext` | prop('getValueText')?.({ value: thumb.value, index: t… |
| `thumb` | `role` | 'slider' |
| `value-text` | `aria-hidden` | 'true' |
| `tick` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/slider.css` is written against `[data-scope="slider"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-slider` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `label` | `data-dragging` | '' (present only while the condition holds) |
| `label` | `data-invalid` | '' (present only while the condition holds) |
| `label` | `data-orientation` | props.orientation |
| `label` | `data-readonly` | '' (present only while the condition holds) |
| `label` | `data-required` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-dragging` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-orientation` | props.orientation |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `track` | `data-disabled` | '' (present only while the condition holds) |
| `track` | `data-dragging` | '' (present only while the condition holds) |
| `track` | `data-invalid` | '' (present only while the condition holds) |
| `track` | `data-orientation` | props.orientation |
| `track` | `data-readonly` | '' (present only while the condition holds) |
| `range` | `data-disabled` | '' (present only while the condition holds) |
| `range` | `data-draggable` | '' (present only while the condition holds) |
| `range` | `data-dragging` | '' (present only while the condition holds) |
| `range` | `data-invalid` | '' (present only while the condition holds) |
| `range` | `data-orientation` | props.orientation |
| `range` | `data-readonly` | '' (present only while the condition holds) |
| `thumb` | `data-disabled` | '' (present only while the condition holds) |
| `thumb` | `data-dragging` | '' (present only while the condition holds) |
| `thumb` | `data-index` | String(thumb.index) |
| `thumb` | `data-invalid` | '' (present only while the condition holds) |
| `thumb` | `data-orientation` | props.orientation |
| `thumb` | `data-readonly` | '' (present only while the condition holds) |
| `value-text` | `data-disabled` | '' (present only while the condition holds) |
| `value-text` | `data-dragging` | '' (present only while the condition holds) |
| `value-text` | `data-index` | String(thumb.index) |
| `value-text` | `data-invalid` | '' (present only while the condition holds) |
| `value-text` | `data-orientation` | props.orientation |
| `value-text` | `data-readonly` | '' (present only while the condition holds) |
| `tick-group` | `data-disabled` | '' (present only while the condition holds) |
| `tick-group` | `data-dragging` | '' (present only while the condition holds) |
| `tick-group` | `data-invalid` | '' (present only while the condition holds) |
| `tick-group` | `data-orientation` | props.orientation |
| `tick-group` | `data-readonly` | '' (present only while the condition holds) |
| `tick` | `data-passed` | '' (present only while the condition holds) |
| `tick-label` | `data-passed` | '' (present only while the condition holds) |
| `hidden-input` | `data-index` | String(thumb.index) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-slider-control-gutter` | `control`<br>`root` | `margin-inline` | `has([data-part='tick-label'])`<br>`orientation=horizontal` | `--xh-space-6` |
| `--xh-slider-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-slider-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-slider-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-slider-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-slider-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-slider-label-gap` | `control`<br>`label` | `inset-block-end`<br>`inset-block-start`<br>`margin-block-end` | `@media (pointer: coarse)`<br>`default`<br>`orientation=horizontal` | `--xh-space-2` |
| `--xh-slider-range-bg` | `range` | `background` | `default` | `--xh-_tone` |
| `--xh-slider-range-bg-disabled` | `range` | `background` | `disabled` | `--xh-bg-subtle-hover-opaque` |
| `--xh-slider-range-bg-invalid` | `range` | `background` | `invalid` | `--xh-border-invalid` |
| `--xh-slider-range-radius` | `range` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-slider-thumb-bg` | `thumb` | `background` | `default` | `--xh-bg-surface` |
| `--xh-slider-thumb-bg-disabled` | `thumb` | `background` | `disabled` | `--xh-bg-surface` |
| `--xh-slider-thumb-border` | `thumb` | `border` | `default` | `--xh-_tone` |
| `--xh-slider-thumb-border-disabled` | `thumb` | `border-color` | `disabled` | `--xh-bg-subtle-hover-opaque` |
| `--xh-slider-thumb-border-invalid` | `thumb` | `border-color` | `invalid` | `--xh-border-invalid` |
| `--xh-slider-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-slider-thumb-size` | `control`<br>`root`<br>`thumb` | `block-size`<br>`inline-size`<br>`inset-block-end`<br>`inset-block-start`<br>`inset-inline`<br>`margin-block-end`<br>`margin-block-start`<br>`margin-inline-start` | `@media (pointer: coarse)`<br>`default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`size=lg`<br>`size=sm` | `--xh-track-thumb-size-lg`<br>`--xh-track-thumb-size-md`<br>`--xh-track-thumb-size-sm` |
| `--xh-slider-tick-bg` | `tick` | `background` | `default` | `--xh-bg-surface` |
| `--xh-slider-tick-border` | `tick` | `border` | `default` | `--xh-bg-subtle-hover` |
| `--xh-slider-tick-border-active` | `tick` | `border-color` | `passed` | `--xh-_tone` |
| `--xh-slider-tick-border-active-disabled` | `tick`<br>`tick-group` | `border-color` | `disabled`<br>`passed` | `--xh-bg-subtle-hover-opaque` |
| `--xh-slider-tick-border-disabled` | `tick`<br>`tick-group` | `border-color` | `disabled` | `--xh-bg-subtle` |
| `--xh-slider-tick-label-fg` | `tick-label` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-slider-tick-label-fg-active` | `tick-label` | `color` | `passed` | `--xh-fg-default` |
| `--xh-slider-tick-label-fg-disabled` | `tick-group`<br>`tick-label` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-slider-tick-label-font-size` | `tick-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-slider-tick-label-gap` | `root`<br>`tick-label` | `margin-block-start`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-space-1` |
| `--xh-slider-tick-radius` | `tick` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-slider-tick-size` | `tick` | `block-size`<br>`inline-size` | `default` | `--xh-space-2` |
| `--xh-slider-track-bg` | `track` | `background` | `default` | `--xh-bg-subtle-hover` |
| `--xh-slider-track-bg-disabled` | `track` | `background` | `disabled` | `--xh-bg-subtle` |
| `--xh-slider-track-radius` | `track` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-slider-track-thickness` | `root`<br>`track` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical`<br>`size=lg` | `--xh-stroke-strong`<br>`--xh-stroke-thick` |
| `--xh-slider-value-text-bg` | `value-text` | `background` | `default` | `--xh-_tone` |
| `--xh-slider-value-text-fg` | `value-text` | `color` | `default` | `--xh-_tone-on` |
| `--xh-slider-value-text-font-size` | `value-text` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-slider-value-text-offset` | `value-text` | `margin-block-end`<br>`margin-inline` | `default`<br>`orientation=vertical` | `--xh-space-2` |
| `--xh-slider-value-text-px` | `value-text` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-slider-value-text-py` | `value-text` | `padding-block` | `default` | `--xh-space-0_5` |
| `--xh-slider-value-text-radius` | `value-text` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-slider-vertical-length` | `control` | `block-size` | `orientation=vertical` | `10rem` |
