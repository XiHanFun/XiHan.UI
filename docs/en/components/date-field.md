# DateField

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/date-field).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/date-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/date-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/date-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/date-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/date-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="date-field"`: **`root`** · `label` · **`control`** · `segment-group` · **`segment`** · `clear-trigger` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-date-field>` |
| Vue components | `XhDateFieldClearTrigger` `XhDateFieldControl` `XhDateFieldHiddenInput` `XhDateFieldLabel` `XhDateFieldRoot` `XhDateFieldSegment` `XhDateFieldSegmentGroup` |
| Composable | `useDateField` |
| State machine | `dateFieldMachine` |
| Skin | `@xihan-ui/styles/date-field.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string \| null` |  |
| `defaultValue` | `string \| null` |  |
| `min` | `string` |  |
| `max` | `string` |  |
| `locale` | `string` |  |
| `timeZone` | `string` |  |
| `granularity` | `DateGranularity` |  |
| `hourCycle` | `DateHourCycle` |  |
| `segments` | `DateSegmentSet` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `name` | `string` |  |
| `placeholder` | `string \| DateSegmentPlaceholders` |  |
| `translations` | `DateFieldTranslations` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onValueChange` | `(details: DateFieldValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `DateFieldValueChangeDetails` |
| `clear` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhDateFieldRoot` | `default` | `DateFieldRootSlotProps` |
| `XhDateFieldRoot` | `label` | — |
| `XhDateFieldSegment` | `default` | `DateFieldSegmentSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhDateFieldRoot` | `label` | `ReactNode` |  |
| `XhDateFieldRoot` | `children` | `SlotChildren<DateFieldRootSlotProps>` |  |
| `XhDateFieldSegment` | `index` | `number \| string` |  |
| `XhDateFieldSegment` | `segment` | `DateSegmentType` |  |
| `XhDateFieldSegment` | `children` | `SlotChildren<DateFieldSegmentSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.TYPE` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `canEdit` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string \| null` |
| `valueAsDate` | `Date \| null` |
| `segments` | `DateFieldSegmentState[]` |
| `complete` | `boolean` |
| `empty` | `boolean` |
| `outOfRange` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `focusedSegment` | `DateSegmentType \| null` |
| `locale` | `string` |
| `granularity` | `DateGranularity` |
| `setValue` | `(next: string \| null) => void` |
| `clear` | `() => void` |
| `canClear` | `boolean` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getControlProps` | `() => T['element']` |
| `getSegmentGroupProps` | `() => T['element']` |
| `segmentOf` | `(props: DateFieldSegmentProps) => DateFieldSegmentState \| undefined` |
| `getSegmentProps` | `(props: DateFieldSegmentProps) => T['element']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getHiddenInputProps` | `() => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowUp` | `date-field.kbd.increment` |
| `ArrowDown` | `date-field.kbd.decrement` |
| `ArrowRight` | `date-field.kbd.next` |
| `ArrowLeft` | `date-field.kbd.prev` |
| `Home` | `date-field.kbd.first` |
| `End` | `date-field.kbd.last` |
| `Backspace` | `date-field.kbd.clear` |
| `0` / `1` / `2` / `3` / `4` / `5` / `6` / `7` / `8` / `9` | `date-field.kbd.digit` |
| `Enter` / `Space` | `date-field.kbd.press` |
| `a` / `p` | `date-field.kbd.day-period` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-label` | props.ariaLabel |
| `control` | `aria-labelledby` | id of the `label` part \| undefined |
| `control` | `role` | 'group' |
| `segment` | `aria-disabled` | undefined \| 'true' \| 'false' |
| `segment` | `aria-invalid` | undefined \| 'true' \| 'false' |
| `segment` | `aria-label` | item?.label |
| `segment` | `aria-readonly` | undefined \| 'true' \| 'false' |
| `segment` | `aria-required` | undefined \| 'true' \| 'false' |
| `segment` | `aria-valuemax` | undefined \| String(item.max) |
| `segment` | `aria-valuemin` | undefined \| String(item.min) |
| `segment` | `aria-valuenow` | undefined \| String(item.value) |
| `segment` | `aria-valuetext` | item?.text |
| `segment` | `role` | undefined \| 'spinbutton' |
| `clear-trigger` | `aria-label` | translations.clearTrigger |

## Style reference

### Skin

`@xihan-ui/styles/date-field.css` is written against `[data-scope="date-field"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-date-field` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-complete` | '' (present only while the condition holds) |
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
| `segment-group` | `data-disabled` | '' (present only while the condition holds) |
| `segment-group` | `data-invalid` | '' (present only while the condition holds) |
| `segment-group` | `data-placeholder-shown` | '' (present only while the condition holds) |
| `segment-group` | `data-placeholder-text` | props.placeholder \| undefined |
| `segment-group` | `data-readonly` | '' (present only while the condition holds) |
| `segment` | `data-disabled` | '' (present only while the condition holds) |
| `segment` | `data-focus` | '' (present only while the condition holds) |
| `segment` | `data-index` | String(index) \| undefined |
| `segment` | `data-invalid` | '' (present only while the condition holds) |
| `segment` | `data-placeholder` | '' (present only while the condition holds) |
| `segment` | `data-readonly` | '' (present only while the condition holds) |
| `segment` | `data-segment` | item?.type |
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
| `--xh-date-field-action-bg` | `clear-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-date-field-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-date-field-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-date-field-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-field-clear` |
| `--xh-date-field-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-date-field-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-date-field-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-date-field-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-date-field-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-date-field-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-date-field-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-date-field-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-date-field-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-date-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-date-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-date-field-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-date-field-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-date-field-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_date-field-gap` |
| `--xh-date-field-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_date-field-control-h` |
| `--xh-date-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-date-field-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_date-field-control-px` |
| `--xh-date-field-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-date-field-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-date-field-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-date-field-font-size` | `control` | `font-size` | `default` | `--xh-_date-field-font-size` |
| `--xh-date-field-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-date-field-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-date-field-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-date-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-date-field-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-date-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-date-field-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-date-field-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` |
| `--xh-date-field-placeholder-fg` | `segment`<br>`segment-group` | `color` | `placeholder`<br>`placeholder-shown` | `--xh-fg-subtle` |
| `--xh-date-field-segment-bg-focus` | `segment` | `background` | `focus`<br>`focus-visible` | `--xh-_date-field-segment-bg` |
| `--xh-date-field-segment-bg-invalid-focus` | `segment` | `background` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-bg-subtle` |
| `--xh-date-field-segment-fg-focus` | `segment` | `color` | `focus`<br>`focus-visible`<br>`placeholder` | `--xh-_date-field-segment-fg` |
| `--xh-date-field-segment-fg-invalid` | `segment` | `color` | `invalid` | `--xh-fg-danger` |
| `--xh-date-field-segment-fg-invalid-focus` | `segment` | `color` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-fg-danger` |
| `--xh-date-field-segment-px` | `segment` | `padding-inline` | `default` | `--xh-space-0_5` |
| `--xh-date-field-segment-py` | `segment` | `padding-block` | `default` | `--xh-space-0` |
| `--xh-date-field-segment-radius` | `segment` | `border-radius` | `default` | `--xh-shape-inset` |
