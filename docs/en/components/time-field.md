# TimeField

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/time-field).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/time-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/time-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/time-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/time-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/time-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="time-field"`: **`root`** · `label` · **`control`** · `segment-group` · **`segment`** · `clear-trigger` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-time-field>` |
| Vue components | `XhTimeFieldClearTrigger` `XhTimeFieldControl` `XhTimeFieldHiddenInput` `XhTimeFieldLabel` `XhTimeFieldRoot` `XhTimeFieldSegment` `XhTimeFieldSegmentGroup` |
| Composable | `useTimeField` |
| State machine | `timeFieldMachine` |
| Skin | `@xihan-ui/styles/time-field.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string` |  |
| `defaultValue` | `string` |  |
| `min` | `string` |  |
| `max` | `string` |  |
| `locale` | `string` |  |
| `hourCycle` | `TimeHourCycle` |  |
| `granularity` | `TimeGranularity` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `name` | `string` |  |
| `placeholder` | `string` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<TimeFieldTranslations>` |  |
| `onValueChange` | `(details: TimeFieldValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `TimeFieldValueChangeDetails` |
| `clear` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTimeFieldRoot` | `default` | `TimeFieldRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTimeFieldRoot` | `children` | `SlotChildren<TimeFieldRootSlotProps>` |  |
| `XhTimeFieldSegment` | `segment` | `TimeSegmentType` | Yes |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.DIGIT` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `canEdit` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string` |
| `empty` | `boolean` |
| `outOfRange` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `canClear` | `boolean` |
| `hourCycle` | `TimeHourCycle` |
| `granularity` | `TimeGranularity` |
| `segments` | `TimeSegmentType[]` |
| `focusedSegment` | `TimeSegmentType \| null` |
| `getSegmentText` | `(props: TimeFieldSegmentProps) => string` |
| `setValue` | `(next: string) => void` |
| `clear` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getSegmentGroupProps` | `() => T['element']` |
| `getSegmentProps` | `(props: TimeFieldSegmentProps) => T['element']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getHiddenInputProps` | `() => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowUp` | `time-field.kbd.increment` |
| `ArrowDown` | `time-field.kbd.decrement` |
| `ArrowRight` | `time-field.kbd.next` |
| `ArrowLeft` | `time-field.kbd.prev` |
| `Home` | `time-field.kbd.first` |
| `End` | `time-field.kbd.last` |
| `0-9` | `time-field.kbd.digit` |
| `Backspace` / `Delete` | `time-field.kbd.clear` |
| `Enter` / `Space` | `time-field.kbd.press` |
| `a` / `p` | `time-field.kbd.period` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-invalid` | 'true' \| 'false' |
| `control` | `aria-label` | props.ariaLabel |
| `control` | `aria-labelledby` | id of the `label` part \| undefined |
| `control` | `role` | 'group' |
| `segment` | `aria-disabled` | 'true' \| 'false' |
| `segment` | `aria-invalid` | 'true' \| 'false' |
| `segment` | `aria-label` | translations[segment] |
| `segment` | `aria-readonly` | 'true' \| 'false' |
| `segment` | `aria-required` | 'true' \| 'false' |
| `segment` | `aria-valuemax` | range.max |
| `segment` | `aria-valuemin` | range.min |
| `segment` | `aria-valuenow` | segmentNumber(draft, segment, hourCycle) |
| `segment` | `aria-valuetext` | timeSegmentText(draft, segment, { hourCycle, locale, … |
| `segment` | `role` | 'spinbutton' |
| `clear-trigger` | `aria-label` | translations.clearTrigger |

## Style reference

### Skin

`@xihan-ui/styles/time-field.css` is written against `[data-scope="time-field"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-time-field` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

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
| `control` | `data-empty` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-action-owner` | '' |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `segment-group` | `data-disabled` | '' (present only while the condition holds) |
| `segment-group` | `data-invalid` | '' (present only while the condition holds) |
| `segment-group` | `data-readonly` | '' (present only while the condition holds) |
| `segment` | `data-disabled` | '' (present only while the condition holds) |
| `segment` | `data-focus` | '' (present only while the condition holds) |
| `segment` | `data-invalid` | '' (present only while the condition holds) |
| `segment` | `data-placeholder` | '' (present only while the condition holds) |
| `segment` | `data-readonly` | '' (present only while the condition holds) |
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
| `--xh-time-field-action-bg` | `clear-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-time-field-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-time-field-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-time-field-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-field-clear` |
| `--xh-time-field-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-time-field-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-time-field-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-time-field-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-time-field-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-time-field-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-time-field-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-time-field-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-time-field-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-time-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-time-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-time-field-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-time-field-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-time-field-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_time-field-gap` |
| `--xh-time-field-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_time-field-control-h` |
| `--xh-time-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-time-field-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_time-field-control-px` |
| `--xh-time-field-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-time-field-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-time-field-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-time-field-font-size` | `control` | `font-size` | `default` | `--xh-_time-field-font-size` |
| `--xh-time-field-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-time-field-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-time-field-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-time-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-time-field-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-time-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-time-field-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-time-field-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` |
| `--xh-time-field-placeholder-fg` | `segment` | `color` | `placeholder` | `--xh-fg-subtle` |
| `--xh-time-field-segment-bg-focus` | `segment` | `background` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])` | `--xh-_time-field-segment-bg` |
| `--xh-time-field-segment-bg-hover` | `segment` | `background` | `disabled`<br>`focus`<br>`hover`<br>`not([data-focus], [data-disabled])` | `--xh-bg-subtle` |
| `--xh-time-field-segment-bg-invalid-focus` | `segment` | `background` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-bg-subtle` |
| `--xh-time-field-segment-fg-focus` | `segment` | `color` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])`<br>`placeholder` | `--xh-_time-field-segment-fg` |
| `--xh-time-field-segment-fg-invalid` | `segment` | `color` | `invalid` | `--xh-fg-danger` |
| `--xh-time-field-segment-fg-invalid-focus` | `segment` | `color` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-fg-danger` |
| `--xh-time-field-segment-px` | `segment` | `padding-inline` | `default` | `--xh-space-0_5` |
| `--xh-time-field-segment-py` | `segment` | `padding-block` | `default` | `--xh-space-0` |
| `--xh-time-field-segment-radius` | `segment` | `border-radius` | `default` | `--xh-shape-inset` |
