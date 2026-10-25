# ColorSlider

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/color-slider).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-slider" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-slider.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-slider" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-slider" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-slider.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="color-slider"`: `root` · `label` · **`control`** · **`track`** · **`thumb`** · `value-text` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-color-slider>` |
| Vue components | `XhColorSliderControl` `XhColorSliderHiddenInput` `XhColorSliderLabel` `XhColorSliderRoot` `XhColorSliderThumb` `XhColorSliderTrack` `XhColorSliderValueText` |
| Composable | `useColorSlider` |
| State machine | `colorSliderMachine` |
| Skin | `@xihan-ui/styles/color-slider.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string` |  |
| `defaultValue` | `string` |  |
| `channel` | `ColorChannel` |  |
| `format` | `ColorFormat` |  |
| `hsva` | `ColorHsva` |  |
| `alpha` | `boolean` |  |
| `orientation` | `Orientation` |  |
| `dir` | `Direction` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `size` | `Size` |  |
| `name` | `string` |  |
| `translations` | `Partial<ColorSliderTranslations>` |  |
| `onValueChange` | `(details: ColorSliderValueChangeDetails) => void` |  |
| `onValueChangeEnd` | `(details: ColorSliderValueChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `ColorSliderValueChangeDetails` |
| `value-change-end` | `ColorSliderValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhColorSliderRoot` | `default` | `ColorSliderRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhColorSliderRoot` | `children` | `SlotChildren<ColorSliderRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `CHANNEL.SET` · `CHANGE.END` · `FORM.RESET`

