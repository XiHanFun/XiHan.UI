# ColorPicker

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/color-picker).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="color-picker"`: `root` · `label` · `control` · `tag-list` · `trigger` · `clear-trigger` · `value-text` · `swatch` · `positioner` · **`content`** · **`saturation-area`** · **`area-thumb`** · `hue-slider` · `alpha-slider` · `channel-input` · `eye-dropper-trigger` · `swatch-picker` · `recent-swatch-picker` · `confirm-trigger` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-color-picker>` |
| Vue components | `XhColorPickerAlphaSlider` `XhColorPickerAreaThumb` `XhColorPickerChannelInput` `XhColorPickerClearTrigger` `XhColorPickerConfirmTrigger` `XhColorPickerContent` `XhColorPickerControl` `XhColorPickerEyeDropperTrigger` `XhColorPickerHiddenInput` `XhColorPickerHueSlider` `XhColorPickerItemDeleteTrigger` `XhColorPickerLabel` `XhColorPickerOverflowTag` `XhColorPickerPositioner` `XhColorPickerRecentSwatchPicker` `XhColorPickerRoot` `XhColorPickerSaturationArea` `XhColorPickerSwatch` `XhColorPickerSwatchPicker` `XhColorPickerTag` `XhColorPickerTagLabel` `XhColorPickerTagList` `XhColorPickerTrigger` `XhColorPickerValueText` |
| Composable | `useColorPicker` |
| State machine | `colorPickerMachine` |
| Skin | `@xihan-ui/styles/color-picker.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string \| string[]` |  |
| `defaultValue` | `string \| string[]` |  |
| `selectionMode` | `ColorPickerSelectionMode` |  |
| `maxSelected` | `number` |  |
| `maxTagCount` | `number` |  |
| `format` | `ColorFormat` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `swatches` | `string[]` |  |
| `inline` | `boolean` |  |
| `recentColors` | `string[]` |  |
| `defaultRecentColors` | `string[]` |  |
| `maxRecentColors` | `number` |  |
| `name` | `string` |  |
| `placeholder` | `string` |  |
| `alpha` | `boolean` |  |
| `size` | `Size` |  |
| `variant` | `ControlVariant` |  |
| `dir` | `Direction` |  |
| `placement` | `Placement` |  |
| `offset` | `number` |  |
| `translations` | `Partial<ColorPickerTranslations>` |  |
| `onValueChange` | `(details: ColorPickerValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |
| `onOpenChange` | `(details: ColorPickerOpenChangeDetails) => void` |  |
| `onRecentColorsChange` | `(details: ColorPickerRecentColorsChangeDetails) => void` |  |
| `onColorError` | `(details: ColorPickerErrorDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `ColorPickerValueChangeDetails` |
| `open-change` | `ColorPickerOpenChangeDetails` |
| `color-error` | `ColorPickerErrorDetails` |
| `recent-colors-change` | `ColorPickerRecentColorsChangeDetails` |
| `clear` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhColorPickerRoot` | `default` | `ColorPickerRootSlotProps` |
| `XhColorPickerRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhColorPickerChannelInput` | `channel` | `ColorPickerInputChannel` |  |
| `XhColorPickerPositioner` | `container` | `() => Element \| null` |  |
| `XhColorPickerRoot` | `label` | `ReactNode` |  |
| `XhColorPickerRoot` | `children` | `SlotChildren<ColorPickerRootSlotProps>` |  |
| `XhColorPickerTag` | `value` | `string` | Yes |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `label` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `value-text` | 'open' \| 'closed' |
| `swatch` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `saturation-area` | 'open' \| 'closed' |
| `area-thumb` | 'open' \| 'closed' |
| `channel-input` | 'open' \| 'closed' |
| `eye-dropper-trigger` | 'picking' \| 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `closed` · `open` · `open.idle` · `open.dragging` · `open.picking`

**Events**: `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `SELECTED.SET` · `VALUE.CLEAR` · `VALUE.ADD` · `VALUE.REMOVE` · `VALUE.TOGGLE` · `TAG_LIST.TRACKED` · `AREA.SET` · `AREA.STEP` · `AREA.TO_EDGE` · `HSVA.SET` · `INPUT.CHANGE` · `INPUT.COMMIT` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `EYE_DROPPER.OPEN` · `EYE_DROPPER.RESULT` · `EYE_DROPPER.CANCEL` · `EYE_DROPPER.ERROR` · `ERROR.CLEAR` · `SESSION.END` · `RECENT.CLEAR` · `INLINE.SYNC` · `INLINE.CLOSE` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `isOpenControlled` · `canInteract` · `canPick` · `isInline`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `value` | `string[]` |
| `selectionMode` | `ColorPickerSelectionMode` |
| `color` | `string` |
| `empty` | `boolean` |
| `valueText` | `string` |
| `rgba` | `ColorRgba` |
| `hsva` | `ColorHsva` |
| `format` | `ColorFormat` |
| `alpha` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `required` | `boolean` |
| `dragging` | `boolean` |
| `picking` | `boolean` |
| `eyeDropperSupported` | `boolean` |
| `errors` | `ColorPickerErrors` |
| `swatches` | `string[]` |
| `inline` | `boolean` |
| `recentColors` | `string[]` |
| `canAdd` | `boolean` |
| `tags` | `ColorPickerTagMeta[]` |
| `translations` | `ColorPickerTranslations` |
| `overflowCount` | `number` |
| `overflowText` | `string` |
| `hueSlider` | `ColorSliderApi<T>` |
| `alphaSlider` | `ColorSliderApi<T>` |
| `swatchPicker` | `ColorSwatchPickerApi<T>` |
| `recentSwatchPicker` | `ColorSwatchPickerApi<T>` |
| `inputText` | `(channel: ColorPickerInputChannel) => string` |
| `setOpen` | `(next: boolean) => void` |
| `setValue` | `(next: string[]) => void` |
| `add` | `() => void` |
| `deselect` | `(value: string) => void` |
| `clearError` | `() => void` |
| `clearRecentColors` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getTagListProps` | `() => T['element']` |
| `getTagProps` | `(props: ColorPickerTagProps) => T['element']` |
| `getTagLabelProps` | `() => T['element']` |
| `getOverflowTagProps` | `() => T['element']` |
| `getItemDeleteTriggerProps` | `(props: ColorPickerTagProps) => T['button']` |
| `getTriggerProps` | `() => T['button']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getValueTextProps` | `() => T['element']` |
| `getSwatchProps` | `() => T['element']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getSaturationAreaProps` | `() => T['element']` |
| `getAreaThumbProps` | `() => T['element']` |
| `getHueSliderProps` | `() => T['element']` |
| `getAlphaSliderProps` | `() => T['element']` |
| `getChannelInputProps` | `(props: ColorPickerInputProps) => T['input']` |
| `getEyeDropperTriggerProps` | `() => T['button']` |
| `getSwatchPickerProps` | `() => T['element']` |
| `getRecentSwatchPickerProps` | `() => T['element']` |
| `getConfirmTriggerProps` | `() => T['button']` |
| `getHiddenInputProps` | `(props?: ColorPickerHiddenInputProps) => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Backspace` | `color-picker.kbd.remove-last` |
| `ArrowRight` / `ArrowLeft` | `color-picker.kbd.area-saturation` |
| `ArrowUp` / `ArrowDown` | `color-picker.kbd.area-brightness` |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+ArrowUp` / `Shift+ArrowDown` | `color-picker.kbd.area-large-step` |
| `Home` / `End` | `color-picker.kbd.area-edge` |
| `Enter` | `color-picker.kbd.input-commit` |
| `Escape` | `color-picker.kbd.escape` |
| `Enter` / `Space` | `color-picker.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `trigger` | `aria-invalid` | 'true' \| 'false' |
| `trigger` | `aria-label` | props.ariaLabel |
| `trigger` | `aria-labelledby` | id of the `label` part id of the `value-text` part \| id of the `trigger` part id of the `value-text` part \| id of the `value-text` part |
| `clear-trigger` | `aria-label` | label.clearTrigger |
| `swatch` | `aria-hidden` | 'true' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | props.ariaLabel |
| `content` | `aria-labelledby` | id of the `label` part \| undefined |
| `content` | `aria-modal` | undefined \| 'false' |
| `content` | `role` | 'group' \| 'dialog' |
| `area-thumb` | `aria-disabled` | 'true' \| 'false' |
| `area-thumb` | `aria-label` | label.area |
| `area-thumb` | `aria-valuemax` | '100' |
| `area-thumb` | `aria-valuemin` | '0' |
| `area-thumb` | `aria-valuenow` | String(Math.round(hsva.s)) |
| `area-thumb` | `aria-valuetext` | label.areaValueText(Math.round(hsva.s), Math.round(hs… |
| `area-thumb` | `role` | 'slider' |
| `channel-input` | `aria-invalid` | 'true' \| 'false' |
| `channel-input` | `aria-label` | label.input(channel) |
| `eye-dropper-trigger` | `aria-label` | label.eyeDropperTrigger |
| `hidden-input` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/color-picker.css` is written against `[data-scope="color-picker"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-color-picker` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-inline` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `label` | `data-invalid` | '' (present only while the condition holds) |
| `label` | `data-readonly` | '' (present only while the condition holds) |
| `label` | `data-required` | '' (present only while the condition holds) |
| `label` | `data-state` | 'open' \| 'closed' |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-required` | '' (present only while the condition holds) |
| `control` | `data-state` | 'open' \| 'closed' |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-layout` | 'multi-tag' \| undefined |
| `control` | `data-xh-field-size` | props.size |
| `tag-list` | `data-disabled` | '' (present only while the condition holds) |
| `tag-list` | `data-instant` | '' (present only while the condition holds) |
| `tag-list` | `data-xh-tag-list` | '' |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-invalid` | '' (present only while the condition holds) |
| `trigger` | `data-readonly` | '' (present only while the condition holds) |
| `trigger` | `data-required` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
| `value-text` | `data-disabled` | '' (present only while the condition holds) |
| `value-text` | `data-invalid` | '' (present only while the condition holds) |
| `value-text` | `data-placeholder` | '' (present only while the condition holds) |
| `value-text` | `data-readonly` | '' (present only while the condition holds) |
| `value-text` | `data-required` | '' (present only while the condition holds) |
| `value-text` | `data-state` | 'open' \| 'closed' |
| `swatch` | `data-disabled` | '' (present only while the condition holds) |
| `swatch` | `data-empty` | '' (present only while the condition holds) |
| `swatch` | `data-invalid` | '' (present only while the condition holds) |
| `swatch` | `data-readonly` | '' (present only while the condition holds) |
| `swatch` | `data-required` | '' (present only while the condition holds) |
| `swatch` | `data-state` | 'open' \| 'closed' |
| `swatch` | `data-value` | undefined \| context.get('value') |
| `swatch` | `data-xh-swatch` | '' |
| `swatch` | `data-xh-swatch-size` | props.size |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-disabled` | '' (present only while the condition holds) |
| `content` | `data-inline` | '' (present only while the condition holds) |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-invalid` | '' (present only while the condition holds) |
| `content` | `data-placement` | undefined \| actual placement computed by the positioning engine |
| `content` | `data-readonly` | '' (present only while the condition holds) |
| `content` | `data-required` | '' (present only while the condition holds) |
| `content` | `data-state` | 'open' \| 'closed' |
| `saturation-area` | `data-disabled` | '' (present only while the condition holds) |
| `saturation-area` | `data-dragging` | '' (present only while the condition holds) |
| `saturation-area` | `data-invalid` | '' (present only while the condition holds) |
| `saturation-area` | `data-readonly` | '' (present only while the condition holds) |
| `saturation-area` | `data-required` | '' (present only while the condition holds) |
| `saturation-area` | `data-state` | 'open' \| 'closed' |
| `area-thumb` | `data-disabled` | '' (present only while the condition holds) |
| `area-thumb` | `data-dragging` | '' (present only while the condition holds) |
| `area-thumb` | `data-invalid` | '' (present only while the condition holds) |
| `area-thumb` | `data-readonly` | '' (present only while the condition holds) |
| `area-thumb` | `data-required` | '' (present only while the condition holds) |
| `area-thumb` | `data-state` | 'open' \| 'closed' |
| `hue-slider` | `data-channel` | 'hue' |
| `alpha-slider` | `data-channel` | 'alpha' |
| `alpha-slider` | `data-disabled` | '' (present only while the condition holds) |
| `channel-input` | `data-channel` | channel |
| `channel-input` | `data-disabled` | '' (present only while the condition holds) |
| `channel-input` | `data-invalid` | '' (present only while the condition holds) |
| `channel-input` | `data-readonly` | '' (present only while the condition holds) |
| `channel-input` | `data-required` | '' (present only while the condition holds) |
| `channel-input` | `data-state` | 'open' \| 'closed' |
| `eye-dropper-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `eye-dropper-trigger` | `data-invalid` | '' (present only while the condition holds) |
| `eye-dropper-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `eye-dropper-trigger` | `data-readonly` | '' (present only while the condition holds) |
| `eye-dropper-trigger` | `data-required` | '' (present only while the condition holds) |
| `eye-dropper-trigger` | `data-state` | 'picking' \| 'open' \| 'closed' |
| `confirm-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `confirm-trigger` | `data-xh-action-control` | '' |
| `confirm-trigger` | `data-xh-action-display` | 'always' |
| `confirm-trigger` | `data-xh-action-profile` | 'text' |
| `confirm-trigger` | `data-xh-action-size` | 'sm' |
| `confirm-trigger` | `data-xh-action-variant` | 'solid' |
| `confirm-trigger` | `data-xh-ink-surface` | '' |
| `overflow-tag` | `data-count` | String(overflowCount) |
| `tag` | `data-value` | v |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-color-picker-action-bg` | `clear-trigger`<br>`eye-dropper-trigger` | `--xh-ink-surface`<br>`background`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest`<br>`transparent` |
| `--xh-color-picker-action-bg-active` | `clear-trigger`<br>`eye-dropper-trigger` | `background`<br>`background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=picking` | `--xh-_action-variant-bg-pressed`<br>`--xh-bg-subtle-active`<br>`--xh-bg-subtle-hover` |
| `--xh-color-picker-action-bg-hover` | `clear-trigger`<br>`eye-dropper-trigger` | `background`<br>`background-color` | `disabled`<br>`hover`<br>`loading`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover`<br>`--xh-bg-subtle` |
| `--xh-color-picker-action-border` | `eye-dropper-trigger` | `border` | `default` | `--xh-border-control` |
| `--xh-color-picker-action-border-active` | `eye-dropper-trigger` | `border-color` | `state=picking` | `--xh-bg-brand` |
| `--xh-color-picker-action-fg` | `clear-trigger`<br>`eye-dropper-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-color-picker-action-fg-hover` | `clear-trigger`<br>`eye-dropper-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-color-picker-action-font-size` | `clear-trigger`<br>`eye-dropper-trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-color-picker-action-radius` | `clear-trigger`<br>`eye-dropper-trigger` | `border-radius` | `default` | `--xh-shape-control`<br>`--xh-shape-inset` |
| `--xh-color-picker-action-size` | `clear-trigger`<br>`eye-dropper-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size`<br>`--xh-control-action-size` |
| `--xh-color-picker-alpha-slider-gap` | `alpha-slider` | `gap` | `default` | `--xh-stack-gap-md` |
| `--xh-color-picker-confirm-trigger-bg` | `confirm-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-color-picker-confirm-trigger-bg-active` | `confirm-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-color-picker-confirm-trigger-bg-hover` | `confirm-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-color-picker-confirm-trigger-fg` | `confirm-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-color-picker-confirm-trigger-h` | `confirm-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-control-action-size` |
| `--xh-color-picker-confirm-trigger-px` | `confirm-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-color-picker-confirm-trigger-radius` | `confirm-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-color-picker-confirm-trigger-shadow` | `confirm-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` |
| `--xh-color-picker-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` |
| `--xh-color-picker-content-border` | `content` | `border` | `default` | `--xh-border-default` |
| `--xh-color-picker-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-color-picker-content-gap` | `content` | `gap` | `default` | `--xh-space-3` |
| `--xh-color-picker-content-px` | `content`<br>`recent-swatch-picker`<br>`saturation-area`<br>`swatch-picker` | `margin-inline`<br>`padding-inline` | `default`<br>`first-child`<br>`is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])`<br>`not(:is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])` | `--xh-space-3` |
| `--xh-color-picker-content-py` | `content`<br>`recent-swatch-picker`<br>`saturation-area`<br>`swatch-picker` | `margin-block-start`<br>`padding-block`<br>`padding-block-start` | `default`<br>`first-child`<br>`is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])`<br>`not(:is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])` | `--xh-space-3` |
| `--xh-color-picker-content-radius` | `content` | `border-radius` | `default`<br>`inline` | `--xh-shape-overlay`<br>`--xh-shape-surface` |
| `--xh-color-picker-content-shadow` | `content` | `box-shadow` | `default`<br>`inline` | `--xh-elevation-floating`<br>`none` |
| `--xh-color-picker-content-w` | `content` | `inline-size` | `default` | `--xh-overlay-max-w-sm` |
| `--xh-color-picker-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-color-picker-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-color-picker-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-color-picker-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-color-picker-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-color-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-color-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-color-picker-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-color-picker-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_color-picker-gap` |
| `--xh-color-picker-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_color-picker-h` |
| `--xh-color-picker-control-max-h` | `control` | `max-block-size` | `xh-field-layout=multi-tag` | `--xh-viewport-h-sm` |
| `--xh-color-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-color-picker-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_color-picker-px` |
| `--xh-color-picker-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-color-picker-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-color-picker-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-color-picker-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-color-picker-hue-slider-gap` | `hue-slider` | `gap` | `default` | `--xh-stack-gap-md` |
| `--xh-color-picker-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-color-picker-input-bg` | `channel-input` | `background` | `default` | `--xh-bg-field` |
| `--xh-color-picker-input-bg-disabled` | `channel-input` | `background` | `disabled` | `--xh-bg-subtle` |
| `--xh-color-picker-input-bg-focus` | `channel-input` | `background` | `focus` | `--xh-bg-surface` |
| `--xh-color-picker-input-bg-readonly` | `channel-input` | `background` | `readonly` | `--xh-bg-subtle` |
| `--xh-color-picker-input-border` | `channel-input` | `border` | `default` | `--xh-border-control` |
| `--xh-color-picker-input-border-focus` | `channel-input` | `border-color` | `focus` | `--xh-border-control-focus` |
| `--xh-color-picker-input-border-hover` | `channel-input` | `border-color` | `hover`<br>`invalid`<br>`not(:disabled, :focus, [data-readonly], [data-invalid])`<br>`readonly` | `--xh-border-strong` |
| `--xh-color-picker-input-border-invalid` | `channel-input` | `border-color` | `invalid` | `--xh-border-invalid` |
| `--xh-color-picker-input-font-size` | `channel-input` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-color-picker-input-h` | `channel-input` | `block-size` | `default` | `--xh-control-action-size` |
| `--xh-color-picker-input-px` | `channel-input` | `padding-inline` | `default` | `--xh-control-px-sm` |
| `--xh-color-picker-input-radius` | `channel-input` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-color-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-color-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-color-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-color-picker-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-color-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-color-picker-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-lg` |
| `--xh-color-picker-placeholder-fg` | `value-text` | `color` | `placeholder` | `--xh-fg-subtle` |
| `--xh-color-picker-saturation-area-h` | `saturation-area` | `block-size` | `default` | `--xh-overlay-color-area-h` |
| `--xh-color-picker-saturation-area-radius` | `content`<br>`saturation-area` | `border-radius` | `default`<br>`first-child` | `--xh-shape-control`<br>`0` |
| `--xh-color-picker-separator` | `content`<br>`recent-swatch-picker`<br>`swatch-picker` | `border-block-start` | `is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])`<br>`not(:is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])` | `--xh-material-solid-border` |
| `--xh-color-picker-slider-thumb-bg` | `alpha-slider`<br>`hue-slider`<br>`thumb` | `background` | `is([data-part='hue-slider'], [data-part='alpha-slider'])` | `--xh-bg-surface-raised` |
| `--xh-color-picker-slider-thumb-size` | `alpha-slider`<br>`hue-slider` | `--xh-_thumb-size` | `default` | `--xh-control-indicator-md` |
| `--xh-color-picker-slider-track-thickness` | `alpha-slider`<br>`hue-slider` | `--xh-_track-thickness` | `default` | `--xh-space-3` |
| `--xh-color-picker-swatch-border` | `swatch` | `--xh-swatch-border` | `default` | `--xh-border-default` |
| `--xh-color-picker-swatch-cell` | `recent-swatch-picker`<br>`swatch-picker` | `--xh-_color-swatch-picker-cell` | `@media (pointer: coarse)`<br>`is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])` | `--xh-control-h-sm`<br>`--xh-glyph-size-sm` |
| `--xh-color-picker-swatch-empty-stroke` | `swatch` | `background-image` | `empty` | `--xh-border-control` |
| `--xh-color-picker-swatch-gap` | `recent-swatch-picker`<br>`swatch-picker` | `gap` | `is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])` | `--xh-space-2` |
| `--xh-color-picker-swatch-icon-size` | `recent-swatch-picker`<br>`swatch-picker` | `--xh-icon-size` | `is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])` | `--xh-_color-swatch-picker-mark` |
| `--xh-color-picker-swatch-picker-gap` | `recent-swatch-picker`<br>`swatch-picker` | `gap` | `is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])` | `--xh-_color-swatch-picker-gap` |
| `--xh-color-picker-swatch-radius` | `swatch` | `--xh-swatch-radius` | `default` | `--xh-shape-inset` |
| `--xh-color-picker-swatch-size` | `swatch` | `--xh-swatch-size` | `default` | `--xh-_swatch-size` |
| `--xh-color-picker-tag-dot-border` | `root`<br>`tag-list` | `border` | `value` | `--xh-border-default` |
| `--xh-color-picker-tag-dot-size` | `root`<br>`tag-list` | `block-size`<br>`inline-size` | `value` | `--xh-control-indicator-sm` |
| `--xh-color-picker-tag-list-gap` | `tag-list` | `gap` | `xh-tag-list` | `--xh-space-1` |
| `--xh-color-picker-thumb-border` | `area-thumb` | `border` | `default` | `--xh-color-neutral-0` |
| `--xh-color-picker-thumb-radius` | `area-thumb` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-color-picker-thumb-scale-dragging` | `area-thumb` | `scale` | `dragging` | `--xh-motion-scale-drag` |
| `--xh-color-picker-thumb-shadow` | `area-thumb` | `box-shadow` | `default` | `--xh-elevation-raised` |
| `--xh-color-picker-thumb-size` | `area-thumb` | `block-size`<br>`inline-size`<br>`margin-block-start`<br>`margin-inline-start` | `default` | `--xh-control-indicator-md` |
| `--xh-color-picker-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` |
| `--xh-color-picker-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-color-picker-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_color-picker-gap` |
| `--xh-color-picker-value-fg` | `value-text` | `color` | `default` | `--xh-fg-default` |
| `--xh-color-picker-value-font-size` | `value-text` | `font-size` | `default` | `--xh-text-body-size` |
