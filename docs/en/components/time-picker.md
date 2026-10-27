# TimePicker

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/time-picker).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/time-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/time-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/time-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/time-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/time-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="time-picker"`: **`root`** · `label` · **`control`** · `tag-list` · `segment-group` · `segment` · **`trigger`** · `clear-trigger` · `positioner` · **`content`** · `preset-group` · `preset` · `column` · `item` · `footer` · `confirm-trigger` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-time-picker>` |
| Vue components | `XhTimePickerClearTrigger` `XhTimePickerColumn` `XhTimePickerConfirmTrigger` `XhTimePickerContent` `XhTimePickerControl` `XhTimePickerFooter` `XhTimePickerHiddenInput` `XhTimePickerItem` `XhTimePickerItemDeleteTrigger` `XhTimePickerLabel` `XhTimePickerOverflowTag` `XhTimePickerPositioner` `XhTimePickerPreset` `XhTimePickerPresetGroup` `XhTimePickerRoot` `XhTimePickerSegment` `XhTimePickerSegmentGroup` `XhTimePickerTag` `XhTimePickerTagLabel` `XhTimePickerTagList` `XhTimePickerTrigger` |
| Composable | `useTimePicker` |
| State machine | `timePickerMachine` |
| Skin | `@xihan-ui/styles/time-picker.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string \| string[]` |  |
| `defaultValue` | `string \| string[]` |  |
| `selectionMode` | `TimePickerSelectionMode` |  |
| `maxSelected` | `number` |  |
| `maxTagCount` | `number` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `min` | `string` |  |
| `max` | `string` |  |
| `locale` | `string` |  |
| `hourCycle` | `TimeHourCycle` |  |
| `granularity` | `TimeGranularity` |  |
| `timeStep` | `TimeStep` |  |
| `presets` | `TimePickerPreset[]` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `name` | `string` |  |
| `placeholder` | `string` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `placement` | `Placement` |  |
| `dir` | `Direction` |  |
| `offset` | `number` |  |
| `isTimeUnavailable` | `TimeUnavailablePredicate` |  |
| `translations` | `Partial<TimePickerTranslations>` |  |
| `onValueChange` | `(details: TimePickerValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |
| `onOpenChange` | `(details: TimePickerOpenChangeDetails) => void` |  |

### TimePickerPreset

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
| `value-change` | `TimePickerValueChangeDetails` |
| `clear` | `` |
| `open-change` | `TimePickerOpenChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTimePickerColumn` | `default` | `TimePickerColumnSlotProps` |
| `XhTimePickerPreset` | `default` | — |
| `XhTimePickerPresetGroup` | `default` | `TimePickerPresetsSlotProps` |
| `XhTimePickerRoot` | `default` | `TimePickerRootSlotProps` |
| `XhTimePickerRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTimePickerColumn` | `unit` | `TimePickerColumnUnit` | Yes |
| `XhTimePickerColumn` | `children` | `SlotChildren<TimePickerColumnSlotProps>` |  |
| `XhTimePickerItem` | `value` | `string` | Yes |
| `XhTimePickerPositioner` | `container` | `() => Element \| null` |  |
| `XhTimePickerPreset` | `value` | `string` | Yes |
| `XhTimePickerPresetGroup` | `children` | `SlotChildren<TimePickerPresetsSlotProps>` |  |
| `XhTimePickerRoot` | `label` | `ReactNode` |  |
| `XhTimePickerRoot` | `children` | `SlotChildren<TimePickerRootSlotProps>` |  |
| `XhTimePickerSegment` | `segment` | `TimeSegmentType` | Yes |
| `XhTimePickerTag` | `value` | `string` | Yes |

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
| `column` | 'open' \| 'closed' |
| `item` | 'checked' \| 'unchecked' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.ADD` · `VALUE.REMOVE` · `VALUE.TOGGLE` · `TAG_LIST.TRACKED` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.DIGIT` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `OPTION.FOCUS` · `ITEM.SELECT` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `isOpenControlled` · `canEdit` · `closesOnPreset` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `value` | `string[]` |
| `selectionMode` | `TimePickerSelectionMode` |
| `draftValue` | `string` |
| `empty` | `boolean` |
| `outOfRange` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `hourCycle` | `TimeHourCycle` |
| `granularity` | `TimeGranularity` |
| `timeStep` | `ResolvedTimeStep` |
| `segments` | `TimeSegmentType[]` |
| `focusedSegment` | `TimeSegmentType \| null` |
| `columns` | `TimePickerColumn[]` |
| `focusedColumn` | `TimePickerColumnUnit \| null` |
| `focusedItem` | `string \| null` |
| `presets` | `readonly TimePickerPresetState[]` |
| `canClear` | `boolean` |
| `canAdd` | `boolean` |
| `tags` | `TimePickerTagMeta[]` |
| `overflowCount` | `number` |
| `overflowText` | `string` |
| `translations` | `TimePickerTranslations` |
| `getSegmentText` | `(props: TimePickerSegmentProps) => string` |
| `getItemText` | `(props: TimePickerItemProps) => string` |
| `isItemSelected` | `(props: TimePickerItemProps) => boolean` |
| `isItemDisabled` | `(props: TimePickerItemProps) => boolean` |
| `setOpen` | `(next: boolean) => void` |
| `setValue` | `(next: string[]) => void` |
| `clear` | `() => void` |
| `add` | `() => void` |
| `deselect` | `(value: string) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getTagListProps` | `() => T['element']` |
| `getTagProps` | `(props: TimePickerTagProps) => T['element']` |
| `getTagLabelProps` | `() => T['element']` |
| `getOverflowTagProps` | `() => T['element']` |
| `getItemDeleteTriggerProps` | `(props: TimePickerTagProps) => T['button']` |
| `getSegmentGroupProps` | `() => T['element']` |
| `getSegmentProps` | `(props: TimePickerSegmentProps) => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getPresetGroupProps` | `() => T['element']` |
| `getPresetProps` | `(props: TimePickerPresetProps) => T['element']` |
| `getColumnProps` | `(props: TimePickerColumnProps) => T['element']` |
| `getItemProps` | `(props: TimePickerItemProps) => T['element']` |
| `getFooterProps` | `() => T['element']` |
| `getConfirmTriggerProps` | `() => T['button']` |
| `getHiddenInputProps` | `(props?: TimePickerHiddenInputProps) => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Backspace` | `time-picker.kbd.remove-last` |
| `ArrowDown` / `ArrowUp` | `time-picker.kbd.open` |
| `Enter` / `Space` | `time-picker.kbd.toggle` |
| `ArrowDown` | `time-picker.kbd.item-next` |
| `ArrowUp` | `time-picker.kbd.item-prev` |
| `Home` | `time-picker.kbd.item-first` |
| `End` | `time-picker.kbd.item-last` |
| `ArrowRight` | `time-picker.kbd.column-next` |
| `ArrowLeft` | `time-picker.kbd.column-prev` |
| `Enter` / `Space` | `time-picker.kbd.select` |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | `time-picker.kbd.preset-move` |
| `Enter` / `Space` | `time-picker.kbd.preset-pick` |
| `Escape` | `time-picker.kbd.escape` |
| `Tab` / `Shift+Tab` | `time-picker.kbd.tab` |
| `ArrowUp` | `time-picker.kbd.segment-increment` |
| `ArrowDown` | `time-picker.kbd.segment-decrement` |
| `ArrowRight` | `time-picker.kbd.segment-next` |
| `ArrowLeft` | `time-picker.kbd.segment-prev` |
| `Home` | `time-picker.kbd.segment-first` |
| `End` | `time-picker.kbd.segment-last` |
| `0-9` | `time-picker.kbd.segment-digit` |
| `Backspace` / `Delete` | `time-picker.kbd.segment-clear` |
| `a` / `p` | `time-picker.kbd.segment-period` |
| `Alt+ArrowDown` | `time-picker.kbd.segment-open` |
| `Enter` | `time-picker.kbd.segment-close` |
| `Enter` / `Space` | `time-picker.kbd.press` |

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
| `segment` | `aria-valuetext` | timeSegmentText(draft, segment, { hourCycle, locale }) |
| `segment` | `role` | 'spinbutton' |
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

`@xihan-ui/styles/time-picker.css` is written against `[data-scope="time-picker"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-time-picker` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

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
| `control` | `data-xh-field-layout` | 'multi-tag' \| undefined |
| `control` | `data-xh-field-size` | props.size |
| `tag-list` | `data-disabled` | '' (present only while the condition holds) |
| `tag-list` | `data-instant` | '' (present only while the condition holds) |
| `tag-list` | `data-placeholder-shown` | '' (present only while the condition holds) |
| `tag-list` | `data-placeholder-text` | props.placeholder \| undefined \| undefined |
| `tag-list` | `data-xh-tag-list` | '' |
| `segment-group` | `data-disabled` | '' (present only while the condition holds) |
| `segment-group` | `data-invalid` | '' (present only while the condition holds) |
| `segment-group` | `data-placeholder-shown` | '' (present only while the condition holds) |
| `segment-group` | `data-placeholder-text` | props.placeholder \| undefined |
| `segment-group` | `data-readonly` | '' (present only while the condition holds) |
| `segment` | `data-disabled` | '' (present only while the condition holds) |
| `segment` | `data-focus` | '' (present only while the condition holds) |
| `segment` | `data-invalid` | '' (present only while the condition holds) |
| `segment` | `data-placeholder` | '' (present only while the condition holds) |
| `segment` | `data-readonly` | '' (present only while the condition holds) |
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
| `column` | `data-disabled` | '' (present only while the condition holds) |
| `column` | `data-state` | 'open' \| 'closed' |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `confirm-trigger` | `data-disabled` | '' (present only while the condition holds) |
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
| `--xh-time-picker-action-bg` | `clear-trigger`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-time-picker-action-bg-active` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-time-picker-action-bg-hover` | `clear-trigger`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open`<br>`xh-ink-surface` | `--xh-_action-variant-bg-hover` |
| `--xh-time-picker-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-time-picker-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open` | `--xh-fg-default` |
| `--xh-time-picker-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-time-picker-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-time-picker-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-time-picker-column-divider` | `column`<br>`preset-group` | `border-inline-end`<br>`border-inline-start` | `default` | `--xh-material-solid-border` |
| `--xh-time-picker-column-gap` | `column`<br>`item` | `gap`<br>`inset-block` | `default` | `--xh-space-2` |
| `--xh-time-picker-column-h` | `column` | `block-size`<br>`padding-block` | `default` | `--xh-overlay-time-column-h` |
| `--xh-time-picker-column-min-w` | `column` | `min-inline-size` | `default` | `--xh-overlay-time-column-w` |
| `--xh-time-picker-column-px` | `column` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-time-picker-column-py` | `column` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-time-picker-confirm-trigger-bg` | `confirm-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-time-picker-confirm-trigger-bg-active` | `confirm-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-time-picker-confirm-trigger-bg-hover` | `confirm-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-time-picker-confirm-trigger-fg` | `confirm-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-time-picker-confirm-trigger-font-size` | `confirm-trigger` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-time-picker-confirm-trigger-h` | `confirm-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-time-picker-confirm-trigger-margin` | `confirm-trigger`<br>`content` | `margin` | `default` | `--xh-space-2` |
| `--xh-time-picker-confirm-trigger-px` | `confirm-trigger` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-time-picker-confirm-trigger-radius` | `confirm-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-time-picker-confirm-trigger-shadow` | `confirm-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` |
| `--xh-time-picker-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` |
| `--xh-time-picker-content-border` | `content` | `border` | `default` | `--xh-border-default` |
| `--xh-time-picker-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-time-picker-content-max-h` | `content` | `max-block-size` | `default` | `none` |
| `--xh-time-picker-content-px` | `content` | `padding-inline` | `default` | `--xh-space-0` |
| `--xh-time-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-0` |
| `--xh-time-picker-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-time-picker-content-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-floating` |
| `--xh-time-picker-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-time-picker-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-time-picker-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-time-picker-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-time-picker-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-time-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-time-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-time-picker-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-time-picker-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-time-picker-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_time-picker-gap` |
| `--xh-time-picker-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_time-picker-control-h` |
| `--xh-time-picker-control-max-h` | `control` | `max-block-size` | `xh-field-layout=multi-tag` | `--xh-viewport-h-sm` |
| `--xh-time-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-time-picker-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_time-picker-control-px` |
| `--xh-time-picker-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-time-picker-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-time-picker-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-time-picker-font-size` | `control` | `font-size` | `default` | `--xh-_time-picker-font-size` |
| `--xh-time-picker-footer-border` | `footer` | `border-block-start` | `default` | `--xh-material-solid-border` |
| `--xh-time-picker-footer-fg` | `footer` | `color` | `default` | `--xh-fg-muted` |
| `--xh-time-picker-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-time-picker-footer-gap` | `footer` | `gap`<br>`inline-size` | `default` | `--xh-space-2` |
| `--xh-time-picker-footer-px` | `footer` | `inline-size` | `default` | `--xh-space-2` |
| `--xh-time-picker-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-time-picker-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-time-picker-icon-size` | `control`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-time-picker-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-time-picker-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-time-picker-item-check-fg` | `item` | `background-color` | `default` | `--xh-_time-picker-check-fg` |
| `--xh-time-picker-item-check-size` | `item` | `block-size`<br>`inline-size`<br>`padding-inline` | `default` | `--xh-control-indicator-size` |
| `--xh-time-picker-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` |
| `--xh-time-picker-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-time-picker-item-fg` |
| `--xh-time-picker-item-font-size` | `item` | `font-size` | `default` | `--xh-_time-picker-font-size` |
| `--xh-time-picker-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-medium` |
| `--xh-time-picker-item-h` | `column`<br>`item` | `block-size`<br>`padding-block` | `default` | `--xh-control-action-size` |
| `--xh-time-picker-item-px` | `item` | `padding-inline` | `default` | `--xh-space-0_5` |
| `--xh-time-picker-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-time-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-time-picker-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-time-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-time-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-time-picker-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-time-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-time-picker-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` |
| `--xh-time-picker-placeholder-fg` | `segment`<br>`segment-group`<br>`tag-list` | `color` | `placeholder`<br>`placeholder-shown` | `--xh-fg-subtle` |
| `--xh-time-picker-preset-bg` | `preset` | `background-color` | `default`<br>`disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-time-picker-preset-bg-hover` | `preset` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-time-picker-preset-bg-pressed` | `preset` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-active` |
| `--xh-time-picker-preset-check-fg` | `preset` | `background-color` | `default` | `--xh-_time-picker-check-fg` |
| `--xh-time-picker-preset-check-size` | `preset` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-control-indicator-sm` |
| `--xh-time-picker-preset-fg` | `preset` | `color` | `default`<br>`disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-muted` |
| `--xh-time-picker-preset-fg-disabled` | `preset` | `background-color`<br>`color` | `default`<br>`disabled` | `--xh-fg-disabled` |
| `--xh-time-picker-preset-fg-hover` | `preset` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-default` |
| `--xh-time-picker-preset-font-size` | `preset` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-time-picker-preset-group-gap` | `preset-group` | `gap` | `default` | `--xh-space-1` |
| `--xh-time-picker-preset-group-h` | `preset-group` | `max-block-size` | `default` | `--xh-overlay-time-column-h` |
| `--xh-time-picker-preset-group-px` | `preset-group` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-time-picker-preset-group-py` | `preset-group` | `padding-block` | `default` | `--xh-space-2_5` |
| `--xh-time-picker-preset-h` | `preset` | `block-size`<br>`line-height` | `default` | `--xh-control-action-size` |
| `--xh-time-picker-preset-px` | `preset` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-space-2` |
| `--xh-time-picker-preset-radius` | `preset` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-time-picker-segment-bg-focus` | `segment` | `background` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])` | `--xh-_time-picker-segment-bg` |
| `--xh-time-picker-segment-bg-hover` | `segment` | `background` | `disabled`<br>`focus`<br>`hover`<br>`not([data-focus], [data-disabled])` | `--xh-bg-subtle` |
| `--xh-time-picker-segment-bg-invalid-focus` | `segment` | `background` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-bg-subtle` |
| `--xh-time-picker-segment-fg-focus` | `segment` | `color` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])`<br>`placeholder` | `--xh-_time-picker-segment-fg` |
| `--xh-time-picker-segment-fg-invalid` | `segment` | `color` | `invalid` | `--xh-fg-danger` |
| `--xh-time-picker-segment-fg-invalid-focus` | `segment` | `color` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-fg-danger` |
| `--xh-time-picker-segment-px` | `segment` | `padding-inline` | `default` | `--xh-space-0_5` |
| `--xh-time-picker-segment-radius` | `segment` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-time-picker-tag-list-gap` | `tag-list` | `gap` | `xh-tag-list` | `--xh-space-1` |
