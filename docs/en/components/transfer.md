# Transfer

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/transfer).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/transfer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/transfer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/transfer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/transfer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/transfer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="transfer"`: `root` · `hidden-input` · **`source-panel`** · **`target-panel`** · `panel-header` · `panel-title` · `panel-count` · `search` · **`list`** · `group` · `group-label` · `item` · `item-text` · `item-description` · `item-suffix` · `item-checkbox` · `empty` · `loading` · **`to-target-trigger`** · `to-source-trigger` · `select-all-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-transfer>` |
| Vue components | `XhTransferEmpty` `XhTransferGroup` `XhTransferGroupLabel` `XhTransferItem` `XhTransferItemCheckbox` `XhTransferItemDescription` `XhTransferItemSuffix` `XhTransferItemText` `XhTransferList` `XhTransferLoading` `XhTransferPanelCount` `XhTransferPanelHeader` `XhTransferPanelTitle` `XhTransferRoot` `XhTransferSearch` `XhTransferSelectAllTrigger` `XhTransferSourcePanel` `XhTransferTargetPanel` `XhTransferToSourceTrigger` `XhTransferToTargetTrigger` |
| Composable | `useTransfer` |
| State machine | `transferMachine` |
| Skin | `@xihan-ui/styles/transfer.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `TransferItem[]` |  |
| `virtualizers` | `Partial<Record<TransferSide, CollectionVirtualizer>>` |  |
| `value` | `string[]` |  |
| `defaultValue` | `string[]` |  |
| `name` | `string` |  |
| `form` | `string` |  |
| `selection` | `string[]` |  |
| `defaultSelection` | `string[]` |  |
| `searchable` | `boolean` |  |
| `filter` | `TransferFilter` |  |
| `pageSize` | `number` |  |
| `ariaLabel` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `loading` | `boolean` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `oneWay` | `boolean` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `translations` | `Partial<TransferTranslations>` |  |
| `onValueChange` | `(details: TransferValueChangeDetails) => void` |  |
| `onSelectionChange` | `(details: TransferSelectionChangeDetails) => void` |  |

