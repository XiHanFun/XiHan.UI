# ColorSwatchPicker

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/color-swatch-picker).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-swatch-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-swatch-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-swatch-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-swatch-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-swatch-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="color-swatch-picker"`: **`root`** · `label` · **`item`** · **`swatch`** · `indicator` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-color-swatch-picker>` |
| Vue components | `XhColorSwatchPickerItem` `XhColorSwatchPickerLabel` `XhColorSwatchPickerRoot` |
| Composable | `useColorSwatchPicker` |
| State machine | `colorSwatchPickerMachine` |
| Skin | `@xihan-ui/styles/color-swatch-picker.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `swatches` | `ColorSwatchPickerNode[]` |  |
| `value` | `string \| null` |  |
| `defaultValue` | `string \| null` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `dir` | `Direction` |  |
| `name` | `string` |  |
| `size` | `Size` |  |
| `tone` | `Tone` |  |
| `translations` | `Partial<ColorSwatchPickerTranslations>` |  |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `onValueChange` | `(details: ColorSwatchPickerValueChangeDetails) => void` |  |

### ColorSwatchPickerNode

Elements of `swatches`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `disabled` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `ColorSwatchPickerValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhColorSwatchPickerRoot` | `default` | `ColorSwatchPickerRootSlotProps` |
| `XhColorSwatchPickerRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhColorSwatchPickerItem` | `value` | `string` | Yes |
| `XhColorSwatchPickerItem` | `label` | `string` |  |
| `XhColorSwatchPickerItem` | `disabled` | `boolean` |  |
| `XhColorSwatchPickerRoot` | `label` | `ReactNode` |  |
| `XhColorSwatchPickerRoot` | `children` | `SlotChildren<ColorSwatchPickerRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `swatch` | 'checked' \| 'unchecked' |
| `indicator` | 'checked' \| 'unchecked' |
| `hidden-input` | 'checked' \| 'unchecked' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `ITEM.SELECT` · `ITEM.FOCUS` · `GROUP.BLUR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string \| null` |
| `swatches` | `readonly ColorSwatchPickerNodeMeta[]` |
| `focusedValue` | `string \| null` |
| `isSelected` | `(value: string) => boolean` |
| `setValue` | `(next: string \| null) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getItemProps` | `(props: ColorSwatchPickerItemProps) => T['element']` |
| `getSwatchProps` | `(props: ColorSwatchPickerItemProps) => T['element']` |
| `getIndicatorProps` | `(props: ColorSwatchPickerItemProps) => T['element']` |
| `getHiddenInputProps` | `(props: ColorSwatchPickerItemProps) => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `color-swatch-picker.kbd.tab` |
| `ArrowDown` / `ArrowRight` | `color-swatch-picker.kbd.next` |
| `ArrowUp` / `ArrowLeft` | `color-swatch-picker.kbd.prev` |
| `Space` | `color-swatch-picker.kbd.select` |
| `Space` | `color-swatch-picker.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `aria-labelledby` | id of the `label` part \| undefined |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'radiogroup' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-label` | itemLabel(item) |
| `item` | `role` | 'radio' |
| `swatch` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/color-swatch-picker.css` is written against `[data-scope="color-swatch-picker"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-color-swatch-picker` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-invalid` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-readonly` | '' (present only while the condition holds) |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `swatch` | `data-disabled` | '' (present only while the condition holds) |
| `swatch` | `data-invalid` | '' (present only while the condition holds) |
| `swatch` | `data-readonly` | '' (present only while the condition holds) |
| `swatch` | `data-state` | 'checked' \| 'unchecked' |
| `swatch` | `data-xh-swatch` | '' |
| `swatch` | `data-xh-swatch-size` | props.size |
| `indicator` | `data-disabled` | '' (present only while the condition holds) |
| `indicator` | `data-invalid` | '' (present only while the condition holds) |
| `indicator` | `data-readonly` | '' (present only while the condition holds) |
| `indicator` | `data-state` | 'checked' \| 'unchecked' |
| `hidden-input` | `data-disabled` | '' (present only while the condition holds) |
| `hidden-input` | `data-invalid` | '' (present only while the condition holds) |
| `hidden-input` | `data-readonly` | '' (present only while the condition holds) |
| `hidden-input` | `data-state` | 'checked' \| 'unchecked' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-color-swatch-picker-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-_color-swatch-picker-gap` |
| `--xh-color-swatch-picker-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_color-swatch-picker-mark` |
| `--xh-color-swatch-picker-indicator-bg` | `indicator` | `background` | `default` | `--xh-_color-swatch-picker-accent` |
| `--xh-color-swatch-picker-indicator-border` | `indicator` | `border` | `default` | `--xh-bg-canvas` |
| `--xh-color-swatch-picker-indicator-fg` | `indicator` | `background-color`<br>`color` | `default`<br>`empty` | `--xh-_tone-on` |
| `--xh-color-swatch-picker-indicator-size` | `indicator` | `block-size`<br>`inline-size` | `default` | `--xh-_color-swatch-picker-indicator` |
| `--xh-color-swatch-picker-item-radius` | `item`<br>`swatch` | `--xh-swatch-radius`<br>`border-radius` | `default` | `--xh-shape-inset` |
| `--xh-color-swatch-picker-item-size` | `item` | `block-size`<br>`inline-size` | `default` | `--xh-_color-swatch-picker-cell` |
| `--xh-color-swatch-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-color-swatch-picker-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-color-swatch-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-color-swatch-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-color-swatch-picker-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-color-swatch-picker-ring` | `item`<br>`swatch` | `--xh-swatch-border` | `state=checked` | `--xh-_tone` |
| `--xh-color-swatch-picker-swatch-border` | `item`<br>`swatch` | `--xh-swatch-border` | `default` | `--xh-border-default` |
| `--xh-color-swatch-picker-swatch-border-hover` | `item`<br>`swatch` | `--xh-swatch-border` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly], [data-state='checked'])`<br>`readonly`<br>`state=checked` | `--xh-border-control-hover` |
| `--xh-color-swatch-picker-swatch-border-invalid` | `swatch` | `--xh-swatch-border` | `invalid` | `--xh-border-invalid` |
| `--xh-color-swatch-picker-swatch-border-pressed` | `item`<br>`swatch` | `--xh-swatch-border` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled], [data-readonly])`<br>`pressed`<br>`readonly` | `--xh-_tone` |
