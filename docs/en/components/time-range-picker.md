# TimeRangePicker <Badge type="tip" text="new" />

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/time-range-picker).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/time-range-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/time-range-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/time-range-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/time-range-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/time-range-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="time-range-picker"`: **`root`** · `label` · **`control`** · **`segment-group`** · **`segment`** · `range-separator` · **`trigger`** · `clear-trigger` · `positioner` · **`content`** · `preset-group` · `preset` · **`column-group`** · `column-group-label` · `column` · `item` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-time-range-picker>` |
| Vue components | `XhTimeRangePickerClearTrigger` `XhTimeRangePickerColumn` `XhTimeRangePickerColumnGroup` `XhTimeRangePickerColumnGroupLabel` `XhTimeRangePickerContent` `XhTimeRangePickerControl` `XhTimeRangePickerHiddenInput` `XhTimeRangePickerItem` `XhTimeRangePickerLabel` `XhTimeRangePickerPositioner` `XhTimeRangePickerPreset` `XhTimeRangePickerPresetGroup` `XhTimeRangePickerRangeSeparator` `XhTimeRangePickerRoot` `XhTimeRangePickerSegment` `XhTimeRangePickerSegmentGroup` `XhTimeRangePickerTrigger` |
| Composable | `useTimeRangePicker` |
| State machine | `timeRangePickerMachine` |
| Skin | `@xihan-ui/styles/time-range-picker.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string[]` |  |
| `defaultValue` | `string[]` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `min` | `string` |  |
| `max` | `string` |  |
| `locale` | `string` |  |
| `hourCycle` | `TimeHourCycle` |  |
| `granularity` | `TimeGranularity` |  |
| `timeStep` | `TimeStep` |  |
| `presets` | `TimeRangePickerPreset[]` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `name` | `string` |  |
| `endName` | `string` |  |
| `startPlaceholder` | `string` |  |
| `endPlaceholder` | `string` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `placement` | `Placement` |  |
| `dir` | `Direction` |  |
| `offset` | `number` |  |
| `isTimeUnavailable` | `TimeUnavailablePredicate` |  |
| `translations` | `Partial<TimeRangePickerTranslations>` |  |
| `onValueChange` | `(details: TimeRangePickerValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |
| `onOpenChange` | `(details: TimeRangePickerOpenChangeDetails) => void` |  |

### TimeRangePickerPreset

Elements of `presets`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` | Yes |
| `disabled` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `TimeRangePickerValueChangeDetails` |
| `clear` | `` |
| `open-change` | `TimeRangePickerOpenChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTimeRangePickerColumn` | `default` | `TimeRangePickerColumnSlotProps` |
| `XhTimeRangePickerColumnGroup` | `default` | `TimeRangePickerColumnGroupSlotProps` |
| `XhTimeRangePickerPreset` | `default` | — |
| `XhTimeRangePickerPresetGroup` | `default` | `TimeRangePickerPresetsSlotProps` |
| `XhTimeRangePickerRoot` | `default` | `TimeRangePickerRootSlotProps` |
| `XhTimeRangePickerRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTimeRangePickerColumn` | `unit` | `TimePickerColumnUnit` | Yes |
| `XhTimeRangePickerColumn` | `children` | `SlotChildren<TimeRangePickerColumnSlotProps>` |  |
| `XhTimeRangePickerColumnGroup` | `index` | `number \| string` |  |
| `XhTimeRangePickerColumnGroup` | `children` | `SlotChildren<TimeRangePickerColumnGroupSlotProps>` |  |
| `XhTimeRangePickerHiddenInput` | `index` | `number \| string` |  |
| `XhTimeRangePickerItem` | `value` | `string` | Yes |
| `XhTimeRangePickerPositioner` | `container` | `() => Element \| null` |  |
| `XhTimeRangePickerPreset` | `value` | `string` | Yes |
| `XhTimeRangePickerPresetGroup` | `children` | `SlotChildren<TimeRangePickerPresetsSlotProps>` |  |
| `XhTimeRangePickerRoot` | `label` | `ReactNode` |  |
| `XhTimeRangePickerRoot` | `children` | `SlotChildren<TimeRangePickerRootSlotProps>` |  |
| `XhTimeRangePickerSegment` | `segment` | `TimeSegmentType` | Yes |
| `XhTimeRangePickerSegmentGroup` | `index` | `number \| string` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `preset` | 'checked' \| 'unchecked' |
| `column-group` | 'open' \| 'closed' |
| `column` | 'open' \| 'closed' |
| `item` | 'checked' \| 'unchecked' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.DIGIT` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `OPTION.FOCUS` · `ITEM.SELECT` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `isOpenControlled` · `canEdit` · `closesOnPreset` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `value` | `string[]` |
| `start` | `string \| null` |
| `end` | `string \| null` |
| `empty` | `boolean` |
| `outOfRange` | `boolean` |
| `reversed` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `hourCycle` | `TimeHourCycle` |
| `granularity` | `TimeGranularity` |
| `timeStep` | `ResolvedTimeStep` |
| `segments` | `TimeSegmentType[]` |
| `focusedSegment` | `TimeRangePickerSegmentRef \| null` |
| `columnGroups` | `readonly [TimeRangePickerColumnGroup, TimeRangePickerColumnGroup]` |
| `focusedColumn` | `TimeRangePickerColumnRef \| null` |
| `focusedItem` | `string \| null` |
| `presets` | `readonly TimeRangePickerPresetState[]` |
| `canClear` | `boolean` |
| `translations` | `TimeRangePickerTranslations` |
| `getSegmentText` | `(props: TimeRangePickerSegmentProps) => string` |
| `getItemText` | `(props: TimeRangePickerItemTextProps) => string` |
| `isItemSelected` | `(props: TimeRangePickerItemProps) => boolean` |
| `isItemDisabled` | `(props: TimeRangePickerItemProps) => boolean` |
| `setOpen` | `(next: boolean) => void` |
| `setValue` | `(next: string[]) => void` |
| `clear` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getSegmentGroupProps` | `(props: TimeRangePickerEndProps) => T['element']` |
| `getSegmentProps` | `(props: TimeRangePickerSegmentProps) => T['element']` |
| `getRangeSeparatorProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getPresetGroupProps` | `() => T['element']` |
| `getPresetProps` | `(props: TimeRangePickerPresetProps) => T['element']` |
| `getColumnGroupProps` | `(props: TimeRangePickerEndProps) => T['element']` |
| `getColumnGroupLabelProps` | `(props: TimeRangePickerEndProps) => T['element']` |
| `getColumnProps` | `(props: TimeRangePickerColumnProps) => T['element']` |
| `getItemProps` | `(props: TimeRangePickerItemProps) => T['element']` |
| `getHiddenInputProps` | `(props: TimeRangePickerEndProps) => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowDown` / `ArrowUp` | `time-range-picker.kbd.open` |
| `Enter` / `Space` | `time-range-picker.kbd.toggle` |
| `ArrowDown` | `time-range-picker.kbd.item-next` |
| `ArrowUp` | `time-range-picker.kbd.item-prev` |
| `Home` | `time-range-picker.kbd.item-first` |
| `End` | `time-range-picker.kbd.item-last` |
| `ArrowRight` | `time-range-picker.kbd.column-next` |
| `ArrowLeft` | `time-range-picker.kbd.column-prev` |
| `Enter` / `Space` | `time-range-picker.kbd.select` |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | `time-range-picker.kbd.preset-move` |
| `Enter` / `Space` | `time-range-picker.kbd.preset-pick` |
| `Escape` | `time-range-picker.kbd.escape` |
| `Tab` / `Shift+Tab` | `time-range-picker.kbd.tab` |
| `ArrowUp` | `time-range-picker.kbd.segment-increment` |
| `ArrowDown` | `time-range-picker.kbd.segment-decrement` |
| `ArrowRight` | `time-range-picker.kbd.segment-next` |
| `ArrowLeft` | `time-range-picker.kbd.segment-prev` |
| `Home` | `time-range-picker.kbd.segment-first` |
| `End` | `time-range-picker.kbd.segment-last` |
| `0-9` | `time-range-picker.kbd.segment-digit` |
| `Backspace` / `Delete` | `time-range-picker.kbd.segment-clear` |
| `a` / `p` | `time-range-picker.kbd.segment-period` |
| `Alt+ArrowDown` | `time-range-picker.kbd.segment-open` |
| `Enter` | `time-range-picker.kbd.segment-close` |
| `Enter` / `Space` | `time-range-picker.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-invalid` | 'true' \| 'false' |
| `control` | `aria-label` | props.ariaLabel |
| `control` | `aria-labelledby` | id of the `label` part \| undefined |
| `control` | `role` | 'group' |
| `segment-group` | `aria-disabled` | 'true' \| 'false' |
| `segment-group` | `aria-label` | endLabel(index, translations) |
| `segment-group` | `role` | 'group' |
| `segment` | `aria-disabled` | 'true' \| 'false' |
| `segment` | `aria-invalid` | 'true' \| 'false' |
| `segment` | `aria-label` | translations[segment] |
| `segment` | `aria-readonly` | 'true' \| 'false' |
| `segment` | `aria-required` | 'true' \| 'false' |
| `segment` | `aria-valuemax` | range.max |
| `segment` | `aria-valuemin` | range.min |
| `segment` | `aria-valuenow` | segmentNumber(drafts[index], segment, hourCycle) |
| `segment` | `aria-valuetext` | timeSegmentText(drafts[index], segment, { hourCycle, … |
| `segment` | `role` | 'spinbutton' |
| `range-separator` | `aria-hidden` | 'true' |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `trigger` | `aria-label` | props.ariaLabel |
| `trigger` | `aria-labelledby` | id of the `label` part \| undefined |
| `clear-trigger` | `aria-label` | translations.clearTrigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | props.ariaLabel |
| `content` | `aria-labelledby` | id of the `label` part \| undefined |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `preset-group` | `aria-disabled` | 'true' \| 'false' |
| `preset-group` | `aria-label` | translations.presets |
| `preset-group` | `aria-multiselectable` | 'false' |
| `preset-group` | `aria-orientation` | 'vertical' |
| `preset-group` | `role` | 'listbox' |
| `preset` | `aria-disabled` | 'true' \| 'false' |
| `preset` | `aria-selected` | 'true' \| 'false' |
| `preset` | `role` | 'option' |
| `column-group` | `aria-label` | endLabel(index, translations) |
| `column-group` | `role` | 'group' |
| `column-group-label` | `aria-hidden` | 'true' |
| `column` | `aria-disabled` | 'true' \| 'false' |
| `column` | `aria-label` | translations[unit] |
| `column` | `aria-multiselectable` | 'false' |
| `column` | `aria-orientation` | 'vertical' |
| `column` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |

## Style reference

### Skin

`@xihan-ui/styles/time-range-picker.css` is written against `[data-scope="time-range-picker"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-time-range-picker` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

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
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-empty` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-state` | 'open' \| 'closed' |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `segment-group` | `data-complete` | '' (present only while the condition holds) |
| `segment-group` | `data-disabled` | '' (present only while the condition holds) |
| `segment-group` | `data-empty` | '' (present only while the condition holds) |
| `segment-group` | `data-index` | String(index) |
| `segment-group` | `data-invalid` | '' (present only while the condition holds) |
| `segment-group` | `data-out-of-range` | '' (present only while the condition holds) |
| `segment-group` | `data-placeholder-shown` | '' (present only while the condition holds) |
| `segment-group` | `data-placeholder-text` | props.endPlaceholder \| props.startPlaceholder \| undefined |
| `segment-group` | `data-readonly` | '' (present only while the condition holds) |
| `segment` | `data-disabled` | '' (present only while the condition holds) |
| `segment` | `data-focus` | '' (present only while the condition holds) |
| `segment` | `data-invalid` | '' (present only while the condition holds) |
| `segment` | `data-placeholder` | '' (present only while the condition holds) |
| `segment` | `data-readonly` | '' (present only while the condition holds) |
| `range-separator` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'field-inset' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `clear-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-placement` | actual placement computed by the positioning engine |
| `content` | `data-state` | 'open' \| 'closed' |
| `preset` | `data-disabled` | '' (present only while the condition holds) |
| `preset` | `data-pressed` | '' (present only while the condition holds) |
| `preset` | `data-state` | 'checked' \| 'unchecked' |
| `preset` | `data-xh-collection-context` | 'overlay' |
| `preset` | `data-xh-collection-item` | '' |
| `preset` | `data-xh-collection-size` | props.size |
| `column-group` | `data-disabled` | '' (present only while the condition holds) |
| `column-group` | `data-focus` | '' (present only while the condition holds) |
| `column-group` | `data-index` | String(index) |
| `column-group` | `data-state` | 'open' \| 'closed' |
| `column-group-label` | `data-disabled` | '' (present only while the condition holds) |
| `column-group-label` | `data-index` | String(index) |
| `column` | `data-disabled` | '' (present only while the condition holds) |
| `column` | `data-state` | 'open' \| 'closed' |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `hidden-input` | `data-index` | String(index) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-time-range-picker-action-bg` | `clear-trigger`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-time-range-picker-action-bg-active` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-time-range-picker-action-bg-hover` | `clear-trigger`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open`<br>`xh-ink-surface` | `--xh-_action-variant-bg-hover` |
| `--xh-time-range-picker-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-time-range-picker-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open` | `--xh-fg-default` |
| `--xh-time-range-picker-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-time-range-picker-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-time-range-picker-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-time-range-picker-column-divider` | `column`<br>`column-group`<br>`preset-group` | `border-block-start`<br>`border-inline-end`<br>`border-inline-start` | `default` | `--xh-material-solid-border` |
| `--xh-time-range-picker-column-gap` | `column`<br>`item` | `gap`<br>`inset-block` | `default` | `--xh-space-2` |
| `--xh-time-range-picker-column-group-divider` | `column-group` | `border-inline-start` | `default` | `--xh-material-solid-border` |
| `--xh-time-range-picker-column-group-gap` | `column-group` | `margin-inline-start`<br>`padding-inline-start` | `default` | `--xh-space-0` |
| `--xh-time-range-picker-column-group-label-fg` | `column-group-label` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-time-range-picker-column-group-label-px` | `column-group-label` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-time-range-picker-column-group-label-py` | `column-group`<br>`column-group-label` | `block-size`<br>`padding-block`<br>`padding-block-start` | `default` | `--xh-space-1` |
| `--xh-time-range-picker-column-group-py` | `column-group`<br>`column-group-label` | `block-size`<br>`padding-block-start` | `default` | `--xh-time-range-picker-column-group-label-py` |
| `--xh-time-range-picker-column-h` | `column` | `block-size`<br>`padding-block` | `default` | `--xh-overlay-time-column-h` |
| `--xh-time-range-picker-column-min-w` | `column` | `min-inline-size` | `default` | `--xh-overlay-time-column-w` |
| `--xh-time-range-picker-column-px` | `column` | `padding-inline` | `default` | `0` |
| `--xh-time-range-picker-column-py` | `column` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-time-range-picker-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` |
| `--xh-time-range-picker-content-border` | `content` | `border` | `default` | `--xh-border-default` |
| `--xh-time-range-picker-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-time-range-picker-content-max-h` | `content` | `max-block-size` | `default` | `none` |
| `--xh-time-range-picker-content-px` | `content` | `padding-inline` | `default` | `--xh-space-0` |
| `--xh-time-range-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-0` |
| `--xh-time-range-picker-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-time-range-picker-content-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-floating` |
| `--xh-time-range-picker-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-time-range-picker-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-time-range-picker-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-time-range-picker-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-time-range-picker-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-time-range-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-time-range-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-time-range-picker-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-time-range-picker-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-time-range-picker-control-gap` | `control`<br>`range-separator` | `gap`<br>`margin-inline` | `default`<br>`xh-field-chrome` | `--xh-_time-range-picker-gap` |
| `--xh-time-range-picker-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_time-range-picker-control-h` |
| `--xh-time-range-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-time-range-picker-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_time-range-picker-control-px` |
| `--xh-time-range-picker-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-time-range-picker-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-time-range-picker-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-time-range-picker-font-size` | `control` | `font-size` | `default` | `--xh-_time-range-picker-font-size` |
| `--xh-time-range-picker-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-time-range-picker-icon-size` | `control`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-time-range-picker-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-time-range-picker-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-time-range-picker-item-check-fg` | `item` | `background-color` | `default` | `--xh-_time-range-picker-check-fg` |
| `--xh-time-range-picker-item-check-size` | `item` | `block-size`<br>`inline-size`<br>`padding-inline` | `default` | `--xh-control-indicator-size` |
| `--xh-time-range-picker-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` |
| `--xh-time-range-picker-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-time-range-picker-item-fg` |
| `--xh-time-range-picker-item-font-size` | `item` | `font-size` | `default` | `--xh-_time-range-picker-font-size` |
| `--xh-time-range-picker-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-medium` |
| `--xh-time-range-picker-item-h` | `column`<br>`item` | `block-size`<br>`padding-block` | `default` | `--xh-control-action-size` |
| `--xh-time-range-picker-item-px` | `item` | `padding-inline` | `default` | `--xh-space-0_5` |
| `--xh-time-range-picker-item-radius` | `item` | `border-radius` | `default` | `0` |
| `--xh-time-range-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-time-range-picker-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-time-range-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-time-range-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-time-range-picker-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-time-range-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-time-range-picker-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` |
| `--xh-time-range-picker-placeholder-fg` | `segment`<br>`segment-group` | `color` | `placeholder`<br>`placeholder-shown` | `--xh-fg-subtle` |
| `--xh-time-range-picker-preset-bg` | `preset` | `background-color` | `default`<br>`disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-time-range-picker-preset-bg-hover` | `preset` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-time-range-picker-preset-bg-pressed` | `preset` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-active` |
| `--xh-time-range-picker-preset-check-fg` | `preset` | `background-color` | `default` | `--xh-_time-range-picker-check-fg` |
| `--xh-time-range-picker-preset-check-size` | `preset` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-control-indicator-sm` |
| `--xh-time-range-picker-preset-fg` | `preset` | `color` | `default`<br>`disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-muted` |
| `--xh-time-range-picker-preset-fg-disabled` | `preset` | `background-color`<br>`color` | `default`<br>`disabled` | `--xh-fg-disabled` |
| `--xh-time-range-picker-preset-fg-hover` | `preset` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-default` |
| `--xh-time-range-picker-preset-font-size` | `preset` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-time-range-picker-preset-group-gap` | `preset-group` | `gap` | `default` | `--xh-space-1` |
| `--xh-time-range-picker-preset-group-h` | `preset-group` | `max-block-size` | `default` | `--xh-overlay-time-column-h` |
| `--xh-time-range-picker-preset-group-px` | `preset-group` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-time-range-picker-preset-group-py` | `preset-group` | `padding-block` | `default` | `--xh-space-2_5` |
| `--xh-time-range-picker-preset-h` | `preset` | `block-size`<br>`line-height` | `default` | `--xh-control-action-size` |
| `--xh-time-range-picker-preset-px` | `preset` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-space-2` |
| `--xh-time-range-picker-preset-radius` | `preset` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-time-range-picker-range-separator-fg` | `range-separator` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-time-range-picker-range-separator-mx` | `range-separator` | `margin-inline` | `default` | `--xh-_time-range-picker-range-separator-mx` |
| `--xh-time-range-picker-range-separator-px` | `range-separator` | `margin-inline`<br>`padding-inline` | `default` | `--xh-space-1` |
| `--xh-time-range-picker-segment-bg-focus` | `segment` | `background` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])` | `--xh-_time-range-picker-segment-bg` |
| `--xh-time-range-picker-segment-bg-hover` | `segment` | `background` | `disabled`<br>`focus`<br>`hover`<br>`not([data-focus], [data-disabled])` | `--xh-bg-subtle` |
| `--xh-time-range-picker-segment-bg-invalid-focus` | `segment` | `background` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-bg-subtle` |
| `--xh-time-range-picker-segment-fg-focus` | `segment` | `color` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])`<br>`placeholder` | `--xh-_time-range-picker-segment-fg` |
| `--xh-time-range-picker-segment-fg-invalid` | `segment` | `color` | `invalid` | `--xh-fg-danger` |
| `--xh-time-range-picker-segment-fg-invalid-focus` | `segment` | `color` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-fg-danger` |
| `--xh-time-range-picker-segment-px` | `segment` | `padding-inline` | `default` | `--xh-space-0_5` |
| `--xh-time-range-picker-segment-radius` | `segment` | `border-radius` | `default` | `--xh-shape-inset` |
