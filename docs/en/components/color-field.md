# ColorField

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/color-field).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="color-field"`: **`root`** · `label` · `control` · `swatch` · **`input`** · `clear-trigger` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-color-field>` |
| Vue components | `XhColorFieldClearTrigger` `XhColorFieldControl` `XhColorFieldHiddenInput` `XhColorFieldInput` `XhColorFieldLabel` `XhColorFieldRoot` `XhColorFieldSwatch` |
| Composable | `useColorField` |
| State machine | `colorFieldMachine` |
| Skin | `@xihan-ui/styles/color-field.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string` |  |
| `defaultValue` | `string` |  |
| `format` | `ColorFormat` |  |
| `alpha` | `boolean` |  |
| `placeholder` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `invalid` | `boolean` |  |
| `name` | `string` |  |
| `clearable` | `boolean` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<ColorFieldTranslations>` |  |
| `onValueChange` | `(details: ColorFieldValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `ColorFieldValueChangeDetails` |
| `clear` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhColorFieldRoot` | `default` | `ColorFieldRootSlotProps` |
| `XhColorFieldRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhColorFieldRoot` | `label` | `ReactNode` |  |
| `XhColorFieldRoot` | `children` | `SlotChildren<ColorFieldRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `INPUT.CHANGE` · `INPUT.COMMIT` · `INPUT.CANCEL` · `VALUE.SET` · `VALUE.CLEAR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `canEdit` · `canClear`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string` |
| `empty` | `boolean` |
| `text` | `string` |
| `editing` | `boolean` |
| `draftInvalid` | `boolean` |
| `rgba` | `ColorRgba` |
| `valid` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `clearable` | `boolean` |
| `canClear` | `boolean` |
| `setValue` | `(next: string) => void` |
| `clear` | `() => void` |
| `commit` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getControlProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getSwatchProps` | `() => T['element']` |
| `getInputProps` | `() => T['input']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getHiddenInputProps` | `() => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` | `color-field.kbd.commit` |
| `Escape` | `color-field.kbd.cancel` |
| `Escape` | `color-field.kbd.clear` |
| `Enter` / `Space` | `color-field.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `swatch` | `aria-hidden` | 'true' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.ariaLabel |
| `input` | `aria-labelledby` | id of the `label` part \| undefined |
| `input` | `aria-readonly` | 'true' \| 'false' |
| `input` | `aria-required` | 'true' \| 'false' |
| `clear-trigger` | `aria-label` | label.clearTrigger |

## Style reference

### Skin

`@xihan-ui/styles/color-field.css` is written against `[data-scope="color-field"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-color-field` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-editing` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-editing` | '' (present only while the condition holds) |
| `control` | `data-empty` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-action-owner` | '' |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `swatch` | `data-disabled` | '' (present only while the condition holds) |
| `swatch` | `data-empty` | '' (present only while the condition holds) |
| `swatch` | `data-xh-swatch` | '' |
| `swatch` | `data-xh-swatch-size` | props.size |
| `input` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-editing` | '' (present only while the condition holds) |
| `input` | `data-empty` | '' (present only while the condition holds) |
| `input` | `data-invalid` | '' (present only while the condition holds) |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'single-line' |
| `clear-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-color-field-action-bg` | `clear-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-color-field-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-color-field-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-color-field-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-field-clear` |
| `--xh-color-field-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-color-field-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-_color-field-action-font-size` |
| `--xh-color-field-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-color-field-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-color-field-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-color-field-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-color-field-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-color-field-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-color-field-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-color-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-color-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-color-field-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-color-field-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-color-field-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_color-field-gap` |
| `--xh-color-field-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_color-field-h` |
| `--xh-color-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-color-field-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_color-field-px` |
| `--xh-color-field-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-color-field-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-color-field-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-color-field-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-color-field-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-color-field-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` |
| `--xh-color-field-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` |
| `--xh-color-field-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` |
| `--xh-color-field-input-font-size` | `input` | `font-size` | `xh-field-input` | `--xh-_color-field-font-size` |
| `--xh-color-field-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-color-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-color-field-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-color-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-color-field-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-color-field-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-color-field-swatch-border` | `swatch` | `--xh-swatch-border` | `default` | `--xh-border-default` |
| `--xh-color-field-swatch-radius` | `swatch` | `--xh-swatch-radius` | `default` | `--xh-shape-inset` |
| `--xh-color-field-swatch-size` | `swatch` | `--xh-swatch-size` | `default` | `--xh-_swatch-size` |