### TransferItem

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` | Yes |
| `disabled` | `boolean` |  |
| `tone` | `Tone` |  |
| `description` | `string` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `TransferValueChangeDetails` |
| `selection-change` | `TransferSelectionChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTransferRoot` | `default` | `TransferRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTransferGroup` | `value` | `string` | Yes |
| `XhTransferItem` | `value` | `string` | Yes |
| `XhTransferRoot` | `children` | `SlotChildren<TransferRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `item-suffix` | 'checked' \| 'unchecked' |
| `item-checkbox` | 'checked' \| 'unchecked' |
| `select-all-trigger` | itemState(item) |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `FORM.RESET` · `VALUE.SET` · `SELECTION.SET` · `ITEM.TOGGLE` · `SIDE.TOGGLE_ALL` · `ITEMS.MOVE` · `SEARCH.SET` · `PAGE.SET` · `ITEM.FOCUS` · `LIST.BLUR` · `PRESS.START` · `PRESS.END`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `collection` | `readonly TransferItem[]` |
| `value` | `string[]` |
| `selection` | `string[]` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `required` | `boolean` |
| `oneWay` | `boolean` |
| `searchable` | `boolean` |
| `translations` | `TransferTranslations` |
| `visibleItems` | `(side: TransferSide) => readonly TransferItem[]` |
| `filteredItems` | `(side: TransferSide) => readonly TransferItem[]` |
| `pageSize` | `number \| undefined` |
| `page` | `(side: TransferSide) => number` |
| `pageCount` | `(side: TransferSide) => number` |
| `setPage` | `(side: TransferSide, page: number) => void` |
| `checkedValues` | `(side: TransferSide) => string[]` |
| `checkState` | `(side: TransferSide) => TransferCheckState` |
| `query` | `(side: TransferSide) => string` |
| `canMove` | `(to: TransferSide) => boolean` |
| `isChecked` | `(value: string) => boolean` |
| `sideOf` | `(value: string) => TransferSide` |
| `setValue` | `(next: string[]) => void` |
| `setSelection` | `(next: string[]) => void` |
| `setQuery` | `(side: TransferSide, query: string) => void` |
| `toggle` | `(value: string, options?: { extend?: boolean }) => void` |
| `toggleAll` | `(side: TransferSide) => void` |
| `move` | `(to: TransferSide) => void` |
| `getRootProps` | `() => T['element']` |
| `getHiddenInputProps` | `(props?: { value: string }) => T['input']` |
| `getPanelProps` | `(props: TransferPanelProps) => T['element']` |
| `getPanelHeaderProps` | `(props: TransferPanelProps) => T['element']` |
| `getPanelTitleProps` | `(props: TransferPanelProps) => T['element']` |
| `getPanelCountProps` | `(props: TransferPanelProps) => T['element']` |
| `getSearchProps` | `(props: TransferPanelProps) => T['input']` |
| `getListProps` | `(props: TransferPanelProps) => T['element']` |
| `getSelectAllTriggerProps` | `(props: TransferPanelProps) => T['button']` |
| `getEmptyProps` | `(props: TransferPanelProps) => T['element']` |
| `getLoadingProps` | `(props: TransferPanelProps) => T['element']` |
| `getGroupProps` | `(props: TransferGroupProps) => T['element']` |
| `getGroupLabelProps` | `(props: TransferGroupProps) => T['element']` |
| `getItemProps` | `(props: TransferItemProps) => T['element']` |
| `getItemTextProps` | `(props: TransferItemProps) => T['element']` |
| `getItemDescriptionProps` | `(props: TransferItemProps) => T['element']` |
| `getItemSuffixProps` | `(props: TransferItemProps) => T['element']` |
| `getItemCheckboxProps` | `(props: TransferItemProps) => T['element']` |
| `getToTargetTriggerProps` | `() => T['button']` |
| `getToSourceTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `transfer.kbd.press` |
| `Tab` / `Shift+Tab` | `transfer.kbd.tab` |
| `ArrowDown` | `transfer.kbd.next` |
| `ArrowUp` | `transfer.kbd.prev` |
| `Home` | `transfer.kbd.first` |
| `End` | `transfer.kbd.last` |
| `Space` / `Enter` / `Ctrl+Space` | `transfer.kbd.toggle` |
| `Shift+ArrowDown` / `Shift+ArrowUp` | `transfer.kbd.extend` |
| `Ctrl+A` / `Cmd+A` | `transfer.kbd.select-all` |
| `ArrowRight` / `ArrowLeft` | `transfer.kbd.move` |
| `Enter` / `Space` | `transfer.kbd.trigger` |
| `Enter` / `Space` | `transfer.kbd.select-all-trigger` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `role` | 'group' \| undefined |
| `hidden-input` | `aria-hidden` | 'true' |
| `search` | `aria-controls` | listId[panel.side] |
| `search` | `aria-labelledby` | titleId[panel.side] |
| `list` | `aria-busy` | 'true' \| undefined |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-invalid` | 'true' \| 'false' |
| `list` | `aria-labelledby` | titleId[panel.side] |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `aria-readonly` | 'true' \| 'false' |
| `list` | `aria-required` | 'true' \| 'false' \| undefined |
| `list` | `role` | 'listbox' |
| `group` | `aria-labelledby` | id of the `group-label` part |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-checkbox` | `aria-hidden` | 'true' |
| `to-target-trigger` | `aria-controls` | listId.target |
| `to-target-trigger` | `aria-label` | label.toTarget |
| `to-source-trigger` | `aria-controls` | listId.source |
| `to-source-trigger` | `aria-label` | label.toSource |
| `select-all-trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `select-all-trigger` | `aria-controls` | listId[panel.side] |
| `select-all-trigger` | `role` | 'checkbox' |

