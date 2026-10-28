# Select

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/select).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/select" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/select.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/select" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/select" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/select.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="select"`: `root` · `label` · `control` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `tag-list` · `positioner` · **`content`** · **`list`** · `footer` · `group` · `group-label` · `item` · `item-prefix` · `item-text` · `item-description` · `item-suffix` · `item-indicator` · `empty` · `loading` · `error` · `retry-trigger` · `hidden-select`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-select>` |
| Vue components | `XhSelectClearTrigger` `XhSelectContent` `XhSelectControl` `XhSelectEmpty` `XhSelectError` `XhSelectFooter` `XhSelectGroup` `XhSelectGroupLabel` `XhSelectIndicator` `XhSelectItem` `XhSelectItemDeleteTrigger` `XhSelectItemDescription` `XhSelectItemIndicator` `XhSelectItemPrefix` `XhSelectItemSuffix` `XhSelectItemText` `XhSelectLabel` `XhSelectList` `XhSelectLoading` `XhSelectOverflowTag` `XhSelectPositioner` `XhSelectRetryTrigger` `XhSelectRoot` `XhSelectTag` `XhSelectTagLabel` `XhSelectTagList` `XhSelectTrigger` `XhSelectValueText` |
| Composable | `useSelect` |
| State machine | `selectMachine` |
| Skin | `@xihan-ui/styles/select.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `collection` | `SelectNode<V>[]` |  |
| `valueKey` | `SelectionValueKey<V>` |  |
| `virtualizer` | `CollectionVirtualizer` |  |
| `lazyMount` | `boolean` |  |
| `value` | `V \| V[] \| null` |  |
| `defaultValue` | `V \| V[] \| null` |  |
| `multiple` | `boolean` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `loading` | `boolean` |  |
| `error` | `boolean` |  |
| `translations` | `Partial<SelectTranslations>` |  |
| `maxTagCount` | `number` |  |
| `required` | `boolean` |  |
| `name` | `string` |  |
| `placeholder` | `string` |  |
| `placement` | `Placement` |  |
| `offset` | `number` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onValueChange` | `(details: SelectValueChangeDetails<V>) => void` |  |
| `onClear` | `() => void` |  |
| `onOpenChange` | `(details: SelectOpenChangeDetails) => void` |  |
| `onRetry` | `() => void` |  |

### SelectNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `V` | Yes |
| `label` | `string` |  |
| `disabled` | `boolean` |  |
| `tone` | `Tone` |  |
| `description` | `string` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `SelectValueChangeDetails` |
| `clear` | `` |
| `open-change` | `SelectOpenChangeDetails` |
| `retry` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhSelectRoot` | `default` | `SelectRootSlotProps<V>` |
| `XhSelectRoot` | `label` | — |
| `XhSelectRoot` | `empty` | — |
| `XhSelectRoot` | `item` | `SelectNodeMeta<V>` |
| `XhSelectRoot` | `item-prefix` | `SelectNodeMeta<V>` |
| `XhSelectRoot` | `item-suffix` | `SelectNodeMeta<V>` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhSelectGroup` | `value` | `string` | Yes |
| `XhSelectItem` | `value` | `unknown` | Yes |
| `XhSelectItem` | `disabled` | `boolean` |  |
| `XhSelectPositioner` | `container` | `() => Element \| null` |  |
| `XhSelectRoot` | `virtual` | `boolean` |  |
| `XhSelectRoot` | `estimateSize` | `number` |  |
| `XhSelectRoot` | `label` | `ReactNode` |  |
| `XhSelectRoot` | `empty` | `ReactNode` |  |
| `XhSelectRoot` | `clearable` | `boolean` |  |
| `XhSelectRoot` | `renderItem` | `(node: SelectNodeMeta<V>) => ReactNode` |  |
| `XhSelectRoot` | `renderItemPrefix` | `(node: SelectNodeMeta<V>) => ReactNode` |  |
| `XhSelectRoot` | `renderItemSuffix` | `(node: SelectNodeMeta<V>) => ReactNode` |  |
| `XhSelectRoot` | `children` | `SlotChildren<SelectRootSlotProps<V>>` |  |
| `XhSelectTag` | `value` | `unknown` | Yes |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `list` | 'open' \| 'closed' |
| `footer` | 'open' \| 'closed' |
| `item` | 'checked' \| 'unchecked' |
| `item-prefix` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `item-suffix` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |
| `error` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.LOST` · `ITEM.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `FORM.RESET` · `PRESS.START` · `PRESS.END` · `TAG_LIST.TRACKED`

