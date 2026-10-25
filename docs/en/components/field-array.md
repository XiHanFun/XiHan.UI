# FieldArray

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/field-array).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/field-array" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/field-array.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/field-array" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/field-array" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/field-array.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="field-array"`: **`root`** · `table` · `header` · `column-header` · `item` · `item-label` · `item-content` · `item-cell` · `item-action` · `add-trigger` · `item-delete-trigger` · `item-drag-trigger` · `move-up-trigger` · `move-down-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-field-array>` |
| Vue components | `XhFieldArrayAddTrigger` `XhFieldArrayColumnHeader` `XhFieldArrayHeader` `XhFieldArrayItem` `XhFieldArrayItemAction` `XhFieldArrayItemCell` `XhFieldArrayItemContent` `XhFieldArrayItemDeleteTrigger` `XhFieldArrayItemDragTrigger` `XhFieldArrayItemLabel` `XhFieldArrayMoveDownTrigger` `XhFieldArrayMoveUpTrigger` `XhFieldArrayRoot` `XhFieldArrayTable` |
| Composable | `useFieldArray` |
| State machine | `fieldArrayMachine` |
| Skin | `@xihan-ui/styles/field-array.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `value` | `unknown[]` |  |
| `defaultValue` | `unknown[]` |  |
| `min` | `number` |  |
| `max` | `number` |  |
| `createItem` | `() => unknown` |  |
| `movable` | `boolean` |  |
| `stickyActions` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `layout` | `FieldArrayLayout` |  |
| `columns` | `FieldArrayColumn[]` |  |
| `name` | `FormPath` |  |
| `translations` | `Partial<FieldArrayTranslations>` |  |
| `onValueChange` | `(details: FieldArrayValueChangeDetails) => void` |  |

### FieldArrayColumn

Elements of `columns`.

| Field | Type | Required |
| --- | --- | --- |
| `id` | `string` | Yes |
| `label` | `string` |  |
| `width` | `string \| number` |  |
| `minWidth` | `string \| number` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `FieldArrayValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhFieldArrayRoot` | `default` | `FieldArrayRootSlotProps` |
| `XhFieldArrayRoot` | `item-content` | `FieldArrayItemContentSlotProps` |
| `XhFieldArrayRoot` | `item-cell` | `FieldArrayItemCellSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhFieldArrayColumnHeader` | `value` | `string` | Yes |
| `XhFieldArrayItem` | `index` | `number \| string` | Yes |
| `XhFieldArrayItemCell` | `value` | `string` | Yes |
| `XhFieldArrayRoot` | `renderItemContent` | `(item: FieldArrayItem) => ReactNode` |  |
| `XhFieldArrayRoot` | `renderItemCell` | `(item: FieldArrayItem, column: FieldArrayColumn) => ReactNode` |  |
| `XhFieldArrayRoot` | `children` | `SlotChildren<FieldArrayRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `ITEM.ADD` · `ITEM.REMOVE` · `ITEM.MOVE` · `FORM.RESET` · `PRESS.START` · `PRESS.END` · `LIST.TRACKED`

