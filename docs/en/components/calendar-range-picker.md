# CalendarRangePicker

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/calendar-range-picker).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/calendar-range-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/calendar-range-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/calendar-range-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/calendar-range-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/calendar-range-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="calendar-range-picker"`: `root` · `header` · `prev-year-trigger` · `prev-trigger` · `next-trigger` · `next-year-trigger` · `heading` · `heading-year-trigger` · `heading-month-trigger` · **`grid`** · `grid-head` · `week-day` · `grid-body` · `week-row` · `week-number` · **`cell`** · **`cell-trigger`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-calendar-range-picker>` |
| Vue components | `XhCalendarRangePickerCell` `XhCalendarRangePickerCellTrigger` `XhCalendarRangePickerGrid` `XhCalendarRangePickerGridBody` `XhCalendarRangePickerGridHead` `XhCalendarRangePickerHeader` `XhCalendarRangePickerHeading` `XhCalendarRangePickerHeadingMonthTrigger` `XhCalendarRangePickerHeadingYearTrigger` `XhCalendarRangePickerNextTrigger` `XhCalendarRangePickerNextYearTrigger` `XhCalendarRangePickerPrevTrigger` `XhCalendarRangePickerPrevYearTrigger` `XhCalendarRangePickerRoot` `XhCalendarRangePickerWeekDay` `XhCalendarRangePickerWeekNumber` `XhCalendarRangePickerWeekRow` |
| Composable | `useCalendarRangePicker` |
| State machine | `calendarRangePickerMachine` |
| Skin | `@xihan-ui/styles/calendar-range-picker.css` |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `CalendarRangePickerValueChangeDetails` |
| `focused-value-change` | `CalendarFocusChangeDetails` |
| `active-view-change` | `CalendarViewChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhCalendarRangePickerRoot` | `default` | `CalendarRangePickerRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhCalendarRangePickerCell` | `value` | `string` | Yes |
| `XhCalendarRangePickerCell` | `index` | `number` |  |
| `XhCalendarRangePickerGrid` | `index` | `number` |  |
| `XhCalendarRangePickerHeading` | `index` | `number` |  |
| `XhCalendarRangePickerHeadingMonthTrigger` | `index` | `number` |  |
| `XhCalendarRangePickerHeadingYearTrigger` | `index` | `number` |  |
| `XhCalendarRangePickerRoot` | `value` | `string \| string[]` |  |
| `XhCalendarRangePickerRoot` | `defaultValue` | `string \| string[]` |  |
| `XhCalendarRangePickerRoot` | `focusedValue` | `string` |  |
| `XhCalendarRangePickerRoot` | `defaultFocusedValue` | `string` |  |
| `XhCalendarRangePickerRoot` | `min` | `string` |  |
| `XhCalendarRangePickerRoot` | `max` | `string` |  |
| `XhCalendarRangePickerRoot` | `isDateUnavailable` | `(value: string, anchor: string \| null) => boolean` |  |
| `XhCalendarRangePickerRoot` | `allowsNonContiguousRanges` | `boolean` |  |
| `XhCalendarRangePickerRoot` | `activeIndex` | `0 \| 1` |  |
| `XhCalendarRangePickerRoot` | `invalid` | `boolean` |  |
| `XhCalendarRangePickerRoot` | `locale` | `string` |  |
| `XhCalendarRangePickerRoot` | `firstDayOfWeek` | `number` |  |
| `XhCalendarRangePickerRoot` | `timeZone` | `string` |  |
| `XhCalendarRangePickerRoot` | `disabled` | `boolean` |  |
| `XhCalendarRangePickerRoot` | `readOnly` | `boolean` |  |
| `XhCalendarRangePickerRoot` | `weekdayFormat` | `CalendarWeekdayFormat` |  |
| `XhCalendarRangePickerRoot` | `fixedWeeks` | `boolean` |  |
| `XhCalendarRangePickerRoot` | `granularity` | `CalendarGranularity` |  |
| `XhCalendarRangePickerRoot` | `activeView` | `CalendarView` |  |
| `XhCalendarRangePickerRoot` | `defaultActiveView` | `CalendarView` |  |
| `XhCalendarRangePickerRoot` | `visibleCount` | `number` |  |
| `XhCalendarRangePickerRoot` | `translations` | `Partial<CalendarRangePickerTranslations>` |  |
| `XhCalendarRangePickerRoot` | `onValueChange` | `CalendarRangePickerProps['onValueChange']` |  |
| `XhCalendarRangePickerRoot` | `onFocusedValueChange` | `CalendarRangePickerProps['onFocusedValueChange']` |  |
| `XhCalendarRangePickerRoot` | `onActiveViewChange` | `CalendarRangePickerProps['onActiveViewChange']` |  |
| `XhCalendarRangePickerRoot` | `children` | `SlotChildren<CalendarRangePickerRootSlotProps>` |  |
| `XhCalendarRangePickerWeekDay` | `value` | `number \| string` | Yes |
| `XhCalendarRangePickerWeekNumber` | `value` | `string` | Yes |

