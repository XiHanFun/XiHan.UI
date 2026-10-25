# TextField

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/text-field).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/text-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/text-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/text-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/text-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/text-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="text-field"`: **`root`** · `label` · `control` · `prefix` · **`input`** · `suffix` · `clear-trigger` · `count`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-text-field>` |
| Vue components | `XhTextFieldClearTrigger` `XhTextFieldControl` `XhTextFieldCount` `XhTextFieldInput` `XhTextFieldLabel` `XhTextFieldPrefix` `XhTextFieldRoot` `XhTextFieldSuffix` |
| Composable | `useTextField` |
| State machine | `textFieldMachine` |
| Skin | `@xihan-ui/styles/text-field.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string` |  |
| `defaultValue` | `string` |  |
| `type` | `TextFieldType` |  |
| `placeholder` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `invalid` | `boolean` |  |
| `name` | `string` |  |
| `maxLength` | `number` |  |
| `clearable` | `boolean` |  |
| `showCount` | `boolean` |  |
| `autoSize` | `boolean \| TextFieldAutoSize` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<TextFieldTranslations>` |  |
| `onValueChange` | `(details: TextFieldValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `TextFieldValueChangeDetails` |
| `clear` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTextFieldCount` | `default` | `TextFieldCountSlotProps` |
| `XhTextFieldRoot` | `default` | `TextFieldRootSlotProps` |
| `XhTextFieldRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTextFieldCount` | `children` | `SlotChildren<TextFieldCountSlotProps>` |  |
| `XhTextFieldInput` | `as` | `TextFieldInputHost` |  |
| `XhTextFieldRoot` | `label` | `ReactNode` |  |
| `XhTextFieldRoot` | `multiline` | `boolean` |  |
| `XhTextFieldRoot` | `children` | `SlotChildren<TextFieldRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `VALUE.CLEAR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `canEdit` · `canClear`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string` |
| `empty` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `clearable` | `boolean` |
| `atLimit` | `boolean` |
| `count` | `number` |
| `maxLength` | `number \| undefined` |
| `showCount` | `boolean` |
| `canClear` | `boolean` |
| `setValue` | `(next: string) => void` |
| `clear` | `() => void` |
| `autoSize` | `boolean \| TextFieldAutoSize` |
| `getRootProps` | `() => T['element']` |
| `getControlProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getInputProps` | `(props?: TextFieldInputProps) => T['input']` |
| `getPrefixProps` | `() => T['element']` |
| `getSuffixProps` | `() => T['element']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getCountProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Escape` | `text-field.kbd.clear` |
| `Enter` / `Space` | `text-field.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `prefix` | `aria-hidden` | 'true' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.ariaLabel |
| `input` | `aria-labelledby` | id of the `label` part \| undefined |
| `input` | `aria-readonly` | 'true' \| 'false' |
| `input` | `aria-required` | 'true' \| 'false' |
| `suffix` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | label.clearTrigger |
| `count` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/text-field.css` is written against `[data-scope="text-field"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-text-field` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-at-max` | '' (present only while the condition holds) |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-action-owner` | '' |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-at-max` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-empty` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `prefix` | `data-disabled` | '' (present only while the condition holds) |
| `prefix` | `data-xh-field-affix` | 'prefix' |
| `input` | `data-at-max` | '' (present only while the condition holds) |
| `input` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-empty` | '' (present only while the condition holds) |
| `input` | `data-invalid` | '' (present only while the condition holds) |
| `input` | `data-xh-field-auto-size` | '' (present only while the condition holds) |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'textarea' \| 'single-line' |
| `suffix` | `data-disabled` | '' (present only while the condition holds) |
| `suffix` | `data-xh-field-affix` | 'suffix' |
| `clear-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
| `count` | `data-at-max` | '' (present only while the condition holds) |
| `count` | `data-disabled` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-text-field-action-bg` | `clear-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-text-field-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-text-field-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-text-field-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-text-field-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-text-field-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-_text-field-action-font-size` |
| `--xh-text-field-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-text-field-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-text-field-affix-fg` | `prefix`<br>`suffix` | `color` | `xh-field-affix` | `--xh-fg-muted` |
| `--xh-text-field-affix-fg-disabled` | `prefix`<br>`suffix` | `color` | `disabled`<br>`xh-field-affix` | `--xh-fg-disabled` |
| `--xh-text-field-affix-font-size` | `prefix`<br>`suffix` | `font-size` | `xh-field-affix` | `--xh-_text-field-font-size` |
| `--xh-text-field-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-text-field-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-text-field-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-text-field-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-text-field-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-text-field-control-border-at-max` | `control` | `border-color` | `at-max`<br>`invalid`<br>`not([data-invalid])` | `--xh-border-at-limit` |
| `--xh-text-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-text-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-text-field-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-text-field-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-text-field-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_text-field-gap` |
| `--xh-text-field-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_text-field-h` |
| `--xh-text-field-control-max-h` | `input` | `max-block-size` | `xh-field-auto-size` | `--xh-viewport-h-sm` |
| `--xh-text-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-text-field-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_text-field-px` |
| `--xh-text-field-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-text-field-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-text-field-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-text-field-count-fg` | `count` | `color` | `default` | `--xh-fg-muted` |
| `--xh-text-field-count-fg-at-max` | `count` | `color` | `at-max` | `--xh-fg-warning` |
| `--xh-text-field-count-fg-disabled` | `count` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-text-field-count-font-size` | `count` | `font-size` | `default` | `--xh-_text-field-action-font-size` |
| `--xh-text-field-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-text-field-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-text-field-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` |
| `--xh-text-field-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` |
| `--xh-text-field-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` |
| `--xh-text-field-input-font-size` | `input` | `font-size` | `xh-field-input` | `--xh-_text-field-font-size` |
| `--xh-text-field-input-max-h` | `input` | `max-block-size` | `xh-field-auto-size` | `--xh-text-field-control-max-h` |
| `--xh-text-field-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-text-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-text-field-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-text-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-text-field-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-text-field-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-text-field-textarea-py` | `input` | `padding-block` | `xh-field-input`<br>`xh-field-layout=textarea` | `--xh-space-1` |
