# NumberField

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/number-field).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/number-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/number-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/number-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/number-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/number-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="number-field"`: **`root`** · `label` · **`control`** · `prefix` · **`input`** · `suffix` · `increment-trigger` · `decrement-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-number-field>` |
| Vue components | `XhNumberFieldControl` `XhNumberFieldDecrementTrigger` `XhNumberFieldIncrementTrigger` `XhNumberFieldInput` `XhNumberFieldLabel` `XhNumberFieldPrefix` `XhNumberFieldRoot` `XhNumberFieldSuffix` |
| Composable | `useNumberField` |
| State machine | `numberFieldMachine` |
| Skin | `@xihan-ui/styles/number-field.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string` |  |
| `defaultValue` | `string` |  |
| `min` | `number` |  |
| `max` | `number` |  |
| `step` | `number` |  |
| `largeStep` | `number` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `invalid` | `boolean` |  |
| `name` | `string` |  |
| `placeholder` | `string` |  |
| `changeDelay` | `number` |  |
| `changeInterval` | `number` |  |
| `minChangeInterval` | `number` |  |
| `clampValueOnBlur` | `boolean` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `parse` | `(text: string) => number` |  |
| `format` | `(value: number) => string` |  |
| `onValueChange` | `(details: NumberFieldValueChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `NumberFieldValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhNumberFieldRoot` | `default` | `NumberFieldRootSlotProps` |
| `XhNumberFieldRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhNumberFieldRoot` | `label` | `ReactNode` |  |
| `XhNumberFieldRoot` | `children` | `SlotChildren<NumberFieldRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle` · `spinning`

**Events**: `VALUE.SET` · `VALUE.STEP` · `VALUE.TO_MIN` · `VALUE.TO_MAX` · `INPUT.BLUR` · `PRESS.START` · `PRESS.END` · `after.changeInterval` · `FORM.RESET` · `TRIGGER.PRESS.START` · `TRIGGER.PRESS.END`

**Guards**: `canStep` · `canPressTrigger`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string` |
| `valueAsNumber` | `number` |
| `empty` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `canIncrement` | `boolean` |
| `canDecrement` | `boolean` |
| `outOfRange` | `boolean` |
| `setValue` | `(next: string) => void` |
| `increment` | `() => void` |
| `decrement` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getPrefixProps` | `() => T['element']` |
| `getInputProps` | `() => T['input']` |
| `getSuffixProps` | `() => T['element']` |
| `getIncrementTriggerProps` | `() => T['button']` |
| `getDecrementTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowUp` | `number-field.kbd.increment` |
| `ArrowDown` | `number-field.kbd.decrement` |
| `PageUp` | `number-field.kbd.large-increment` |
| `PageDown` | `number-field.kbd.large-decrement` |
| `Home` | `number-field.kbd.min` |
| `End` | `number-field.kbd.max` |
| `Enter` / `Space` | `number-field.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `prefix` | `aria-hidden` | 'true' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.ariaLabel |
| `input` | `aria-labelledby` | id of the `label` part \| undefined |
| `input` | `aria-valuemax` | props.max |
| `input` | `aria-valuemin` | props.min |
| `input` | `aria-valuenow` | undefined \| decodeNumber(value, { parse: prop('parse'), format: p… |
| `input` | `role` | 'spinbutton' |
| `suffix` | `aria-hidden` | 'true' |
| `increment-trigger` | `aria-hidden` | 'true' |
| `decrement-trigger` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/number-field.css` is written against `[data-scope="number-field"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-number-field` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-out-of-range` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-action-owner` | '' |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `prefix` | `data-disabled` | '' (present only while the condition holds) |
| `prefix` | `data-xh-field-affix` | 'prefix' |
| `input` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-invalid` | '' (present only while the condition holds) |
| `input` | `data-readonly` | '' (present only while the condition holds) |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'single-line' |
| `suffix` | `data-disabled` | '' (present only while the condition holds) |
| `suffix` | `data-xh-field-affix` | 'suffix' |
| `increment-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `increment-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `increment-trigger` | `data-xh-action-control` | '' |
| `increment-trigger` | `data-xh-action-display` | 'hover-focus' |
| `increment-trigger` | `data-xh-action-profile` | 'field-inset' |
| `increment-trigger` | `data-xh-action-size` | props.size |
| `increment-trigger` | `data-xh-action-variant` | 'ghost' |
| `decrement-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `decrement-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `decrement-trigger` | `data-xh-action-control` | '' |
| `decrement-trigger` | `data-xh-action-display` | 'hover-focus' |
| `decrement-trigger` | `data-xh-action-profile` | 'field-inset' |
| `decrement-trigger` | `data-xh-action-size` | props.size |
| `decrement-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-number-field-affix-fg` | `prefix`<br>`suffix` | `color` | `xh-field-affix` | `--xh-fg-muted` |
| `--xh-number-field-affix-fg-disabled` | `prefix`<br>`suffix` | `color` | `disabled`<br>`xh-field-affix` | `--xh-fg-disabled` |
| `--xh-number-field-affix-font-size` | `prefix`<br>`suffix` | `font-size` | `xh-field-affix` | `--xh-_number-field-font-size` |
| `--xh-number-field-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-number-field-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-number-field-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-number-field-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-number-field-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-number-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-number-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-number-field-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-number-field-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-number-field-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_number-field-gap` |
| `--xh-number-field-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_number-field-h` |
| `--xh-number-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-number-field-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `0` |
| `--xh-number-field-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-number-field-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-number-field-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-number-field-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-number-field-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-number-field-input-align` | `control`<br>`input` | `text-align` | `default` | `start` |
| `--xh-number-field-input-autofill-bg` | `control`<br>`input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` |
| `--xh-number-field-input-autofill-fg` | `control`<br>`input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` |
| `--xh-number-field-input-fg` | `control`<br>`input` | `color` | `xh-field-input` | `--xh-fg-default` |
| `--xh-number-field-input-font-size` | `control`<br>`input` | `font-size` | `xh-field-input` | `--xh-_number-field-font-size` |
| `--xh-number-field-input-px` | `control`<br>`input` | `padding-inline` | `default` | `--xh-_number-field-px` |
| `--xh-number-field-input-w` | `control`<br>`input` | `inline-size` | `default` | `5em` |
| `--xh-number-field-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-number-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-number-field-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-number-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-number-field-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-number-field-placeholder-fg` | `control`<br>`input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-number-field-stepper-bg` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `--xh-ink-surface`<br>`background-color` | `@media (hover: hover) and (pointer: fine)`<br>`disabled`<br>`xh-ink-surface` | `--xh-bg-subtle` |
| `--xh-number-field-stepper-bg-hover` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `background-color` | `@media (hover: hover) and (pointer: fine)`<br>`disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle-hover` |
| `--xh-number-field-stepper-inset` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `block-size`<br>`inset-block-end`<br>`inset-block-start`<br>`inset-inline-end`<br>`padding-inline-end` | `@media (hover: hover) and (pointer: fine)`<br>`has([data-part='increment-trigger'], [data-part='decrement-trigger'])` | `--xh-_number-field-stepper-inset` |
| `--xh-number-field-stepper-w` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `inline-size`<br>`padding-inline-end` | `@media (hover: hover) and (pointer: fine)`<br>`has([data-part='increment-trigger'], [data-part='decrement-trigger'])` | `--xh-control-indicator-lg` |
| `--xh-number-field-trigger-bg-active` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `background-color` | `@media (hover: hover) and (pointer: fine)`<br>`disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed`<br>`--xh-bg-subtle-active` |
| `--xh-number-field-trigger-fg` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-number-field-trigger-fg-hover` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-number-field-trigger-font-size` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `font-size` | `default` | `--xh-_number-field-trigger-font-size` |
| `--xh-number-field-trigger-radius` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-number-field-trigger-size` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
