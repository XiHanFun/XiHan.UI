# FormatInput

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/format-input).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/format-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/format-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/format-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/format-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/format-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="format-input"`: **`root`** · `label` · **`kind`** · `field-group` · `item` · `item-label` · `pattern-description` · `preview` · `error-text`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-format-input>` |
| Vue components | `XhFormatInputErrorText` `XhFormatInputFieldGroup` `XhFormatInputItem` `XhFormatInputItemLabel` `XhFormatInputKind` `XhFormatInputLabel` `XhFormatInputPatternDescription` `XhFormatInputPreview` `XhFormatInputRoot` |
| Composable | `useFormatInput` |
| State machine | `formatInputMachine` |
| Skin | `@xihan-ui/styles/format-input.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `value` | `FormatSpec \| null` |  |
| `defaultValue` | `FormatSpec \| null` |  |
| `kinds` | `readonly FormatInputKind[]` |  |
| `clearable` | `boolean` |  |
| `mixed` | `boolean` |  |
| `datePatterns` | `readonly string[]` |  |
| `sample` | `unknown` |  |
| `locale` | `string` |  |
| `timeZone` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `variant` | `ControlVariant` |  |
| `size` | `Size` |  |
| `translations` | `Partial<FormatInputTranslations>` |  |
| `onValueChange` | `(details: FormatInputValueChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `FormatInputValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhFormatInputRoot` | `default` | `FormatInputRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhFormatInputItem` | `value` | `FormatInputOption` | Yes |
| `XhFormatInputItemLabel` | `value` | `FormatInputOption \| 'kind'` | Yes |
| `XhFormatInputRoot` | `children` | `SlotChildren<FormatInputRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle` · `settling`

**Events**: `KIND.SET` · `DECIMALS_MODE.SET` · `DECIMALS.SET` · `GROUPING.SET` · `ROUNDING.SET` · `PATTERN.SET` · `STYLE.SET` · `VALUE.SYNC` · `after.announce`

**Guards**: `isEditable`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `FormatSpec \| null` |
| `kind` | `FormatInputKind \| null` |
| `draft` | `FormatInputDraft` |
| `issue` | `FormatInputIssueCode \| null` |
| `issueText` | `string` |
| `previewText` | `string` |
| `options` | `readonly FormatInputOption[]` |
| `kindItems` | `readonly { value: FormatInputKindOption, label: string }[]` |
| `kindControl` | `'toggle-group' \| 'select'` |
| `setKind` | `(kind: FormatInputKind \| null) => void` |
| `setDecimalsMode` | `(mode: FormatInputDecimalsMode) => void` |
| `setDecimals` | `(field: FormatInputDecimalsField, text: string) => void` |
| `setGrouping` | `(value: boolean) => void` |
| `setRounding` | `(value: FormatRounding) => void` |
| `setPattern` | `(value: string) => void` |
| `setNumeralStyle` | `(value: NumeralStyle) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getKindProps` | `() => T['element']` |
| `getFieldGroupProps` | `() => T['element']` |
| `getItemProps` | `(option: FormatInputOption) => T['element']` |
| `getItemLabelProps` | `(option: FormatInputOption \| 'kind') => T['element']` |
| `getPatternDescriptionProps` | `() => T['element']` |
| `getPreviewProps` | `() => T['element']` |
| `getErrorTextProps` | `() => T['element']` |
| `getKindToggleGroupProps` | `() => Partial<StructureInstanceProps['toggle-group']>` |
| `getKindSelectProps` | `() => Partial<StructureInstanceProps['select']>` |
| `getDecimalsModeControlProps` | `() => Partial<StructureInstanceProps['toggle-group']>` |
| `getDecimalsControlProps` | `(field: FormatInputDecimalsField) => Partial<StructureInstanceProps['number-field']>` |
| `getGroupingControlProps` | `() => Partial<StructureInstanceProps['switch']>` |
| `getRoundingControlProps` | `() => Partial<StructureInstanceProps['select']>` |
| `getPatternControlProps` | `() => Partial<StructureInstanceProps['combobox']>` |
| `getNumeralStyleControlProps` | `() => Partial<StructureInstanceProps['select']>` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `format-input.kbd.tab` |
| `ArrowUp` / `ArrowDown` / `Enter` / `Space` | `format-input.kbd.controls` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-describedby` | undefined \| id of the `error-text` part |
| `root` | `aria-invalid` | 'true' \| undefined |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `aria-labelledby` | id of the `label` part \| undefined |
| `root` | `role` | 'group' |
| `preview` | `aria-live` | 'polite' |
| `preview` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/format-input.css` is written against `[data-scope="format-input"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-format-input` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-kind` | undefined \| draft.kind |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `item` | `data-value` | option |
| `item-label` | `data-value` | option |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-format-input-error-fg` | `error-text` | `color` | `default` | `--xh-fg-danger` |
| `--xh-format-input-error-font-size` | `error-text` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-format-input-field-group-col-w` | `field-group` | `grid-template-columns` | `default` | `--xh-layout-col-min-sm` |
| `--xh-format-input-field-group-gap` | `field-group` | `gap` | `default` | `--xh-space-3` |
| `--xh-format-input-gap` | `root` | `gap` | `default` | `--xh-space-4` |
| `--xh-format-input-item-gap` | `item` | `gap` | `value=grouping` | `--xh-space-3` |
| `--xh-format-input-item-label-fg` | `item-label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-format-input-item-label-font-size` | `item-label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-format-input-item-label-font-weight` | `item-label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-format-input-item-label-gap` | `item-label` | `margin-block-end` | `where(legend)` | `--xh-space-2` |
| `--xh-format-input-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-format-input-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-format-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-format-input-pattern-description-fg` | `pattern-description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-format-input-pattern-description-font-size` | `pattern-description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-format-input-preview-fg` | `preview` | `color` | `default` | `--xh-fg-muted` |
| `--xh-format-input-preview-font-size` | `preview` | `font-size` | `default` | `--xh-text-body-size` |
