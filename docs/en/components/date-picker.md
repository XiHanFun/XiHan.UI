# DatePicker

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/date-picker).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/date-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/date-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/date-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/date-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/date-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="date-picker"`: `root` · `label` · **`control`** · `tag-list` · `segment-group` · `trigger` · `clear-trigger` · `positioner` · **`content`** · `preset-group` · `preset` · **`calendar`** · `time-column` · `time-item` · `footer` · `confirm-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-date-picker>` |
| Vue components | `XhDatePickerCalendar` `XhDatePickerCell` `XhDatePickerCellTrigger` `XhDatePickerClearTrigger` `XhDatePickerConfirmTrigger` `XhDatePickerContent` `XhDatePickerControl` `XhDatePickerFooter` `XhDatePickerGrid` `XhDatePickerGridBody` `XhDatePickerGridHead` `XhDatePickerHeader` `XhDatePickerHeading` `XhDatePickerHeadingMonthTrigger` `XhDatePickerHeadingYearTrigger` `XhDatePickerHiddenInput` `XhDatePickerItemDeleteTrigger` `XhDatePickerLabel` `XhDatePickerNextTrigger` `XhDatePickerNextYearTrigger` `XhDatePickerOverflowTag` `XhDatePickerPositioner` `XhDatePickerPreset` `XhDatePickerPresetGroup` `XhDatePickerPrevTrigger` `XhDatePickerPrevYearTrigger` `XhDatePickerRoot` `XhDatePickerSegment` `XhDatePickerSegmentGroup` `XhDatePickerTag` `XhDatePickerTagLabel` `XhDatePickerTagList` `XhDatePickerTimeColumn` `XhDatePickerTimeItem` `XhDatePickerTimePanel` `XhDatePickerTrigger` `XhDatePickerWeekDay` `XhDatePickerWeekNumber` `XhDatePickerWeekRow` |
| Composable | `useDatePicker` |
| State machine | `datePickerMachine` |
| Skin | `@xihan-ui/styles/date-picker.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string \| string[]` |  |
| `defaultValue` | `string \| string[]` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `min` | `string` |  |
| `max` | `string` |  |
| `locale` | `string` |  |
| `timeZone` | `string` |  |
| `firstDayOfWeek` | `number` |  |
| `selectionMode` | `CalendarPickerSelectionMode` |  |
| `maxSelected` | `number` |  |
| `maxTagCount` | `number` |  |
| `isDateUnavailable` | `(value: string) => boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `name` | `string` |  |
| `granularity` | `CalendarGranularity` |  |
| `activeView` | `CalendarView` |  |
| `segments` | `DateSegmentSet` |  |
| `placeholder` | `string \| DateSegmentPlaceholders` |  |
| `presets` | `DatePickerPreset[]` |  |
| `visibleCount` | `number` |  |
| `fixedWeeks` | `boolean` |  |
| `defaultFocusedValue` | `string` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `placement` | `Placement` |  |
| `dir` | `Direction` |  |
| `offset` | `number` |  |
| `translations` | `Partial<DatePickerTranslations>` |  |
| `closeOnSelect` | `boolean` |  |
| `showTime` | `boolean` |  |
| `timeGranularity` | `DatePickerTimeGranularity` |  |
| `hourCycle` | `TimeHourCycle` |  |
| `timeStep` | `TimeStep` |  |
| `isTimeUnavailable` | `TimeUnavailablePredicate` |  |
| `onValueChange` | `(details: DatePickerValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |
| `onOpenChange` | `(details: DatePickerOpenChangeDetails) => void` |  |
| `onFocusedValueChange` | `(details: DatePickerFocusChangeDetails) => void` |  |
| `onActiveViewChange` | `(details: CalendarViewChangeDetails) => void` |  |

### DatePickerPreset

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
| `value-change` | `DatePickerValueChangeDetails` |
| `clear` | `` |
| `open-change` | `DatePickerOpenChangeDetails` |
| `focused-value-change` | `DatePickerFocusChangeDetails` |
| `active-view-change` | `CalendarViewChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhDatePickerPreset` | `default` | — |
| `XhDatePickerPresetGroup` | `default` | `DatePickerPresetsSlotProps` |
| `XhDatePickerRoot` | `default` | `DatePickerRootSlotProps` |
| `XhDatePickerRoot` | `label` | — |
| `XhDatePickerSegment` | `default` | `DatePickerSegmentSlotProps` |
| `XhDatePickerTimeColumn` | `default` | — |
| `XhDatePickerTimeItem` | `default` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhDatePickerCalendar` | `index` | `number \| string` |  |
| `XhDatePickerCell` | `value` | `string` | Yes |
| `XhDatePickerCell` | `index` | `number \| string` |  |
| `XhDatePickerGrid` | `index` | `number \| string` |  |
| `XhDatePickerHeading` | `index` | `number \| string` |  |
| `XhDatePickerHeadingMonthTrigger` | `index` | `number \| string` |  |
| `XhDatePickerHeadingYearTrigger` | `index` | `number \| string` |  |
| `XhDatePickerPositioner` | `container` | `() => Element \| null` |  |
| `XhDatePickerPreset` | `value` | `string` | Yes |
| `XhDatePickerPresetGroup` | `children` | `SlotChildren<DatePickerPresetsSlotProps>` |  |
| `XhDatePickerRoot` | `label` | `ReactNode` |  |
| `XhDatePickerRoot` | `children` | `SlotChildren<DatePickerRootSlotProps>` |  |
| `XhDatePickerSegment` | `index` | `number \| string` |  |
| `XhDatePickerSegment` | `segment` | `DateSegmentType` |  |
| `XhDatePickerSegment` | `children` | `SlotChildren<DatePickerSegmentSlotProps>` |  |
| `XhDatePickerTag` | `value` | `string` | Yes |
| `XhDatePickerTimeColumn` | `unit` | `DatePickerTimeUnit` | Yes |
| `XhDatePickerTimeItem` | `value` | `string` | Yes |
| `XhDatePickerWeekDay` | `value` | `number \| string` | Yes |
| `XhDatePickerWeekNumber` | `value` | `string` | Yes |

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

