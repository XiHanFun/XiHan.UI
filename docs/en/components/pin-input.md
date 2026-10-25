# PinInput

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/pin-input).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/pin-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/pin-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/pin-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/pin-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/pin-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="pin-input"`: **`root`** · `label` · `group` · **`input`** · `separator` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-pin-input>` |
| Vue components | `XhPinInputGroup` `XhPinInputHiddenInput` `XhPinInputInput` `XhPinInputLabel` `XhPinInputRoot` `XhPinInputSeparator` |
| Composable | `usePinInput` |
| State machine | `pinInputMachine` |
| Skin | `@xihan-ui/styles/pin-input.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string[]` |  |
| `defaultValue` | `string[]` |  |
| `length` | `number` |  |
| `type` | `PinInputType` |  |
| `pattern` | `string` |  |
| `mask` | `boolean` |  |
| `otp` | `boolean` |  |
| `placeholder` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `invalid` | `boolean` |  |
| `blurOnComplete` | `boolean` |  |
| `name` | `string` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<PinInputTranslations>` |  |
| `onValueChange` | `(details: PinInputValueChangeDetails) => void` |  |
| `onValueComplete` | `(details: PinInputValueChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `PinInputValueChangeDetails` |
| `value-complete` | `PinInputValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhPinInputRoot` | `default` | `PinInputRootSlotProps` |
| `XhPinInputRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhPinInputInput` | `index` | `number \| string` | Yes |
| `XhPinInputRoot` | `label` | `ReactNode` |  |
| `XhPinInputRoot` | `children` | `SlotChildren<PinInputRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `VALUE.FILL` · `VALUE.CLEAR_AT` · `VALUE.CLEAR` · `INPUT.FOCUS` · `INPUT.BLUR` · `FORM.RESET`

**Guards**: `canEdit`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string[]` |
| `valueAsString` | `string` |
| `complete` | `boolean` |
| `length` | `number` |
| `focusedIndex` | `number` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `setValue` | `(next: string[]) => void` |
| `clear` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getGroupProps` | `() => T['element']` |
| `getInputProps` | `(props: PinInputInputProps) => T['input']` |
| `getSeparatorProps` | `() => T['element']` |
| `getHiddenInputProps` | `() => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#textbox). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowRight` | `pin-input.kbd.next` |
| `ArrowLeft` | `pin-input.kbd.prev` |
| `Home` | `pin-input.kbd.first` |
| `End` | `pin-input.kbd.last` |
| `Backspace` | `pin-input.kbd.backspace` |
| `Delete` | `pin-input.kbd.delete` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `aria-labelledby` | id of the `label` part \| undefined |
| `root` | `role` | 'group' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | label.input(index + 1, length) |
| `separator` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/pin-input.css` is written against `[data-scope="pin-input"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-pin-input` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-complete` | '' (present only while the condition holds) |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `group` | `data-disabled` | '' (present only while the condition holds) |
| `group` | `data-invalid` | '' (present only while the condition holds) |
| `input` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-empty` | '' (present only while the condition holds) |
| `input` | `data-focus` | '' (present only while the condition holds) |
| `input` | `data-index` | String(index) |
| `input` | `data-invalid` | '' (present only while the condition holds) |
| `input` | `data-readonly` | '' (present only while the condition holds) |
| `input` | `data-variant` | props.variant |
| `input` | `data-xh-field-chrome` | '' |
| `input` | `data-xh-field-size` | props.size |
| `separator` | `data-disabled` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-pin-input-box-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-canvas` |
| `--xh-pin-input-box-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` |
| `--xh-pin-input-box-bg` | `input` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-pin-input-box-bg-disabled` | `input` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-pin-input-box-bg-hover` | `input` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-pin-input-box-bg-readonly` | `input` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-pin-input-box-border` | `input` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-pin-input-box-border-complete` | `input`<br>`root` | `border-color` | `complete`<br>`invalid`<br>`not([data-invalid], :disabled)` | `--xh-_pin-input-accent` |
| `--xh-pin-input-box-border-focus` | `input` | `border-color` | `disabled`<br>`focus`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-pin-input-box-border-hover` | `input` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-pin-input-box-border-invalid` | `input` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-pin-input-box-fg` | `input` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-pin-input-box-font-size` | `input` | `font-size` | `default` | `--xh-_pin-input-box-font-size` |
| `--xh-pin-input-box-gap` | `input` | `margin-inline-start` | `default` | `--xh-_pin-input-box-gap` |
| `--xh-pin-input-box-radius` | `input` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-pin-input-box-shadow` | `input` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-pin-input-box-size` | `input` | `block-size`<br>`inline-size`<br>`min-block-size` | `default`<br>`has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_pin-input-box-size` |
| `--xh-pin-input-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-pin-input-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-pin-input-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-pin-input-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-pin-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-pin-input-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-pin-input-placeholder-fg` | `input` | `color` | `placeholder` | `--xh-fg-subtle` |
| `--xh-pin-input-separator-fg` | `separator` | `color` | `default` | `--xh-fg-muted` |
| `--xh-pin-input-separator-fg-disabled` | `separator` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-pin-input-separator-font-size` | `separator` | `font-size` | `default` | `--xh-_pin-input-box-font-size` |
| `--xh-pin-input-separator-gap` | `separator` | `margin-inline` | `default` | `--xh-_pin-input-box-gap` |