### State

The following names are internal to the state machine.

**States**: `idle` · `anchored`

**Events**: `RANGE.ANCHOR` · `RANGE.COMMIT` · `DRAG.SET` · `HOVER.SET` · `HOVER.CLEAR` · `PRESS.START` · `PRESS.END`

**Guards**: `startsRange` · `endsFromStart` · `anchorsRange` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `rangeAnchor` | `string \| null` |
| `dragging` | `boolean` |
| `setRangeAnchor` | `(next: string \| null) => void` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `calendar-range-picker.kbd.tab` |
| `ArrowLeft` | `calendar-range-picker.kbd.prev-day` |
| `ArrowRight` | `calendar-range-picker.kbd.next-day` |
| `ArrowUp` | `calendar-range-picker.kbd.prev-week` |
| `ArrowDown` | `calendar-range-picker.kbd.next-week` |
| `Home` | `calendar-range-picker.kbd.week-start` |
| `End` | `calendar-range-picker.kbd.week-end` |
| `PageUp` | `calendar-range-picker.kbd.prev-month` |
| `PageDown` | `calendar-range-picker.kbd.next-month` |
| `Shift+PageUp` | `calendar-range-picker.kbd.prev-year` |
| `Shift+PageDown` | `calendar-range-picker.kbd.next-year` |
| `Enter` / `Space` | `calendar-range-picker.kbd.select` |
| `Escape` | `calendar-range-picker.kbd.cancel-range` |
| `Tab` / `Shift+Tab` | `calendar-range-picker.kbd.commit-range` |
| `Enter` / `Space` | `calendar-range-picker.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `prev-year-trigger` | `aria-label` | translations.prevYearTrigger(view) |
| `prev-trigger` | `aria-label` | translations.prevTrigger(view) |
| `next-trigger` | `aria-label` | translations.nextTrigger(view) |
| `next-year-trigger` | `aria-label` | translations.nextYearTrigger(view) |
| `grid` | `aria-disabled` | 'true' \| 'false' |
| `grid` | `aria-labelledby` | frame.headingId(panel.index) |
| `grid` | `aria-multiselectable` | 'true' |
| `grid` | `aria-readonly` | 'true' \| 'false' |
| `grid` | `role` | 'grid' |
| `grid-head` | `role` | 'rowgroup' |
| `week-day` | `aria-label` | meta?.long |
| `week-day` | `role` | 'columnheader' |
| `grid-body` | `role` | 'rowgroup' |
| `week-row` | `role` | 'row' |
| `week-number` | `aria-hidden` | 'true' |
| `week-number` | `role` | 'rowheader' |
| `cell` | `aria-selected` | 'true' \| 'false' |
| `cell` | `role` | 'gridcell' |
| `cell-trigger` | `aria-description` | translations.finishRangeSelectionPrompt \| translations.startRangeSelectionPrompt \| undefined |
| `cell-trigger` | `aria-disabled` | 'true' \| 'false' |
| `cell-trigger` | `aria-invalid` | 'true' \| undefined |
| `cell-trigger` | `aria-label` | frame.dateLabel(state.date, period) |
| `cell-trigger` | `role` | 'button' |

## Style reference

### Skin

`@xihan-ui/styles/calendar-range-picker.css` is written against `[data-scope="calendar-range-picker"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-calendar-range-picker` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `prev-year-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `prev-year-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `prev-year-trigger` | `data-xh-action-control` | '' |
| `prev-year-trigger` | `data-xh-action-display` | 'always' |
| `prev-year-trigger` | `data-xh-action-profile` | 'icon' |
| `prev-year-trigger` | `data-xh-action-size` | 'xs' |
| `prev-year-trigger` | `data-xh-action-variant` | 'ghost' |
| `prev-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `prev-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `prev-trigger` | `data-xh-action-control` | '' |
| `prev-trigger` | `data-xh-action-display` | 'always' |
| `prev-trigger` | `data-xh-action-profile` | 'icon' |
| `prev-trigger` | `data-xh-action-size` | 'xs' |
| `prev-trigger` | `data-xh-action-variant` | 'ghost' |
| `next-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `next-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `next-trigger` | `data-xh-action-control` | '' |
| `next-trigger` | `data-xh-action-display` | 'always' |
| `next-trigger` | `data-xh-action-profile` | 'icon' |
| `next-trigger` | `data-xh-action-size` | 'xs' |
| `next-trigger` | `data-xh-action-variant` | 'ghost' |
| `next-year-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `next-year-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `next-year-trigger` | `data-xh-action-control` | '' |
| `next-year-trigger` | `data-xh-action-display` | 'always' |
| `next-year-trigger` | `data-xh-action-profile` | 'icon' |
| `next-year-trigger` | `data-xh-action-size` | 'xs' |
| `next-year-trigger` | `data-xh-action-variant` | 'ghost' |
| `heading` | `data-index` | frame.panelOf(panel).index |
| `heading` | `data-view` | view |
| `heading-year-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `heading-year-trigger` | `data-index` | frame.panelOf(panel).index |
| `heading-year-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `heading-year-trigger` | `data-view` | view |
| `heading-year-trigger` | `data-xh-action-control` | '' |
| `heading-year-trigger` | `data-xh-action-display` | 'always' |
| `heading-year-trigger` | `data-xh-action-profile` | 'text' |
| `heading-year-trigger` | `data-xh-action-size` | 'xs' |
| `heading-year-trigger` | `data-xh-action-variant` | 'ghost' |
| `heading-month-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `heading-month-trigger` | `data-index` | frame.panelOf(panel).index |
| `heading-month-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `heading-month-trigger` | `data-view` | view |
| `heading-month-trigger` | `data-xh-action-control` | '' |
| `heading-month-trigger` | `data-xh-action-display` | 'always' |
| `heading-month-trigger` | `data-xh-action-profile` | 'text' |
| `heading-month-trigger` | `data-xh-action-size` | 'xs' |
| `heading-month-trigger` | `data-xh-action-variant` | 'ghost' |
| `grid` | `data-disabled` | '' (present only while the condition holds) |
| `grid` | `data-dragging` | '' (present only while the condition holds) |
| `grid` | `data-index` | frame.panelOf(panel).index |
| `grid` | `data-readonly` | '' (present only while the condition holds) |
| `grid` | `data-view` | view |
| `week-row` | `data-view` | view |
| `cell` | `data-disabled` | '' (present only while the condition holds) |
| `cell` | `data-focus` | '' (present only while the condition holds) |
| `cell` | `data-in-range` | '' (present only while the condition holds) |
| `cell` | `data-invalid` | '' (present only while the condition holds) |
| `cell` | `data-outside-month` | '' (present only while the condition holds) |
| `cell` | `data-range-end` | '' (present only while the condition holds) |
| `cell` | `data-range-preview` | '' (present only while the condition holds) |
| `cell` | `data-range-start` | '' (present only while the condition holds) |
| `cell` | `data-selected` | '' (present only while the condition holds) |
| `cell` | `data-today` | '' (present only while the condition holds) |
| `cell` | `data-view` | view |
| `cell-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `cell-trigger` | `data-focus` | '' (present only while the condition holds) |
| `cell-trigger` | `data-in-range` | '' (present only while the condition holds) |
| `cell-trigger` | `data-invalid` | '' (present only while the condition holds) |
| `cell-trigger` | `data-outside-month` | '' (present only while the condition holds) |
| `cell-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `cell-trigger` | `data-range-end` | '' (present only while the condition holds) |
| `cell-trigger` | `data-range-preview` | '' (present only while the condition holds) |
| `cell-trigger` | `data-range-start` | '' (present only while the condition holds) |
| `cell-trigger` | `data-selected` | '' (present only while the condition holds) |
| `cell-trigger` | `data-today` | '' (present only while the condition holds) |
| `cell-trigger` | `data-view` | view |
| `cell-trigger` | `data-xh-action-control` | '' |
| `cell-trigger` | `data-xh-action-display` | 'always' |
| `cell-trigger` | `data-xh-action-profile` | 'text' |
| `cell-trigger` | `data-xh-action-size` | 'xs' |
| `cell-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-calendar-range-picker-cell-bg-disabled` | `cell` | `background-color` | `disabled`<br>`in-range`<br>`not([data-in-range])` | `--xh-bg-subtle` |
| `--xh-calendar-range-picker-cell-bg-hover` | `cell-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-calendar-range-picker-cell-bg-pressed` | `cell-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-calendar-range-picker-cell-bg-selected` | `cell-trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`in-range`<br>`is([data-range-start], [data-range-end])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-in-range])`<br>`not([data-loading])`<br>`not([data-outside-month])`<br>`outside-month`<br>`range-end`<br>`range-start`<br>`selected`<br>`xh-ink-surface` | `--xh-bg-brand` |
| `--xh-calendar-range-picker-cell-bg-selected-active` | `cell-trigger` | `background-color` | `disabled`<br>`in-range`<br>`is(:active, [data-pressed])`<br>`is([data-range-start], [data-range-end])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-in-range])`<br>`not([data-loading])`<br>`not([data-outside-month])`<br>`outside-month`<br>`pressed`<br>`range-end`<br>`range-start`<br>`selected` | `--xh-bg-brand-active` |
| `--xh-calendar-range-picker-cell-bg-selected-disabled` | `cell-trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`selected`<br>`xh-ink-surface` | `--xh-bg-subtle-hover` |
| `--xh-calendar-range-picker-cell-fg` | `cell-trigger` | `color` | `@media print`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`in-range`<br>`is(:active, [data-pressed])`<br>`is([data-range-start], [data-range-end])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-in-range])`<br>`not([data-loading])`<br>`not([data-outside-month])`<br>`outside-month`<br>`pressed`<br>`range-end`<br>`range-start`<br>`selected` | `--xh-fg-default` |
| `--xh-calendar-range-picker-cell-fg-outside` | `cell-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`outside-month`<br>`pressed` | `--xh-fg-subtle` |
| `--xh-calendar-range-picker-cell-fg-selected` | `cell-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`in-range`<br>`is(:active, [data-pressed])`<br>`is([data-range-start], [data-range-end])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-in-range])`<br>`not([data-loading])`<br>`not([data-outside-month])`<br>`outside-month`<br>`pressed`<br>`range-end`<br>`range-start`<br>`selected` | `--xh-fg-on-brand` |
| `--xh-calendar-range-picker-cell-font-size` | `cell-trigger` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-calendar-range-picker-cell-font-weight` | `cell-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-calendar-range-picker-cell-font-weight-outside` | `cell-trigger` | `font-weight` | `outside-month` | `--xh-font-weight-regular` |
| `--xh-calendar-range-picker-cell-min-w` | `grid`<br>`week-row` | `grid-template-columns`<br>`min-inline-size` | `@media (pointer: coarse)`<br>`default`<br>`has(> [data-part='week-number'])`<br>`is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`not([hidden])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-control-h-md` |
| `--xh-calendar-range-picker-cell-px` | `cell` | `padding-inline` | `default` | `--xh-space-0` |
| `--xh-calendar-range-picker-cell-py` | `cell` | `inset-block`<br>`inset-inline-end`<br>`inset-inline-start`<br>`padding-block` | `default`<br>`disabled`<br>`in-range`<br>`not([data-in-range])`<br>`not([data-outside-month])`<br>`outside-month`<br>`range-end`<br>`range-start`<br>`view=day` | `--xh-space-1_5` |
| `--xh-calendar-range-picker-cell-radius` | `cell-trigger` | `border-radius` | `view=day` | `--xh-shape-circle` |
| `--xh-calendar-range-picker-cell-size` | `cell`<br>`cell-trigger` | `block-size`<br>`inline-size`<br>`inset-block`<br>`inset-block-start`<br>`inset-inline-end`<br>`inset-inline-start`<br>`min-inline-size` | `default`<br>`disabled`<br>`in-range`<br>`not([data-in-range])`<br>`not([data-outside-month])`<br>`outside-month`<br>`range-end`<br>`range-start`<br>`today`<br>`view=day`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-action-size` |
| `--xh-calendar-range-picker-disabled-inset` | `cell` | `inset-block` | `disabled`<br>`in-range`<br>`not([data-in-range])` | `--xh-space-0_5` |
| `--xh-calendar-range-picker-gap` | `root` | `gap` | `default` | `--xh-space-0` |
| `--xh-calendar-range-picker-grid-gap` | `grid` | `gap` | `default` | `--xh-space-0` |
| `--xh-calendar-range-picker-grid-px` | `grid`<br>`week-row` | `grid-template-columns`<br>`min-inline-size`<br>`padding-inline` | `@media (pointer: coarse)`<br>`default`<br>`has(> [data-part='week-number'])`<br>`is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`not([hidden])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-space-4` |
| `--xh-calendar-range-picker-grid-py` | `grid` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-calendar-range-picker-header-border` | `header` | `border-block-end` | `default` | `--xh-material-solid-border` |
| `--xh-calendar-range-picker-header-gap` | `header` | `gap` | `default` | `--xh-space-1` |
| `--xh-calendar-range-picker-header-px` | `header` | `padding-inline` | `default` | `--xh-space-4` |
| `--xh-calendar-range-picker-header-py` | `header` | `min-block-size`<br>`padding-block` | `default` | `--xh-space-2` |
| `--xh-calendar-range-picker-heading-fg` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([hidden])`<br>`pressed` | `--xh-fg-default` |
| `--xh-calendar-range-picker-heading-font-size` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-size` | `default`<br>`not([hidden])` | `--xh-text-label-size` |
| `--xh-calendar-range-picker-heading-font-weight` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-weight` | `default`<br>`not([hidden])` | `--xh-font-weight-medium` |
| `--xh-calendar-range-picker-heading-trigger-bg-hover` | `heading-month-trigger`<br>`heading-year-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([hidden])` | `--xh-_action-variant-bg-hover` |
| `--xh-calendar-range-picker-heading-trigger-bg-pressed` | `heading-month-trigger`<br>`heading-year-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([hidden])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-calendar-range-picker-heading-trigger-px` | `heading-month-trigger`<br>`heading-year-trigger` | `padding-inline` | `not([hidden])` | `--xh-space-0_5` |
| `--xh-calendar-range-picker-heading-trigger-radius` | `heading-month-trigger`<br>`heading-year-trigger` | `border-radius` | `not([hidden])` | `--xh-shape-control` |
| `--xh-calendar-range-picker-icon-size` | `header` | `--xh-icon-size` | `default` | `--xh-glyph-size-sm` |
| `--xh-calendar-range-picker-nav-bg` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` |
| `--xh-calendar-range-picker-nav-bg-hover` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-calendar-range-picker-nav-bg-pressed` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-calendar-range-picker-nav-fg` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `color` | `default`<br>`focus-visible` | `--xh-fg-muted` |
| `--xh-calendar-range-picker-nav-fg-hover` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-calendar-range-picker-nav-radius` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-calendar-range-picker-nav-size` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-calendar-range-picker-period-gap` | `grid`<br>`week-row` | `column-gap`<br>`gap` | `is([data-view='month'], [data-view='year'])`<br>`is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-space-0` |
| `--xh-calendar-range-picker-period-px` | `cell` | `padding-inline` | `is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-space-1` |
| `--xh-calendar-range-picker-period-radius` | `cell-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-calendar-range-picker-range-bg` | `cell` | `background-color` | `in-range`<br>`not([data-outside-month])`<br>`outside-month` | `--xh-bg-brand-subtle` |
| `--xh-calendar-range-picker-range-cap-radius` | `cell` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `in-range`<br>`range-end`<br>`range-start` | `--xh-shape-pill` |
| `--xh-calendar-range-picker-range-cell-bg-hover` | `cell-trigger` | `background-color` | `disabled`<br>`hover`<br>`in-range`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-outside-month], [data-disabled], [data-range-start], [data-range-end])`<br>`outside-month`<br>`range-end`<br>`range-start` | `--xh-bg-brand-subtle-hover` |
| `--xh-calendar-range-picker-range-cell-bg-pressed` | `cell-trigger` | `background-color` | `disabled`<br>`in-range`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-outside-month], [data-disabled], [data-range-start], [data-range-end])`<br>`outside-month`<br>`pressed`<br>`range-end`<br>`range-start` | `--xh-bg-brand-subtle-active` |
| `--xh-calendar-range-picker-range-inset` | `cell` | `inset-block`<br>`inset-inline-end`<br>`inset-inline-start` | `in-range`<br>`not([data-outside-month])`<br>`outside-month`<br>`range-end`<br>`range-start`<br>`view=day` | `--xh-space-0_5` |
| `--xh-calendar-range-picker-range-preview-bg` | `cell` | `background-color` | `in-range`<br>`not([data-outside-month])`<br>`outside-month`<br>`range-preview` | `--xh-bg-subtle` |
| `--xh-calendar-range-picker-range-preview-cell-bg-hover` | `cell-trigger` | `background-color` | `disabled`<br>`hover`<br>`in-range`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-outside-month], [data-disabled], [data-range-start], [data-range-end])`<br>`outside-month`<br>`range-end`<br>`range-preview`<br>`range-start` | `--xh-bg-subtle-hover` |
| `--xh-calendar-range-picker-range-preview-cell-bg-pressed` | `cell-trigger` | `background-color` | `disabled`<br>`in-range`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-outside-month], [data-disabled], [data-range-start], [data-range-end])`<br>`outside-month`<br>`pressed`<br>`range-end`<br>`range-preview`<br>`range-start` | `--xh-bg-subtle-active` |
| `--xh-calendar-range-picker-row-gap` | `grid-body`<br>`grid-head` | `gap` | `default` | `--xh-space-0` |
| `--xh-calendar-range-picker-today-mark-bg` | `cell` | `background-color` | `today` | `--xh-fg-brand` |
| `--xh-calendar-range-picker-today-mark-size` | `cell` | `block-size`<br>`border`<br>`inline-size` | `@media print`<br>`today` | `--xh-space-1` |
| `--xh-calendar-range-picker-week-cell-px` | `cell-trigger` | `padding-inline` | `view=week` | `--xh-space-3` |
| `--xh-calendar-range-picker-week-day-fg` | `week-day` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-calendar-range-picker-week-day-font-size` | `week-day` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-calendar-range-picker-week-day-font-weight` | `week-day` | `font-weight` | `default` | `--xh-font-weight-regular` |
| `--xh-calendar-range-picker-week-day-h` | `week-day` | `block-size` | `default` | `--xh-control-h-md` |
| `--xh-calendar-range-picker-week-number-fg` | `week-number` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-calendar-range-picker-week-number-font-size` | `week-number` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-calendar-range-picker-week-number-w` | `week-row` | `grid-template-columns` | `@media (pointer: coarse)`<br>`has(> [data-part='week-number'])`<br>`not([hidden])` | `--xh-control-h-md` |
| `--xh-calendar-range-picker-year-grid-max-h` | `grid` | `max-block-size` | `view=year` | `--xh-viewport-h-sm` |