**Events**: `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `VALUE.REMOVE` · `TAG_LIST.TRACKED` · `FOCUSED.SET` · `VIEW.SET` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `isOpenControlled` · `closesOnSelect` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `value` | `string[]` |
| `valueAsString` | `string \| null` |
| `selectionMode` | `CalendarPickerSelectionMode` |
| `periodValue` | `CalendarPeriodValue \| null` |
| `focusedValue` | `string` |
| `granularity` | `CalendarGranularity` |
| `activeView` | `CalendarView` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `canClear` | `boolean` |
| `tags` | `DatePickerTagMeta[]` |
| `overflowCount` | `number` |
| `overflowText` | `string` |
| `deselect` | `(value: string) => void` |
| `setOpen` | `(next: boolean) => void` |
| `setValue` | `(next: string[]) => void` |
| `clear` | `() => void` |
| `setActiveView` | `(next: CalendarView) => void` |
| `presets` | `readonly DatePickerPresetState[]` |
| `showTime` | `boolean` |
| `timeColumns` | `readonly TimePickerColumn<DatePickerTimeUnit>[]` |
| `timeValue` | `string \| null` |
| `hourCycle` | `TimeHourCycle` |
| `timeStep` | `ResolvedTimeStep` |
| `getTimeItemText` | `(props: DatePickerTimeItemProps) => string` |
| `isTimeItemDisabled` | `(props: DatePickerTimeItemProps) => boolean` |
| `calendar` | `CalendarPickerApi<T>` |
| `translations` | `DatePickerTranslations` |
| `field` | `DatePickerFieldApi<T>` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getControlProps` | `() => T['element']` |
| `getTagListProps` | `() => T['element']` |
| `getTagProps` | `(props: DatePickerTagProps) => T['element']` |
| `getTagLabelProps` | `() => T['element']` |
| `getOverflowTagProps` | `() => T['element']` |
| `getItemDeleteTriggerProps` | `(props: DatePickerTagProps) => T['button']` |
| `getSegmentGroupProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getPresetGroupProps` | `() => T['element']` |
| `getPresetProps` | `(props: DatePickerPresetProps) => T['element']` |
| `getCalendarProps` | `() => T['element']` |
| `getTimeColumnProps` | `(props: DatePickerTimeColumnProps) => T['element']` |
| `getTimeItemProps` | `(props: DatePickerTimeItemProps) => T['element']` |
| `getFooterProps` | `() => T['element']` |
| `getConfirmTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `date-picker.kbd.open` |
| `Enter` / `Space` | `date-picker.kbd.toggle` |
| `Escape` | `date-picker.kbd.escape` |
| `Tab` / `Shift+Tab` | `date-picker.kbd.tab` |
| `Enter` / `Space` | `date-picker.kbd.select` |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | `date-picker.kbd.preset-move` |
| `Enter` / `Space` | `date-picker.kbd.preset-pick` |
| `Alt+ArrowDown` | `date-picker.kbd.segment-open` |
| `Backspace` | `date-picker.kbd.remove-last` |
| `Enter` | `date-picker.kbd.segment-close` |
| `Enter` / `Space` | `date-picker.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `segment-group` | `aria-disabled` | 'true' \| 'false' |
| `segment-group` | `aria-label` | props.ariaLabel |
| `segment-group` | `aria-labelledby` | id of the `label` part \| undefined |
| `segment-group` | `role` | 'group' |
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

