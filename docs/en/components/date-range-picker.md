# DateRangePicker

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/date-range-picker).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/date-range-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/date-range-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/date-range-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/date-range-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/date-range-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="date-range-picker"`: `root` · `label` · **`control`** · `segment-group` · `range-separator` · `trigger` · `clear-trigger` · `positioner` · **`content`** · `preset-group` · `preset` · **`calendar`** · `column-group` · `column-group-label` · `time-column` · `time-item` · `footer` · `confirm-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-date-range-picker>` |
| Vue components | `XhDateRangePickerCalendar` `XhDateRangePickerCell` `XhDateRangePickerCellTrigger` `XhDateRangePickerClearTrigger` `XhDateRangePickerColumnGroup` `XhDateRangePickerColumnGroupLabel` `XhDateRangePickerConfirmTrigger` `XhDateRangePickerContent` `XhDateRangePickerControl` `XhDateRangePickerFooter` `XhDateRangePickerGrid` `XhDateRangePickerGridBody` `XhDateRangePickerGridHead` `XhDateRangePickerHeader` `XhDateRangePickerHeading` `XhDateRangePickerHeadingMonthTrigger` `XhDateRangePickerHeadingYearTrigger` `XhDateRangePickerHiddenInput` `XhDateRangePickerLabel` `XhDateRangePickerNextTrigger` `XhDateRangePickerNextYearTrigger` `XhDateRangePickerPositioner` `XhDateRangePickerPreset` `XhDateRangePickerPresetGroup` `XhDateRangePickerPrevTrigger` `XhDateRangePickerPrevYearTrigger` `XhDateRangePickerRangeSeparator` `XhDateRangePickerRoot` `XhDateRangePickerSegment` `XhDateRangePickerSegmentGroup` `XhDateRangePickerTimeColumn` `XhDateRangePickerTimeItem` `XhDateRangePickerTimePanel` `XhDateRangePickerTrigger` `XhDateRangePickerWeekDay` `XhDateRangePickerWeekNumber` `XhDateRangePickerWeekRow` |
| Composable | `useDateRangePicker` |
| State machine | `dateRangePickerMachine` |
| Skin | `@xihan-ui/styles/date-range-picker.css` |

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
| `timeZone` | `string` |  |
| `firstDayOfWeek` | `number` |  |
| `isDateUnavailable` | `(value: string, anchor: string \| null) => boolean` |  |
| `allowsNonContiguousRanges` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `name` | `string` |  |
| `endName` | `string` |  |
| `placeholder` | `DateSegmentPlaceholders` |  |
| `startPlaceholder` | `string` |  |
| `endPlaceholder` | `string` |  |
| `granularity` | `CalendarGranularity` |  |
| `activeView` | `CalendarView` |  |
| `segments` | `DateSegmentSet` |  |
| `presets` | `DateRangePickerPreset[]` |  |
| `visibleCount` | `number` |  |
| `fixedWeeks` | `boolean` |  |
| `defaultFocusedValue` | `string` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `placement` | `Placement` |  |
| `dir` | `Direction` |  |
| `offset` | `number` |  |
| `translations` | `Partial<DateRangePickerTranslations>` |  |
| `closeOnSelect` | `boolean` |  |
| `showTime` | `boolean` |  |
| `timeGranularity` | `DatePickerTimeGranularity` |  |
| `hourCycle` | `TimeHourCycle` |  |
| `timeStep` | `TimeStep` |  |
| `isTimeUnavailable` | `TimeUnavailablePredicate` |  |
| `defaultTime` | `[string, string]` |  |
| `activeIndex` | `DateRangePickerEndIndex` |  |
| `onActiveIndexChange` | `(details: DateRangePickerActiveIndexChangeDetails) => void` |  |
| `onValueChange` | `(details: DateRangePickerValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |
| `onOpenChange` | `(details: DateRangePickerOpenChangeDetails) => void` |  |
| `onFocusedValueChange` | `(details: DateRangePickerFocusChangeDetails) => void` |  |
| `onActiveViewChange` | `(details: CalendarViewChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `DateRangePickerValueChangeDetails` |
| `clear` | `` |
| `open-change` | `DateRangePickerOpenChangeDetails` |
| `focused-value-change` | `DateRangePickerFocusChangeDetails` |
| `active-view-change` | `CalendarViewChangeDetails` |
| `active-index-change` | `DateRangePickerActiveIndexChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhDateRangePickerColumnGroup` | `default` | — |
| `XhDateRangePickerColumnGroupLabel` | `default` | — |
| `XhDateRangePickerPreset` | `default` | — |
| `XhDateRangePickerPresetGroup` | `default` | `DateRangePickerPresetsSlotProps` |
| `XhDateRangePickerRoot` | `default` | `DateRangePickerRootSlotProps` |
| `XhDateRangePickerRoot` | `label` | — |
| `XhDateRangePickerSegment` | `default` | `DateRangePickerSegmentSlotProps` |
| `XhDateRangePickerTimeColumn` | `default` | — |
| `XhDateRangePickerTimeItem` | `default` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhDateRangePickerCalendar` | `index` | `number \| string` |  |
| `XhDateRangePickerCell` | `value` | `string` | Yes |
| `XhDateRangePickerCell` | `index` | `number \| string` |  |
| `XhDateRangePickerColumnGroup` | `index` | `number \| string` |  |
| `XhDateRangePickerGrid` | `index` | `number \| string` |  |
| `XhDateRangePickerHeading` | `index` | `number \| string` |  |
| `XhDateRangePickerHeadingMonthTrigger` | `index` | `number \| string` |  |
| `XhDateRangePickerHeadingYearTrigger` | `index` | `number \| string` |  |
| `XhDateRangePickerHiddenInput` | `index` | `number \| string` |  |
| `XhDateRangePickerPositioner` | `container` | `() => Element \| null` |  |
| `XhDateRangePickerPreset` | `value` | `string` | Yes |
| `XhDateRangePickerPresetGroup` | `children` | `SlotChildren<DateRangePickerPresetsSlotProps>` |  |
| `XhDateRangePickerRoot` | `label` | `ReactNode` |  |
| `XhDateRangePickerRoot` | `children` | `SlotChildren<DateRangePickerRootSlotProps>` |  |
| `XhDateRangePickerSegment` | `index` | `number \| string` |  |
| `XhDateRangePickerSegment` | `segment` | `DateSegmentType` |  |
| `XhDateRangePickerSegment` | `children` | `SlotChildren<DateRangePickerSegmentSlotProps>` |  |
| `XhDateRangePickerSegmentGroup` | `index` | `number \| string` |  |
| `XhDateRangePickerTimeColumn` | `unit` | `DatePickerTimeUnit` | Yes |
| `XhDateRangePickerTimeItem` | `value` | `string` | Yes |
| `XhDateRangePickerWeekDay` | `value` | `number \| string` | Yes |
| `XhDateRangePickerWeekNumber` | `value` | `string` | Yes |

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
| `calendar` | 'open' \| 'closed' |
| `time-item` | 'checked' \| 'unchecked' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `FOCUSED.SET` · `VIEW.SET` · `ACTIVE_INDEX.SET` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `isOpenControlled` · `closesOnSelect` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `value` | `string[]` |
| `start` | `string \| null` |
| `end` | `string \| null` |
| `periodValue` | `CalendarPeriodValue \| null` |
| `focusedValue` | `string` |
| `granularity` | `CalendarGranularity` |
| `activeView` | `CalendarView` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `canClear` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `setValue` | `(next: string[]) => void` |
| `clear` | `() => void` |
| `setActiveView` | `(next: CalendarView) => void` |
| `presets` | `readonly DateRangePickerPresetState[]` |
| `activeIndex` | `DateRangePickerEndIndex` |
| `setActiveIndex` | `(next: DateRangePickerEndIndex) => void` |
| `showTime` | `boolean` |
| `timeColumnGroups` | `readonly [DateRangePickerTimeColumnGroup, DateRangePickerTimeColumnGroup]` |
| `timeValues` | `readonly [string \| null, string \| null]` |
| `hourCycle` | `TimeHourCycle` |
| `timeStep` | `ResolvedTimeStep` |
| `getTimeItemText` | `(props: DateRangePickerTimeItemTextProps) => string` |
| `isTimeItemDisabled` | `(props: DateRangePickerTimeItemProps) => boolean` |
| `calendar` | `CalendarRangePickerApi<T>` |
| `field` | `DateRangePickerFieldApi<T>` |
| `fieldEnd` | `DateRangePickerFieldApi<T>` |
| `translations` | `DateRangePickerTranslations` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getControlProps` | `() => T['element']` |
| `getSegmentGroupProps` | `(props?: DateRangePickerSegmentGroupProps) => T['element']` |
| `getRangeSeparatorProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getPresetGroupProps` | `() => T['element']` |
| `getPresetProps` | `(props: DateRangePickerPresetProps) => T['element']` |
| `getCalendarProps` | `() => T['element']` |
| `getColumnGroupProps` | `(props: DateRangePickerColumnGroupProps) => T['element']` |
| `getColumnGroupLabelProps` | `(props: DateRangePickerColumnGroupProps) => T['element']` |
| `getTimeColumnProps` | `(props: DateRangePickerTimeColumnProps) => T['element']` |
| `getTimeItemProps` | `(props: DateRangePickerTimeItemProps) => T['element']` |
| `getFooterProps` | `() => T['element']` |
| `getConfirmTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `date-range-picker.kbd.open` |
| `Enter` / `Space` | `date-range-picker.kbd.toggle` |
| `Escape` | `date-range-picker.kbd.escape` |
| `Tab` / `Shift+Tab` | `date-range-picker.kbd.tab` |
| `Enter` / `Space` | `date-range-picker.kbd.select` |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | `date-range-picker.kbd.preset-move` |
| `Enter` / `Space` | `date-range-picker.kbd.preset-pick` |
| `Alt+ArrowDown` | `date-range-picker.kbd.segment-open` |
| `Enter` | `date-range-picker.kbd.segment-close` |
| `Enter` / `Space` | `date-range-picker.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `segment-group` | `aria-disabled` | 'true' \| 'false' |
| `segment-group` | `aria-label` | label.endDate \| label.startDate |
| `segment-group` | `role` | 'group' |
| `range-separator` | `aria-hidden` | 'true' |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `trigger` | `aria-label` | props.ariaLabel |
| `trigger` | `aria-labelledby` | id of the `label` part \| undefined |
| `clear-trigger` | `aria-label` | label.clearTrigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | props.ariaLabel |
| `content` | `aria-labelledby` | id of the `label` part \| undefined |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `preset-group` | `aria-disabled` | 'true' \| 'false' |
| `preset-group` | `aria-label` | label.presets |
| `preset-group` | `aria-multiselectable` | 'false' |
| `preset-group` | `aria-orientation` | 'vertical' |
| `preset-group` | `role` | 'listbox' |
| `preset` | `aria-disabled` | 'true' \| 'false' |
| `preset` | `aria-selected` | 'true' \| 'false' |
| `preset` | `role` | 'option' |
| `column-group` | `aria-label` | label.endTime \| label.startTime |
| `column-group` | `role` | 'group' |
| `column-group-label` | `aria-hidden` | 'true' |
| `time-column` | `aria-disabled` | 'true' \| 'false' |
| `time-column` | `aria-label` | label[unit] |
| `time-column` | `aria-multiselectable` | 'false' |
| `time-column` | `aria-orientation` | 'vertical' |
| `time-column` | `role` | 'listbox' |
| `time-item` | `aria-disabled` | 'true' \| 'false' |
| `time-item` | `aria-selected` | 'true' \| 'false' |
| `time-item` | `role` | 'option' |

## Style reference

### Skin

`@xihan-ui/styles/date-range-picker.css` is written against `[data-scope="date-range-picker"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-date-range-picker` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
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
| `preset` | `data-value` | v |
| `preset` | `data-xh-collection-context` | 'overlay' |
| `preset` | `data-xh-collection-item` | '' |
| `preset` | `data-xh-collection-size` | props.size |
| `calendar` | `data-disabled` | '' (present only while the condition holds) |
| `calendar` | `data-readonly` | '' (present only while the condition holds) |
| `calendar` | `data-state` | 'open' \| 'closed' |
| `column-group` | `data-editing` | '' (present only while the condition holds) |
| `column-group` | `data-index` | String(index) |
| `column-group-label` | `data-editing` | '' (present only while the condition holds) |
| `column-group-label` | `data-index` | String(index) |
| `time-column` | `data-index` | String(index) |
| `time-column` | `data-unit` | target.getAttribute('data-unit') as DatePickerTimeUni… |
| `time-item` | `data-disabled` | '' (present only while the condition holds) |
| `time-item` | `data-index` | String(index) |
| `time-item` | `data-pressed` | '' (present only while the condition holds) |
| `time-item` | `data-state` | 'checked' \| 'unchecked' |
| `time-item` | `data-unit` | target.getAttribute('data-unit') as DatePickerTimeUni… |
| `time-item` | `data-value` | current.getAttribute('data-value') |
| `time-item` | `data-xh-collection-context` | 'overlay' |
| `time-item` | `data-xh-collection-item` | '' |
| `time-item` | `data-xh-collection-size` | props.size |
| `confirm-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `confirm-trigger` | `data-xh-action-control` | '' |
| `confirm-trigger` | `data-xh-action-display` | 'always' |
| `confirm-trigger` | `data-xh-action-profile` | 'text' |
| `confirm-trigger` | `data-xh-action-size` | 'xs' |
| `confirm-trigger` | `data-xh-action-variant` | 'solid' |
| `confirm-trigger` | `data-xh-ink-surface` | '' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-date-range-picker-action-bg` | `clear-trigger`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-date-range-picker-action-bg-active` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-date-range-picker-action-bg-hover` | `clear-trigger`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open`<br>`xh-ink-surface` | `--xh-_action-variant-bg-hover` |
| `--xh-date-range-picker-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-date-range-picker-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open` | `--xh-fg-default` |
| `--xh-date-range-picker-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-date-range-picker-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-date-range-picker-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-date-range-picker-calendar-gap` | `calendar` | `gap` | `default` | `--xh-space-0` |
| `--xh-date-range-picker-column-divider` | `column-group`<br>`preset-group`<br>`time-column` | `border-block-end`<br>`border-block-start`<br>`border-inline-end`<br>`border-inline-start` | `@media (min-width: 768px)`<br>`default` | `--xh-material-solid-border` |
| `--xh-date-range-picker-column-group-gap` | `column-group` | `margin-inline-start` | `default` | `--xh-space-0` |
| `--xh-date-range-picker-column-group-label-fg` | `column-group-label` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-date-range-picker-column-group-label-px` | `column-group-label` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-date-range-picker-column-group-offset` | `column-group`<br>`column-group-label` | `block-size`<br>`padding-block-start` | `default` | `--xh-control-action-size` |
| `--xh-date-range-picker-confirm-trigger-bg` | `confirm-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-date-range-picker-confirm-trigger-bg-active` | `confirm-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-date-range-picker-confirm-trigger-bg-hover` | `confirm-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-date-range-picker-confirm-trigger-fg` | `confirm-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-date-range-picker-confirm-trigger-font-size` | `confirm-trigger` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-date-range-picker-confirm-trigger-h` | `confirm-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-date-range-picker-confirm-trigger-margin` | `confirm-trigger`<br>`content` | `margin` | `has(> [data-part='column-group'])` | `--xh-space-2` |
| `--xh-date-range-picker-confirm-trigger-px` | `confirm-trigger` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-date-range-picker-confirm-trigger-radius` | `confirm-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-date-range-picker-confirm-trigger-shadow` | `confirm-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` |
| `--xh-date-range-picker-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` |
| `--xh-date-range-picker-content-border` | `content` | `border` | `default` | `--xh-border-default` |
| `--xh-date-range-picker-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-date-range-picker-content-px` | `content` | `padding-inline` | `default` | `--xh-space-0` |
| `--xh-date-range-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-0` |
| `--xh-date-range-picker-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-date-range-picker-content-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-floating` |
| `--xh-date-range-picker-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-date-range-picker-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-date-range-picker-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-date-range-picker-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-date-range-picker-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-date-range-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-date-range-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-date-range-picker-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-date-range-picker-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-date-range-picker-control-gap` | `control`<br>`range-separator` | `gap`<br>`margin-inline` | `default`<br>`xh-field-chrome` | `--xh-_date-range-picker-gap` |
| `--xh-date-range-picker-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_date-range-picker-control-h` |
| `--xh-date-range-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-date-range-picker-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_date-range-picker-control-px` |
| `--xh-date-range-picker-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-date-range-picker-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-date-range-picker-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-date-range-picker-font-size` | `segment-group` | `font-size` | `default` | `--xh-_date-range-picker-font-size` |
| `--xh-date-range-picker-footer-border` | `footer` | `border-block-start` | `default` | `--xh-material-solid-border` |
| `--xh-date-range-picker-footer-fg` | `footer` | `color` | `default` | `--xh-fg-muted` |
| `--xh-date-range-picker-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-date-range-picker-footer-gap` | `footer` | `gap`<br>`inline-size` | `default` | `--xh-space-2` |
| `--xh-date-range-picker-footer-px` | `footer` | `inline-size` | `default` | `--xh-space-2` |
| `--xh-date-range-picker-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-date-range-picker-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-date-range-picker-heading-font-weight` | `calendar`<br>`heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-weight` | `default` | `--xh-font-weight-regular` |
| `--xh-date-range-picker-icon-size` | `control`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-date-range-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-date-range-picker-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-date-range-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-date-range-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-date-range-picker-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-date-range-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-date-range-picker-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` |
| `--xh-date-range-picker-max-h` | `content` | `max-block-size` | `default` | `--xh-_date-range-picker-available-h` |
| `--xh-date-range-picker-placeholder-fg` | `segment-group` | `color` | `placeholder-shown` | `--xh-fg-subtle` |
| `--xh-date-range-picker-preset-bg` | `preset` | `background-color` | `default`<br>`disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-date-range-picker-preset-bg-hover` | `preset` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-date-range-picker-preset-bg-pressed` | `preset` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-active` |
| `--xh-date-range-picker-preset-check-fg` | `preset` | `background-color` | `default` | `--xh-_date-range-picker-check-fg` |
| `--xh-date-range-picker-preset-check-size` | `preset` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-control-indicator-sm` |
| `--xh-date-range-picker-preset-fg` | `preset` | `color` | `default`<br>`disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-muted` |
| `--xh-date-range-picker-preset-fg-disabled` | `preset` | `background-color`<br>`color` | `default`<br>`disabled` | `--xh-fg-disabled` |
| `--xh-date-range-picker-preset-fg-hover` | `preset` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-default` |
| `--xh-date-range-picker-preset-font-size` | `preset` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-date-range-picker-preset-group-gap` | `preset-group` | `gap` | `default` | `--xh-space-1` |
| `--xh-date-range-picker-preset-group-h` | `preset-group` | `max-block-size` | `default` | `--xh-viewport-h-lg` |
| `--xh-date-range-picker-preset-group-px` | `preset-group` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-date-range-picker-preset-group-py` | `preset-group` | `padding-block` | `default` | `--xh-space-2_5` |
| `--xh-date-range-picker-preset-h` | `preset` | `block-size`<br>`line-height` | `default` | `--xh-control-action-size` |
| `--xh-date-range-picker-preset-px` | `preset` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-space-2` |
| `--xh-date-range-picker-preset-radius` | `preset` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-date-range-picker-range-separator-fg` | `range-separator` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-date-range-picker-range-separator-mx` | `range-separator` | `margin-inline` | `default` | `--xh-_date-range-picker-range-separator-mx` |
| `--xh-date-range-picker-range-separator-px` | `range-separator` | `margin-inline`<br>`padding-inline` | `default` | `--xh-space-1` |
| `--xh-date-range-picker-time-column-gap` | `time-column`<br>`time-item` | `gap`<br>`inset-block` | `default` | `--xh-space-2` |
| `--xh-date-range-picker-time-column-h` | `time-column` | `block-size`<br>`padding-block` | `@media (pointer: coarse)`<br>`default` | `--xh-overlay-calendar-column-h`<br>`--xh-overlay-calendar-column-h-coarse` |
| `--xh-date-range-picker-time-column-min-w` | `time-column` | `min-inline-size` | `default` | `--xh-overlay-column-min-w` |
| `--xh-date-range-picker-time-column-min-w-mobile` | `time-column` | `min-inline-size` | `@media not all and (min-width: 768px)` | `--xh-overlay-column-min-w` |
| `--xh-date-range-picker-time-column-px` | `time-column` | `padding-inline` | `default` | `0` |
| `--xh-date-range-picker-time-column-py` | `time-column` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-date-range-picker-time-item-bg-hover` | `time-item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-date-range-picker-time-item-bg-pressed` | `time-item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-date-range-picker-time-item-check-fg` | `time-item` | `background-color` | `default` | `--xh-_date-range-picker-check-fg` |
| `--xh-date-range-picker-time-item-check-size` | `time-item` | `block-size`<br>`inline-size`<br>`inset-inline-end`<br>`padding-inline` | `@media not all and (min-width: 768px)`<br>`default` | `--xh-_date-range-picker-time-item-check-size` |
| `--xh-date-range-picker-time-item-fg` | `time-item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` |
| `--xh-date-range-picker-time-item-fg-selected` | `time-item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-date-range-picker-time-item-fg` |
| `--xh-date-range-picker-time-item-font-size` | `time-item` | `font-size` | `default` | `--xh-_date-range-picker-font-size` |
| `--xh-date-range-picker-time-item-font-weight-selected` | `time-item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-medium` |
| `--xh-date-range-picker-time-item-h` | `time-column`<br>`time-item` | `block-size`<br>`padding-block` | `default` | `--xh-control-action-size` |
| `--xh-date-range-picker-time-item-px` | `time-item` | `inset-inline-end`<br>`padding-inline` | `default` | `--xh-space-0_5` |
| `--xh-date-range-picker-time-item-radius` | `time-item` | `border-radius` | `default` | `0` |