**Guards**: `canAdd` · `canRemove` · `canMove` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `unknown[]` |
| `items` | `FieldArrayItem[]` |
| `count` | `number` |
| `empty` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `movable` | `boolean` |
| `stickyActions` | `boolean` |
| `dragging` | `boolean` |
| `layout` | `FieldArrayLayout` |
| `columns` | `FieldArrayColumn[]` |
| `atMin` | `boolean` |
| `atMax` | `boolean` |
| `canAdd` | `boolean` |
| `translations` | `FieldArrayTranslations` |
| `setValue` | `(next: unknown[]) => void` |
| `add` | `() => void` |
| `insert` | `(index: number, item?: unknown) => void` |
| `remove` | `(index: number) => void` |
| `move` | `(from: number, to: number) => void` |
| `moveUp` | `(index: number) => void` |
| `moveDown` | `(index: number) => void` |
| `getRootProps` | `() => T['element']` |
| `getTableProps` | `() => T['element']` |
| `getHeaderProps` | `() => T['element']` |
| `getColumnHeaderProps` | `(column: FieldArrayColumnProps) => T['element']` |
| `getItemProps` | `(item: FieldArrayItemProps) => T['element']` |
| `getItemCellProps` | `(cell: FieldArrayItemCellProps) => T['element']` |
| `getItemLabelProps` | `(item: FieldArrayItemProps) => T['element']` |
| `getItemContentProps` | `(item: FieldArrayItemProps) => T['element']` |
| `getItemActionProps` | `(item: FieldArrayItemProps) => T['element']` |
| `getAddTriggerProps` | `() => T['button']` |
| `getItemDeleteTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |
| `getMoveUpTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |
| `getMoveDownTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |
| `getItemDragTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `field-array.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `table` | `aria-label` | props.ariaLabel \| undefined |
| `table` | `aria-rowcount` | count + 1 \| undefined |
| `table` | `role` | 'table' \| undefined |
| `header` | `aria-rowindex` | 1 \| undefined |
| `header` | `role` | 'row' \| undefined |
| `column-header` | `role` | 'columnheader' \| undefined |
| `item` | `aria-rowindex` | item.index + 2 \| undefined |
| `item` | `role` | 'row' \| undefined |
| `item-label` | `role` | 'rowheader' \| undefined |
| `item-cell` | `role` | 'cell' \| undefined |
| `item-action` | `role` | 'cell' \| undefined |
| `add-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-label` | label.deleteItem(item.index + 1, count) |
| `item-drag-trigger` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/field-array.css` is written against `[data-scope="field-array"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-field-array` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-at-max` | '' (present only while the condition holds) |
| `root` | `data-at-min` | '' (present only while the condition holds) |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-instant` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-layout` | 'table' \| 'list' |
| `root` | `data-movable` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `table` | `data-at-max-horizontal` | '' (present only while the condition holds) |
| `table` | `data-at-min-horizontal` | '' (present only while the condition holds) |
| `table` | `data-layout` | 'table' \| 'list' |
| `header` | `data-frozen-actions` | '' (present only while the condition holds) |
| `header` | `data-layout` | 'table' \| 'list' |
| `column-header` | `data-layout` | 'table' \| 'list' |
| `column-header` | `data-value` | column.value |
| `item` | `data-animating` | dragged['data-animating'] |
| `item` | `data-at-max` | '' (present only while the condition holds) |
| `item` | `data-at-min` | '' (present only while the condition holds) |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-dragging` | dragged['data-dragging'] |
| `item` | `data-first` | '' (present only while the condition holds) |
| `item` | `data-index` | String(item.index) |
| `item` | `data-invalid` | '' (present only while the condition holds) |
| `item` | `data-last` | '' (present only while the condition holds) |
| `item` | `data-layout` | 'table' \| 'list' |
| `item` | `data-readonly` | '' (present only while the condition holds) |
| `item-label` | `data-at-max` | '' (present only while the condition holds) |
| `item-label` | `data-at-min` | '' (present only while the condition holds) |
| `item-label` | `data-disabled` | '' (present only while the condition holds) |
| `item-label` | `data-index` | String(item.index) |
| `item-label` | `data-invalid` | '' (present only while the condition holds) |
| `item-label` | `data-layout` | 'table' \| 'list' |
| `item-label` | `data-readonly` | '' (present only while the condition holds) |
| `item-content` | `data-at-max` | '' (present only while the condition holds) |
| `item-content` | `data-at-min` | '' (present only while the condition holds) |
| `item-content` | `data-disabled` | '' (present only while the condition holds) |
| `item-content` | `data-index` | String(item.index) |
| `item-content` | `data-invalid` | '' (present only while the condition holds) |
| `item-content` | `data-layout` | 'table' \| 'list' |
| `item-content` | `data-readonly` | '' (present only while the condition holds) |
| `item-cell` | `data-at-max` | '' (present only while the condition holds) |
| `item-cell` | `data-at-min` | '' (present only while the condition holds) |
| `item-cell` | `data-disabled` | '' (present only while the condition holds) |
| `item-cell` | `data-index` | String(item.index) |
| `item-cell` | `data-invalid` | '' (present only while the condition holds) |
| `item-cell` | `data-layout` | 'table' \| 'list' |
| `item-cell` | `data-readonly` | '' (present only while the condition holds) |
| `item-cell` | `data-value` | cell.value |
| `item-action` | `data-at-max` | '' (present only while the condition holds) |
| `item-action` | `data-at-min` | '' (present only while the condition holds) |
| `item-action` | `data-disabled` | '' (present only while the condition holds) |
| `item-action` | `data-frozen` | 'end' \| undefined |
| `item-action` | `data-index` | String(item.index) |
| `item-action` | `data-invalid` | '' (present only while the condition holds) |
| `item-action` | `data-layout` | 'table' \| 'list' |
| `item-action` | `data-readonly` | '' (present only while the condition holds) |
| `add-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `add-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `add-trigger` | `data-xh-action-control` | '' |
| `add-trigger` | `data-xh-action-display` | 'always' |
| `add-trigger` | `data-xh-action-profile` | 'text' |
| `add-trigger` | `data-xh-action-size` | 'md' |
| `add-trigger` | `data-xh-action-variant` | 'outline' |
| `item-delete-trigger` | `data-at-max` | '' (present only while the condition holds) |
| `item-delete-trigger` | `data-at-min` | '' (present only while the condition holds) |
| `item-delete-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `item-delete-trigger` | `data-index` | String(item.index) |
| `item-delete-trigger` | `data-invalid` | '' (present only while the condition holds) |
| `item-delete-trigger` | `data-layout` | 'table' \| 'list' |
| `item-delete-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `item-delete-trigger` | `data-readonly` | '' (present only while the condition holds) |
| `item-delete-trigger` | `data-xh-action-control` | '' |
| `item-delete-trigger` | `data-xh-action-display` | 'always' |
| `item-delete-trigger` | `data-xh-action-profile` | 'icon' |
| `item-delete-trigger` | `data-xh-action-size` | 'xs' |
| `item-delete-trigger` | `data-xh-action-variant` | 'ghost' |
| `item-drag-trigger` | `data-at-max` | '' (present only while the condition holds) |
| `item-drag-trigger` | `data-at-min` | '' (present only while the condition holds) |
| `item-drag-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `item-drag-trigger` | `data-dragging` | grip['data-dragging'] |
| `item-drag-trigger` | `data-index` | String(item.index) |
| `item-drag-trigger` | `data-invalid` | '' (present only while the condition holds) |
| `item-drag-trigger` | `data-layout` | 'table' \| 'list' |
| `item-drag-trigger` | `data-pressed` | grip['data-pressed'] |
| `item-drag-trigger` | `data-readonly` | '' (present only while the condition holds) |
| `item-drag-trigger` | `data-xh-action-control` | '' |
| `item-drag-trigger` | `data-xh-action-display` | 'always' |
| `item-drag-trigger` | `data-xh-action-profile` | 'icon' |
| `item-drag-trigger` | `data-xh-action-size` | 'xs' |
| `item-drag-trigger` | `data-xh-action-variant` | 'ghost' |
| `move-up-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `move-up-trigger` | `data-xh-action-control` | '' |
| `move-up-trigger` | `data-xh-action-display` | 'always' |
| `move-up-trigger` | `data-xh-action-profile` | 'icon' |
| `move-up-trigger` | `data-xh-action-size` | 'xs' |
| `move-up-trigger` | `data-xh-action-variant` | 'ghost' |
| `move-down-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `move-down-trigger` | `data-xh-action-control` | '' |
| `move-down-trigger` | `data-xh-action-display` | 'always' |
| `move-down-trigger` | `data-xh-action-profile` | 'icon' |
| `move-down-trigger` | `data-xh-action-size` | 'xs' |
| `move-down-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-field-array-action-gap` | `add-trigger`<br>`item-action` | `gap` | `default` | `--xh-space-1` |
| `--xh-field-array-add-bg` | `add-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-field-array-add-bg-active` | `add-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-field-array-add-bg-hover` | `add-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-field-array-add-border` | `add-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` |
| `--xh-field-array-add-border-disabled` | `add-trigger` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` |
| `--xh-field-array-add-border-hover` | `add-trigger` | `border-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-border-hover` |
| `--xh-field-array-add-fg` | `add-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-brand` |
| `--xh-field-array-add-font-size` | `add-trigger` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-field-array-add-height` | `add-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-field-array-add-px` | `add-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-field-array-add-radius` | `add-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-field-array-cell-control-h` | `item-action`<br>`item-cell`<br>`item-label` | `min-block-size` | `is([data-part='item-cell'], [data-part='item-label'], [data-part='item-action'])`<br>`layout=table` | `--xh-_field-array-cell-control-h` |
| `--xh-field-array-cell-px` | `column-header`<br>`item-action`<br>`item-cell`<br>`item-label` | `padding-inline` | `is([data-part='item-cell'], [data-part='item-label'], [data-part='item-action'])`<br>`layout=table` | `--xh-table-cell-px-md` |
| `--xh-field-array-cell-py` | `column-header`<br>`item-action`<br>`item-cell`<br>`item-label` | `padding-block` | `is([data-part='item-cell'], [data-part='item-label'], [data-part='item-action'])`<br>`layout=table` | `--xh-table-cell-py-md` |
| `--xh-field-array-column-header-fg` | `column-header` | `color` | `layout=table` | `--xh-fg-default` |
| `--xh-field-array-column-header-font-weight` | `column-header` | `font-weight` | `layout=table` | `--xh-font-weight-medium` |
| `--xh-field-array-content-gap` | `item-content` | `gap` | `default` | `--xh-space-2` |
| `--xh-field-array-drag-grip-h` | `item-drag-trigger` | `block-size` | `empty` | `--xh-space-3` |
| `--xh-field-array-drag-grip-w` | `item-drag-trigger` | `inline-size` | `empty` | `--xh-space-1` |
| `--xh-field-array-frozen-bg` | `item-action`<br>`item-label` | `background` | `is([data-part='item-label'], [data-part='item-action'])`<br>`layout=table` | `--xh-field-array-table-bg` |
| `--xh-field-array-frozen-edge` | `header`<br>`item`<br>`item-action`<br>`item-label`<br>`table` | `border-inline-end-color`<br>`border-inline-start-color` | `at-max-horizontal`<br>`at-min-horizontal`<br>`frozen-actions`<br>`frozen=end`<br>`is([data-part='item'], [data-part='header'])`<br>`layout=table`<br>`not([data-at-max-horizontal])`<br>`not([data-at-min-horizontal])` | `--xh-border-default` |
| `--xh-field-array-frozen-header-bg` | `header` | `background` | `layout=table` | `--xh-bg-subtle-opaque` |
| `--xh-field-array-gap` | `root` | `gap` | `default` | `--xh-space-2` |
| `--xh-field-array-header-bg` | `header` | `background` | `layout=table` | `--xh-bg-subtle` |
| `--xh-field-array-icon-size` | `add-trigger`<br>`item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-field-array-item-bg-dragging` | `item` | `background` | `dragging` | `--xh-bg-surface` |
| `--xh-field-array-item-delete-fg-hover` | `item-delete-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-danger-hover` |
| `--xh-field-array-item-gap` | `item` | `gap` | `default` | `--xh-space-2` |
| `--xh-field-array-item-label-fg` | `item-label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-field-array-item-label-font-size` | `item-label` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-field-array-item-padding` | `item` | `padding` | `default` | `--xh-space-0` |
| `--xh-field-array-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-field-array-item-shadow-dragging` | `item` | `box-shadow` | `dragging` | `--xh-elevation-lifted` |
| `--xh-field-array-row-divider` | `header`<br>`item` | `border-block-end`<br>`border-block-start` | `layout=table` | `--xh-border-subtle` |
| `--xh-field-array-sticky-column-layer` | `header`<br>`item-action`<br>`item-label` | `z-index` | `frozen-actions`<br>`frozen=end`<br>`layout=table` | `1` |
| `--xh-field-array-table-bg` | `item-action`<br>`item-label`<br>`table` | `background` | `is([data-part='item-label'], [data-part='item-action'])`<br>`layout=table` | `--xh-bg-surface` |
| `--xh-field-array-table-border` | `table` | `border` | `layout=table` | `--xh-border-default` |
| `--xh-field-array-table-radius` | `header`<br>`table` | `border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `layout=table` | `--xh-shape-surface` |
| `--xh-field-array-trigger-bg` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-field-array-trigger-bg-active` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-field-array-trigger-bg-hover` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-field-array-trigger-fg` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-field-array-trigger-fg-hover` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-field-array-trigger-font-size` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-field-array-trigger-radius` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-field-array-trigger-size` | `item-delete-trigger`<br>`item-drag-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