**Guards**: `isOpenControlled` · `isMultiple` · `isReadOnly` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `collection` | `readonly SelectNodeMeta<V>[]` |
| `value` | `V[]` |
| `valueKeys` | `string[]` |
| `valueText` | `string[]` |
| `displayText` | `string` |
| `multiple` | `boolean` |
| `invalid` | `boolean` |
| `error` | `boolean` |
| `translations` | `SelectTranslations` |
| `readOnly` | `boolean` |
| `canClear` | `boolean` |
| `tags` | `SelectTagMeta<V>[]` |
| `overflowCount` | `number` |
| `overflowText` | `string` |
| `highlightedValue` | `V \| null` |
| `setOpen` | `(next: boolean) => void` |
| `setValue` | `(next: V \| V[]) => void` |
| `clear` | `() => void` |
| `deselect` | `(value: V) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getControlProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getValueTextProps` | `() => T['element']` |
| `getIndicatorProps` | `() => T['element']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getTagListProps` | `() => T['element']` |
| `getTagProps` | `(props: SelectTagProps<V>) => T['element']` |
| `getTagLabelProps` | `() => T['element']` |
| `getOverflowTagProps` | `() => T['element']` |
| `getItemDeleteTriggerProps` | `(props: SelectTagProps<V>) => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `isContentMounted` | `() => boolean` |
| `getListProps` | `() => T['element']` |
| `getFooterProps` | `() => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getLoadingProps` | `() => T['element']` |
| `getErrorProps` | `() => T['element']` |
| `getRetryTriggerProps` | `() => T['button']` |
| `getGroupProps` | `(props: SelectGroupProps) => T['element']` |
| `getGroupLabelProps` | `(props: SelectGroupProps) => T['element']` |
| `getItemProps` | `(props: SelectItemProps<V>) => T['element']` |
| `getItemPrefixProps` | `(props: SelectItemProps<V>) => T['element']` |
| `getItemTextProps` | `(props: SelectItemProps<V>) => T['element']` |
| `getItemDescriptionProps` | `(props: SelectItemProps<V>) => T['element']` |
| `getItemSuffixProps` | `(props: SelectItemProps<V>) => T['element']` |
| `getItemIndicatorProps` | `(props: SelectItemProps<V>) => T['element']` |
| `getHiddenSelectProps` | `() => T['select']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `select.kbd.open` |
| `ArrowDown` | `select.kbd.open-next` |
| `ArrowUp` | `select.kbd.open-prev` |
| any single printable character | `select.kbd.trigger-typeahead` |
| `Delete` | `select.kbd.clear` |
| `Backspace` | `select.kbd.backspace` |
| `ArrowDown` | `select.kbd.next` |
| `ArrowUp` | `select.kbd.prev` |
| `Home` | `select.kbd.first` |
| `End` | `select.kbd.last` |
| any single printable character | `select.kbd.typeahead` |
| `Enter` / `Space` | `select.kbd.select` |
| `Enter` / `Space` | `select.kbd.press` |
| `Enter` / `Space` | `select.kbd.multi-select` |
| `Enter` / `Space` | `select.kbd.retry` |
| `Escape` | `select.kbd.escape` |
| `Tab` / `Shift+Tab` | `select.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'listbox' |
| `trigger` | `aria-invalid` | 'true' \| 'false' |
| `trigger` | `aria-label` | props.ariaLabel |
| `trigger` | `aria-labelledby` | id of the `label` part id of the `value-text` part \| id of the `trigger` part id of the `value-text` part \| id of the `value-text` part |
| `trigger` | `aria-readonly` | 'true' \| 'false' |
| `trigger` | `role` | 'combobox' |
| `indicator` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | translations.clearTrigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `list` | `aria-busy` | 'true' \| undefined |
| `list` | `aria-label` | translations.content |
| `list` | `aria-labelledby` | id of the `label` part id of the `value-text` part \| id of the `trigger` part id of the `value-text` part \| id of the `value-text` part |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `role` | 'listbox' |
| `group` | `aria-labelledby` | id of the `group-label` part |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-prefix` | `aria-hidden` | 'true' |
| `item-indicator` | `aria-hidden` | 'true' |
| `error` | `role` | 'alert' |
| `hidden-select` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/select.css` is written against `[data-scope="select"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-select` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
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
| `control` | `data-xh-field-size` | props.size |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-invalid` | '' (present only while the condition holds) |
| `trigger` | `data-placeholder` | '' (present only while the condition holds) |
| `trigger` | `data-readonly` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `value-text` | `data-disabled` | '' (present only while the condition holds) |
| `value-text` | `data-placeholder` | '' (present only while the condition holds) |
| `indicator` | `data-clearable` | '' (present only while the condition holds) |
| `indicator` | `data-disabled` | '' (present only while the condition holds) |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `clear-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
| `tag-list` | `data-disabled` | '' (present only while the condition holds) |
| `tag-list` | `data-instant` | '' (present only while the condition holds) |
| `tag-list` | `data-xh-tag-list` | '' |
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
| `content` | `data-xh-material` | 'frosted' |
| `list` | `data-state` | 'open' \| 'closed' |
| `footer` | `data-state` | 'open' \| 'closed' |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-tone` | metaOf.get(item.value)?.tone |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-prefix` | `data-disabled` | '' (present only while the condition holds) |
| `item-prefix` | `data-state` | 'checked' \| 'unchecked' |
| `item-prefix` | `data-xh-collection-slot` | 'prefix' |
| `item-text` | `data-disabled` | '' (present only while the condition holds) |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-description` | `data-disabled` | '' (present only while the condition holds) |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-suffix` | `data-disabled` | '' (present only while the condition holds) |
| `item-suffix` | `data-state` | 'checked' \| 'unchecked' |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `item-indicator` | `data-disabled` | '' (present only while the condition holds) |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-loading` | '' (present only while the condition holds) |
| `loading` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-xh-loading-ring` | '' |
| `error` | `data-state` | 'open' \| 'closed' |
| `retry-trigger` | `data-xh-action-control` | '' |
| `retry-trigger` | `data-xh-action-display` | 'always' |
| `retry-trigger` | `data-xh-action-profile` | 'text' |
| `retry-trigger` | `data-xh-action-size` | props.size |
| `retry-trigger` | `data-xh-action-variant` | 'ghost' |
| `overflow-tag` | `data-count` | String(overflowCount) |
| `tag` | `data-value` | v |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-select-action-bg` | `clear-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-select-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-select-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-select-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-field-clear` |
| `--xh-select-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-select-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-select-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-select-action-size` | `clear-trigger`<br>`indicator` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size`<br>`--xh-control-action-size` |
| `--xh-select-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` |
| `--xh-select-content-bg` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg` |
| `--xh-select-content-border` | `content` | `border` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border` |
| `--xh-select-content-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-select-content-highlight` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-highlight` |
| `--xh-select-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` |
| `--xh-select-content-max-w` | `content` | `max-inline-size` | `default` | `none` |
| `--xh-select-content-min-w` | `content` | `inline-size` | `default` | `--xh-overlay-menu-min-w` |
| `--xh-select-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-select-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-select-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-select-content-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-select-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-select-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-select-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-select-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-select-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-select-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-select-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-select-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-select-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-select-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_select-gap` |
| `--xh-select-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_select-h` |
| `--xh-select-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-select-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_select-px` |
| `--xh-select-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-select-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-select-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-select-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-select-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_select-font-size` |
| `--xh-select-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_select-item-px` |
| `--xh-select-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-select-error-fg` | `error` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-select-error-font-size` | `error` | `font-size` | `default` | `--xh-_select-font-size` |
| `--xh-select-error-px` | `error` | `padding-inline` | `default` | `--xh-_select-item-px` |
| `--xh-select-error-py` | `error` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-select-footer-border` | `footer` | `border-block-start` | `default` | `--xh-material-frosted-separator` |
| `--xh-select-footer-fg` | `footer` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-select-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-select-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` |
| `--xh-select-footer-px` | `footer` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-select-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-select-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-select-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-select-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-select-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-select-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-select-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_select-item-px` |
| `--xh-select-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-select-group-separator-color` | `group` | `border-block-start` | `default` | `--xh-material-frosted-separator` |
| `--xh-select-group-spacing` | `group` | `padding-block-start` | `default` | `--xh-space-1_5` |
| `--xh-select-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-select-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` |
| `--xh-select-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-select-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-select-item-check-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-_select-accent` |
| `--xh-select-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` |
| `--xh-select-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-select-item-fg` |
| `--xh-select-item-font-size` | `item` | `font-size` | `default` | `--xh-_select-font-size` |
| `--xh-select-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-medium` |
| `--xh-select-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `default`<br>`xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_select-gap` |
| `--xh-select-item-h` | `item` | `min-block-size` | `default` | `--xh-_select-item-h` |
| `--xh-select-item-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-select-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-select-item-px` | `item` | `padding-inline` | `default` | `--xh-_select-item-px` |
| `--xh-select-item-py` | `item` | `padding-block` | `default` | `--xh-_select-item-py` |
| `--xh-select-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-select-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-select-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-select-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-select-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-select-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-select-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-select-list-gap` | `list` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-select-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-select-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_select-font-size` |
| `--xh-select-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_select-item-px` |
| `--xh-select-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-select-placeholder-fg` | `value-text` | `color` | `placeholder` | `--xh-fg-subtle` |
| `--xh-select-tag-list-gap` | `tag-list` | `gap` | `xh-tag-list` | `--xh-space-1` |
| `--xh-select-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` |
| `--xh-select-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_select-font-size` |
| `--xh-select-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_select-gap` |