`@xihan-ui/styles/date-picker.css` is written against `[data-scope="date-picker"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-date-picker` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

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
| `control` | `data-xh-action-owner` | '' |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-layout` | 'multi-tag' \| undefined |
| `control` | `data-xh-field-size` | props.size |
| `tag-list` | `data-disabled` | '' (present only while the condition holds) |
| `tag-list` | `data-instant` | '' (present only while the condition holds) |
| `tag-list` | `data-placeholder-shown` | '' (present only while the condition holds) |
| `tag-list` | `data-placeholder-text` | props.placeholder \| undefined \| undefined |
| `tag-list` | `data-xh-tag-list` | '' |
| `segment-group` | `data-complete` | '' (present only while the condition holds) |
| `segment-group` | `data-disabled` | '' (present only while the condition holds) |
| `segment-group` | `data-empty` | '' (present only while the condition holds) |
| `segment-group` | `data-invalid` | '' (present only while the condition holds) |
| `segment-group` | `data-out-of-range` | '' (present only while the condition holds) |
| `segment-group` | `data-placeholder-shown` | '' (present only while the condition holds) |
| `segment-group` | `data-placeholder-text` | props.placeholder \| undefined |
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
| `time-column` | `data-unit` | live[at]!.getAttribute('data-unit') as DatePickerTime… |
| `time-item` | `data-disabled` | '' (present only while the condition holds) |
| `time-item` | `data-pressed` | '' (present only while the condition holds) |
| `time-item` | `data-state` | 'checked' \| 'unchecked' |
| `time-item` | `data-unit` | live[at]!.getAttribute('data-unit') as DatePickerTime… |
| `time-item` | `data-value` | v |
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
| `overflow-tag` | `data-count` | String(overflowCount) |
| `tag` | `data-value` | v |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-date-picker-action-bg` | `clear-trigger`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-date-picker-action-bg-active` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-date-picker-action-bg-hover` | `clear-trigger`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open`<br>`xh-ink-surface` | `--xh-_action-variant-bg-hover` |
| `--xh-date-picker-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-field-clear`<br>`--xh-fg-muted` |
| `--xh-date-picker-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open` | `--xh-fg-default` |
| `--xh-date-picker-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-date-picker-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-circle`<br>`--xh-shape-inset` |
| `--xh-date-picker-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-date-picker-calendar-gap` | `calendar` | `gap` | `default` | `--xh-space-0` |
| `--xh-date-picker-column-divider` | `calendar`<br>`preset-group`<br>`time-column` | `background`<br>`border-block-end`<br>`border-block-start`<br>`border-inline-end` | `@media (min-width: 768px)`<br>`default`<br>`has(+ [data-part='time-column'])` | `--xh-material-solid-border` |
| `--xh-date-picker-confirm-trigger-bg` | `confirm-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-date-picker-confirm-trigger-bg-active` | `confirm-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-date-picker-confirm-trigger-bg-hover` | `confirm-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-date-picker-confirm-trigger-fg` | `confirm-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-date-picker-confirm-trigger-font-size` | `confirm-trigger` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-date-picker-confirm-trigger-h` | `confirm-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-date-picker-confirm-trigger-margin` | `confirm-trigger`<br>`content` | `margin` | `has(> [data-part='time-column'])` | `--xh-space-2` |
| `--xh-date-picker-confirm-trigger-px` | `confirm-trigger` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-date-picker-confirm-trigger-radius` | `confirm-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-date-picker-confirm-trigger-shadow` | `confirm-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` |
| `--xh-date-picker-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` |
| `--xh-date-picker-content-border` | `content` | `border` | `default` | `--xh-border-default` |
| `--xh-date-picker-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-date-picker-content-px` | `content` | `padding-inline` | `default` | `--xh-space-0` |
| `--xh-date-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-0` |
| `--xh-date-picker-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-date-picker-content-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-floating` |
| `--xh-date-picker-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-date-picker-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-date-picker-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-date-picker-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-date-picker-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-date-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-date-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-date-picker-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-date-picker-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-date-picker-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_date-picker-gap` |
| `--xh-date-picker-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_date-picker-control-h` |
| `--xh-date-picker-control-max-h` | `control` | `max-block-size` | `xh-field-layout=multi-tag` | `--xh-viewport-h-sm` |
| `--xh-date-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-date-picker-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_date-picker-control-px` |
| `--xh-date-picker-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-date-picker-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-date-picker-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-date-picker-font-size` | `segment-group`<br>`tag-list` | `font-size` | `default` | `--xh-_date-picker-font-size` |
| `--xh-date-picker-footer-border` | `footer` | `border-block-start` | `default` | `--xh-material-solid-border` |
| `--xh-date-picker-footer-fg` | `footer` | `color` | `default` | `--xh-fg-muted` |
| `--xh-date-picker-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-date-picker-footer-gap` | `footer` | `gap`<br>`inline-size` | `default` | `--xh-space-2` |
| `--xh-date-picker-footer-px` | `footer` | `inline-size` | `default` | `--xh-space-2` |
| `--xh-date-picker-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-date-picker-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-date-picker-heading-font-weight` | `calendar`<br>`heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-weight` | `default` | `--xh-font-weight-regular` |
| `--xh-date-picker-icon-size` | `control`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-date-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-date-picker-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-date-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-date-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-date-picker-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-date-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-date-picker-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` |
| `--xh-date-picker-max-h` | `content` | `max-block-size` | `default` | `--xh-_date-picker-available-h` |
| `--xh-date-picker-placeholder-fg` | `segment-group`<br>`tag-list` | `color` | `placeholder-shown` | `--xh-fg-subtle` |
| `--xh-date-picker-preset-bg` | `preset` | `background-color` | `default`<br>`disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-date-picker-preset-bg-hover` | `preset` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-date-picker-preset-bg-pressed` | `preset` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-active` |
| `--xh-date-picker-preset-check-fg` | `preset` | `background-color` | `default` | `--xh-_date-picker-check-fg` |
| `--xh-date-picker-preset-check-size` | `preset` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-control-indicator-sm` |
| `--xh-date-picker-preset-fg` | `preset` | `color` | `default`<br>`disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-muted` |
| `--xh-date-picker-preset-fg-disabled` | `preset` | `background-color`<br>`color` | `default`<br>`disabled` | `--xh-fg-disabled` |
| `--xh-date-picker-preset-fg-hover` | `preset` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-default` |
| `--xh-date-picker-preset-font-size` | `preset` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-date-picker-preset-group-gap` | `preset-group` | `gap` | `default` | `--xh-space-1` |
| `--xh-date-picker-preset-group-h` | `preset-group` | `max-block-size` | `default` | `--xh-viewport-h-lg` |
| `--xh-date-picker-preset-group-px` | `preset-group` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-date-picker-preset-group-py` | `preset-group` | `padding-block` | `default` | `--xh-space-2_5` |
| `--xh-date-picker-preset-h` | `preset` | `block-size`<br>`line-height` | `default` | `--xh-control-action-size` |
| `--xh-date-picker-preset-px` | `preset` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-space-2` |
| `--xh-date-picker-preset-radius` | `preset` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-date-picker-tag-list-gap` | `tag-list` | `gap` | `xh-tag-list` | `--xh-space-1` |
| `--xh-date-picker-time-column-gap` | `time-column`<br>`time-item` | `gap`<br>`inset-block` | `default` | `--xh-space-2` |
| `--xh-date-picker-time-column-h` | `time-column` | `block-size`<br>`padding-block` | `@media (pointer: coarse)`<br>`default` | `--xh-overlay-calendar-column-h`<br>`--xh-overlay-calendar-column-h-coarse` |
| `--xh-date-picker-time-column-min-w` | `time-column` | `min-inline-size` | `default` | `--xh-overlay-column-min-w` |
| `--xh-date-picker-time-column-min-w-mobile` | `time-column` | `min-inline-size` | `@media not all and (min-width: 768px)` | `2.75rem` |
| `--xh-date-picker-time-column-offset` | `time-column` | `margin-block-start` | `default` | `--xh-control-action-size` |
| `--xh-date-picker-time-column-px` | `time-column` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-date-picker-time-column-px-mobile` | `time-column` | `padding-inline` | `@media not all and (min-width: 768px)` | `--xh-space-1` |
| `--xh-date-picker-time-column-py` | `time-column` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-date-picker-time-item-bg-hover` | `time-item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-date-picker-time-item-bg-pressed` | `time-item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-date-picker-time-item-check-fg` | `time-item` | `background-color` | `default` | `--xh-_date-picker-check-fg` |
| `--xh-date-picker-time-item-check-size` | `time-item` | `block-size`<br>`inline-size`<br>`inset-inline-end`<br>`padding-inline` | `@media not all and (min-width: 768px)`<br>`default` | `--xh-_date-picker-time-item-check-size` |
| `--xh-date-picker-time-item-fg` | `time-item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` |
| `--xh-date-picker-time-item-fg-selected` | `time-item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-date-picker-time-item-fg` |
| `--xh-date-picker-time-item-font-size` | `time-item` | `font-size` | `default` | `--xh-_date-picker-font-size` |
| `--xh-date-picker-time-item-font-weight-selected` | `time-item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-medium` |
| `--xh-date-picker-time-item-h` | `time-column`<br>`time-item` | `block-size`<br>`padding-block` | `default` | `--xh-control-action-size` |
| `--xh-date-picker-time-item-px` | `time-item` | `inset-inline-end`<br>`padding-inline` | `default` | `--xh-space-0_5` |
| `--xh-date-picker-time-item-radius` | `time-item` | `border-radius` | `default` | `--xh-shape-inset` |