**Guards**: `canInteract`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string` |
| `channel` | `ColorChannel` |
| `channelValue` | `number` |
| `percent` | `number` |
| `min` | `number` |
| `max` | `number` |
| `hsva` | `ColorHsva` |
| `rgba` | `ColorRgba` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `dragging` | `boolean` |
| `setValue` | `(next: string) => void` |
| `setChannelValue` | `(next: number) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getTrackProps` | `() => T['element']` |
| `getThumbProps` | `() => T['element']` |
| `getValueTextProps` | `() => T['element']` |
| `getHiddenInputProps` | `() => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowRight` / `ArrowUp` | `color-slider.kbd.increment` |
| `ArrowLeft` / `ArrowDown` | `color-slider.kbd.decrement` |
| `PageUp` | `color-slider.kbd.large-increment` |
| `PageDown` | `color-slider.kbd.large-decrement` |
| `Home` | `color-slider.kbd.min` |
| `End` | `color-slider.kbd.max` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `thumb` | `aria-disabled` | 'true' \| 'false' |
| `thumb` | `aria-label` | props.ariaLabel |
| `thumb` | `aria-labelledby` | id of the `label` part \| undefined |
| `thumb` | `aria-orientation` | props.orientation |
| `thumb` | `aria-valuemax` | String(range.max) |
| `thumb` | `aria-valuemin` | String(range.min) |
| `thumb` | `aria-valuenow` | String(channelValue) |
| `thumb` | `aria-valuetext` | label.valueText(channel, channelValue) |
| `thumb` | `role` | 'slider' |
| `value-text` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/color-slider.css` is written against `[data-scope="color-slider"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-color-slider` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-channel` | colorToChannel(prop('channel')) |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-value` | context.get('value') |
| `label` | `data-channel` | colorToChannel(prop('channel')) |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `label` | `data-dragging` | '' (present only while the condition holds) |
| `label` | `data-invalid` | '' (present only while the condition holds) |
| `label` | `data-orientation` | props.orientation |
| `label` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-channel` | colorToChannel(prop('channel')) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-dragging` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-orientation` | props.orientation |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `track` | `data-channel` | colorToChannel(prop('channel')) |
| `track` | `data-disabled` | '' (present only while the condition holds) |
| `track` | `data-dragging` | '' (present only while the condition holds) |
| `track` | `data-invalid` | '' (present only while the condition holds) |
| `track` | `data-orientation` | props.orientation |
| `track` | `data-readonly` | '' (present only while the condition holds) |
| `thumb` | `data-channel` | colorToChannel(prop('channel')) |
| `thumb` | `data-disabled` | '' (present only while the condition holds) |
| `thumb` | `data-dragging` | '' (present only while the condition holds) |
| `thumb` | `data-invalid` | '' (present only while the condition holds) |
| `thumb` | `data-orientation` | props.orientation |
| `thumb` | `data-readonly` | '' (present only while the condition holds) |
| `value-text` | `data-channel` | colorToChannel(prop('channel')) |
| `value-text` | `data-disabled` | '' (present only while the condition holds) |
| `value-text` | `data-dragging` | '' (present only while the condition holds) |
| `value-text` | `data-invalid` | '' (present only while the condition holds) |
| `value-text` | `data-orientation` | props.orientation |
| `value-text` | `data-readonly` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-color-slider-checker` | `track` | `background-image` | `channel=alpha` | `--xh-bg-subtle` |
| `--xh-color-slider-checker-base` | `track` | `background-color` | `channel=alpha` | `--xh-bg-surface` |
| `--xh-color-slider-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-color-slider-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-color-slider-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-color-slider-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-color-slider-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-color-slider-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-color-slider-thumb-bg` | `thumb` | `background` | `default` | `--xh-_color-slider-thumb-color` |
| `--xh-color-slider-thumb-border` | `thumb` | `border` | `default` | `--xh-border-default-opaque` |
| `--xh-color-slider-thumb-border-invalid` | `thumb` | `border-color` | `invalid` | `--xh-border-invalid` |
| `--xh-color-slider-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-color-slider-thumb-scale-dragging` | `thumb`<br>`value-text` | `scale` | `dragging` | `--xh-motion-scale-drag` |
| `--xh-color-slider-thumb-shadow` | `thumb` | `box-shadow` | `default` | `--xh-elevation-raised` |
| `--xh-color-slider-thumb-shadow-disabled` | `thumb` | `box-shadow` | `disabled` | `none` |
| `--xh-color-slider-thumb-shadow-dragging` | `thumb` | `box-shadow` | `dragging` | `--xh-elevation-lifted` |
| `--xh-color-slider-thumb-size` | `control`<br>`root`<br>`thumb` | `block-size`<br>`inline-size`<br>`margin-block-end`<br>`margin-block-start`<br>`margin-inline-start` | `default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`size=lg`<br>`size=sm` | `--xh-space-3`<br>`--xh-space-6`<br>`--xh-track-thumb-size` |
| `--xh-color-slider-track-border` | `track` | `box-shadow` | `default` | `--xh-border-default` |
| `--xh-color-slider-track-radius` | `track` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-color-slider-track-thickness` | `control`<br>`root`<br>`track` | `block-size`<br>`inline-size` | `default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`size=lg`<br>`size=sm` | `--xh-space-2`<br>`--xh-space-3`<br>`--xh-space-4` |
| `--xh-color-slider-value-text-bg` | `value-text` | `background` | `default` | `--xh-bg-brand` |
| `--xh-color-slider-value-text-fg` | `value-text` | `color` | `default` | `--xh-fg-on-brand` |
| `--xh-color-slider-value-text-font-size` | `value-text` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-color-slider-value-text-offset` | `value-text` | `margin-block-end`<br>`margin-inline` | `default`<br>`orientation=vertical` | `--xh-space-2` |
| `--xh-color-slider-value-text-px` | `value-text` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-color-slider-value-text-py` | `value-text` | `padding-block` | `default` | `--xh-space-0_5` |
| `--xh-color-slider-value-text-radius` | `value-text` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-color-slider-vertical-length` | `control` | `block-size` | `orientation=vertical` | `--xh-overlay-menu-min-w` |