## Style reference

### Skin

`@xihan-ui/styles/transfer.css` is written against `[data-scope="transfer"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-transfer` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-one-way` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `panel-header` | `data-disabled` | '' (present only while the condition holds) |
| `panel-header` | `data-side` | panel.side |
| `panel-title` | `data-side` | panel.side |
| `panel-count` | `data-checked-count` | String(checked[panel.side].length) |
| `panel-count` | `data-count` | String(filtered[panel.side].length) |
| `panel-count` | `data-side` | panel.side |
| `search` | `data-side` | panel.side |
| `search` | `data-xh-field-input` | '' |
| `list` | `data-disabled` | '' (present only while the condition holds) |
| `list` | `data-invalid` | '' (present only while the condition holds) |
| `list` | `data-readonly` | '' (present only while the condition holds) |
| `list` | `data-side` | panel.side |
| `list` | `data-xh-virtualized` | '' (present only while the condition holds) |
| `group` | `data-disabled` | '' (present only while the condition holds) |
| `group` | `data-side` | group.side |
| `group-label` | `data-disabled` | '' (present only while the condition holds) |
| `group-label` | `data-side` | group.side |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-side` | item.side |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-tone` | index.get(v)?.tone |
| `item` | `data-xh-collection-context` | 'page' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-disabled` | '' (present only while the condition holds) |
| `item-text` | `data-highlighted` | '' (present only while the condition holds) |
| `item-text` | `data-side` | item.side |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-description` | `data-disabled` | '' (present only while the condition holds) |
| `item-description` | `data-highlighted` | '' (present only while the condition holds) |
| `item-description` | `data-side` | item.side |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-suffix` | `data-disabled` | '' (present only while the condition holds) |
| `item-suffix` | `data-highlighted` | '' (present only while the condition holds) |
| `item-suffix` | `data-side` | item.side |
| `item-suffix` | `data-state` | 'checked' \| 'unchecked' |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `item-checkbox` | `data-disabled` | '' (present only while the condition holds) |
| `item-checkbox` | `data-highlighted` | '' (present only while the condition holds) |
| `item-checkbox` | `data-side` | item.side |
| `item-checkbox` | `data-state` | 'checked' \| 'unchecked' |
| `item-checkbox` | `data-xh-check-mark` | state['data-state'] |
| `item-checkbox` | `data-xh-check-mark-profile` | 'box' |
| `item-checkbox` | `data-xh-collection-slot` | 'prefix' |
| `empty` | `data-disabled` | '' (present only while the condition holds) |
| `empty` | `data-side` | panel.side |
| `loading` | `data-disabled` | '' (present only while the condition holds) |
| `loading` | `data-loading` | '' (present only while the condition holds) |
| `loading` | `data-side` | panel.side |
| `loading` | `data-xh-loading-ring` | '' |
| `to-target-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `to-target-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `to-target-trigger` | `data-xh-action-control` | '' |
| `to-target-trigger` | `data-xh-action-display` | 'always' |
| `to-target-trigger` | `data-xh-action-profile` | 'icon' |
| `to-target-trigger` | `data-xh-action-size` | 'sm' |
| `to-target-trigger` | `data-xh-action-variant` | 'subtle' |
| `to-source-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `to-source-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `to-source-trigger` | `data-xh-action-control` | '' |
| `to-source-trigger` | `data-xh-action-display` | 'always' |
| `to-source-trigger` | `data-xh-action-profile` | 'icon' |
| `to-source-trigger` | `data-xh-action-size` | 'sm' |
| `to-source-trigger` | `data-xh-action-variant` | 'subtle' |
| `select-all-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `select-all-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `select-all-trigger` | `data-side` | panel.side |
| `select-all-trigger` | `data-state` | itemState(item) |
| `select-all-trigger` | `data-xh-action-control` | '' |
| `select-all-trigger` | `data-xh-action-display` | 'always' |
| `select-all-trigger` | `data-xh-action-profile` | 'text' |
| `select-all-trigger` | `data-xh-action-size` | 'xs' |
| `select-all-trigger` | `data-xh-action-variant` | 'ghost' |
| `select-all-trigger` | `data-xh-check-mark` | itemState(item) |
| `select-all-trigger` | `data-xh-check-mark-profile` | 'row' |
| `panel` | `data-disabled` | '' (present only while the condition holds) |
| `panel` | `data-side` | panel.side |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-transfer-checkbox-bg` | `item-checkbox`<br>`select-all-trigger` | `background` | `default` | `transparent` |
| `--xh-transfer-checkbox-bg-checked` | `item-checkbox`<br>`select-all-trigger` | `background` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-accent` |
| `--xh-transfer-checkbox-bg-disabled` | `item-checkbox` | `background` | `disabled` | `--xh-bg-muted` |
| `--xh-transfer-checkbox-border` | `item-checkbox`<br>`select-all-trigger` | `border` | `default` | `--xh-border-strong` |
| `--xh-transfer-checkbox-border-checked` | `item-checkbox`<br>`select-all-trigger` | `border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-accent` |
| `--xh-transfer-checkbox-border-disabled` | `item-checkbox` | `border-color` | `disabled` | `--xh-border-default` |
| `--xh-transfer-checkbox-fg` | `item-checkbox`<br>`select-all-trigger` | `--xh-check-mark-fg`<br>`color` | `default` | `--xh-_transfer-on-accent` |
| `--xh-transfer-checkbox-font-size` | `item-checkbox`<br>`select-all-trigger` | `font-size` | `default` | `--xh-_transfer-box` |
| `--xh-transfer-checkbox-radius` | `item-checkbox`<br>`select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-transfer-checkbox-size` | `item-checkbox`<br>`select-all-trigger` | `--xh-check-mark-box-size`<br>`--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-_transfer-box` |
| `--xh-transfer-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` |
| `--xh-transfer-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_transfer-font-size` |
| `--xh-transfer-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_transfer-px` |
| `--xh-transfer-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-transfer-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-transfer-gap` | `root` | `gap` | `default` | `--xh-space-5` |
| `--xh-transfer-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-transfer-group-label-fg` | `group-label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-transfer-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-transfer-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-transfer-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_transfer-px` |
| `--xh-transfer-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-transfer-group-spacing` | `group` | `margin-block-start` | `default` | `--xh-space-1_5` |
| `--xh-transfer-icon-size` | `item`<br>`root`<br>`to-source-trigger`<br>`to-target-trigger` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-_action-profile-glyph-size`<br>`--xh-_collection-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-transfer-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` |
| `--xh-transfer-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-transfer-item-bg-selected` | `item` | `background-color` | `disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` |
| `--xh-transfer-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-fg-default` |
| `--xh-transfer-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` |
| `--xh-transfer-item-font-size` | `item` | `font-size` | `default` | `--xh-_transfer-font-size` |
| `--xh-transfer-item-gap` | `item` | `gap` | `default` | `--xh-_transfer-gap` |
| `--xh-transfer-item-h` | `item` | `min-block-size` | `default` | `--xh-_transfer-item-h` |
| `--xh-transfer-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-transfer-item-px` | `item` | `padding-inline` | `default` | `--xh-_transfer-px` |
| `--xh-transfer-item-py` | `item` | `padding-block` | `default` | `--xh-_transfer-item-py` |
| `--xh-transfer-item-radius` | `item` | `border-radius` | `default` | `0` |
| `--xh-transfer-list-gap` | `list` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-transfer-list-h` | `list` | `block-size` | `default` | `--xh-viewport-h-sm` |
| `--xh-transfer-list-px` | `list` | `padding-inline` | `default` | `--xh-space-0` |
| `--xh-transfer-list-py` | `list` | `padding-block` | `default` | `--xh-space-0` |
| `--xh-transfer-loading-fg` | `loading` | `color` | `default` | `--xh-fg-muted` |
| `--xh-transfer-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_transfer-font-size` |
| `--xh-transfer-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_transfer-px` |
| `--xh-transfer-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-transfer-panel-bg` | `source-panel`<br>`target-panel` | `background` | `default` | `--xh-bg-surface` |
| `--xh-transfer-panel-bg-disabled` | `source-panel`<br>`target-panel` | `background` | `disabled` | `--xh-bg-muted` |
| `--xh-transfer-panel-border` | `source-panel`<br>`target-panel` | `border` | `default` | `--xh-border-default` |
| `--xh-transfer-panel-border-invalid` | `root`<br>`source-panel`<br>`target-panel` | `border-color` | `invalid`<br>`is([data-scope='transfer'][data-part='source-panel'], [data-scope='transfer'][data-part='target-panel'])` | `--xh-border-invalid` |
| `--xh-transfer-panel-count-fg` | `panel-count` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-transfer-panel-count-font-size` | `panel-count` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-transfer-panel-header-bg` | `panel-header` | `background` | `default` | `--xh-bg-muted` |
| `--xh-transfer-panel-header-gap` | `panel-header` | `gap` | `default` | `--xh-_transfer-gap` |
| `--xh-transfer-panel-header-px` | `panel-header` | `padding-inline` | `default` | `--xh-_transfer-px` |
| `--xh-transfer-panel-header-py` | `panel-header` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-transfer-panel-radius` | `source-panel`<br>`target-panel` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-transfer-panel-title-fg` | `panel-title` | `color` | `default` | `--xh-fg-default` |
| `--xh-transfer-panel-title-font-size` | `panel-title` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-transfer-panel-title-font-weight` | `panel-title` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-transfer-placeholder-fg` | `search` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-transfer-search-bg` | `search` | `background` | `default` | `transparent` |
| `--xh-transfer-search-border` | `search` | `border-block-end` | `default` | `--xh-material-solid-separator` |
| `--xh-transfer-search-fg` | `search` | `color` | `default` | `--xh-fg-default` |
| `--xh-transfer-search-font-size` | `search` | `font-size` | `default` | `--xh-_transfer-font-size` |
| `--xh-transfer-search-h` | `search` | `block-size` | `default` | `--xh-_transfer-h` |
| `--xh-transfer-search-px` | `search` | `padding-inline` | `default` | `--xh-_transfer-px` |
| `--xh-transfer-select-all-bg-hover` | `select-all-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-transfer-select-all-bg-pressed` | `select-all-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-transfer-select-all-fg` | `select-all-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-muted` |
| `--xh-transfer-select-all-font-size` | `select-all-trigger` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-transfer-select-all-gap` | `select-all-trigger` | `gap` | `default` | `--xh-control-gap-sm` |
| `--xh-transfer-select-all-radius` | `select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-transfer-trigger-bg` | `to-source-trigger`<br>`to-target-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-transfer-trigger-bg-active` | `to-source-trigger`<br>`to-target-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-transfer-trigger-bg-hover` | `to-source-trigger`<br>`to-target-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-transfer-trigger-border` | `to-source-trigger`<br>`to-target-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed`<br>`--xh-_action-variant-border-rest` |
| `--xh-transfer-trigger-fg` | `to-source-trigger`<br>`to-target-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-transfer-trigger-font-size` | `to-source-trigger`<br>`to-target-trigger` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-transfer-trigger-px` | `to-source-trigger`<br>`to-target-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-transfer-trigger-radius` | `to-source-trigger`<br>`to-target-trigger` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-transfer-trigger-shadow-active` | `to-source-trigger`<br>`to-target-trigger` | `box-shadow` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` |
| `--xh-transfer-trigger-shadow-hover` | `to-source-trigger`<br>`to-target-trigger` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` |
| `--xh-transfer-trigger-size` | `to-source-trigger`<br>`to-target-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
