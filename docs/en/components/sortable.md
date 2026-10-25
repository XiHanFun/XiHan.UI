# Sortable

Layout component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/sortable).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/sortable" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/sortable.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/sortable" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/sortable" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/sortable.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="sortable"`: **`root`** · `item` · `item-drag-trigger` · `drop-indicator` · `live-region`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-sortable>` |
| Vue components | `XhSortableDropIndicator` `XhSortableItem` `XhSortableItemDragTrigger` `XhSortableLiveRegion` `XhSortableRoot` |
| Composable | `useSortable` |
| State machine | `sortableMachine` |
| Skin | `@xihan-ui/styles/sortable.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `ids` | `string[]` | Yes |
| `orientation` | `SortableAxis` |  |
| `disabled` | `boolean` |  |
| `activationDistance` | `number` |  |
| `autoScroll` | `boolean` |  |
| `dir` | `Direction` |  |
| `translations` | `Partial<SortableTranslations>` |  |
| `group` | `string` |  |
| `listId` | `string` |  |
| `onSort` | `(details: SortableSortDetails) => void` |  |
| `onTransfer` | `(details: SortableTransferDetails) => void` |  |
| `onDragStart` | `(details: SortableDragStartDetails) => void` |  |
| `onDragEnd` | `(details: SortableDragEndDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `sort` | `SortableSortDetails` |
| `transfer` | `SortableTransferDetails` |
| `drag-start` | `SortableDragStartDetails` |
| `drag-end` | `SortableDragEndDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhSortableItem` | `default` | `SortableItemSlotProps` |
| `XhSortableItemDragTrigger` | `default` | — |
| `XhSortableRoot` | `default` | `SortableRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhSortableItem` | `itemId` | `string` | Yes |
| `XhSortableItem` | `disabled` | `boolean` |  |
| `XhSortableItem` | `children` | `SlotChildren<SortableItemSlotProps>` |  |
| `XhSortableItemDragTrigger` | `itemId` | `string` | Yes |
| `XhSortableItemDragTrigger` | `disabled` | `boolean` |  |
| `XhSortableRoot` | `children` | `SlotChildren<SortableRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle` · `pending` · `dragging`

**Events**: `ITEM.POINTER_DOWN` · `POINTER.MOVE` · `POINTER.END` · `POINTER.CANCEL` · `ITEM.PICKUP` · `KEY.MOVE` · `KEY.MOVE_LIST` · `KEY.DROP` · `KEY.CANCEL` · `GROUP.OVER` · `GROUP.LEAVE` · `GROUP.DROP` · `PRESS.START` · `PRESS.END`

**Guards**: `canSort` · `passedActivation` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `dragging` | `boolean` |
| `activeId` | `string \| null` |
| `from` | `number` |
| `to` | `number` |
| `mode` | `SortableMode \| null` |
| `items` | `SortableItemState[]` |
| `getRootProps` | `() => T['element']` |
| `getItemProps` | `(props: SortableItemProps) => T['element']` |
| `getItemDragTriggerProps` | `(props: SortableItemProps) => T['element']` |
| `getDropIndicatorProps` | `() => T['element']` |
| `getLiveRegionProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Space` / `Enter` | `sortable.kbd.pickup` |
| `ArrowDown` / `ArrowRight` | `sortable.kbd.next` |
| `ArrowUp` / `ArrowLeft` | `sortable.kbd.prev` |
| `ArrowRight` / `ArrowDown` | `sortable.kbd.next-list` |
| `ArrowLeft` / `ArrowUp` | `sortable.kbd.prev-list` |
| `Space` / `Enter` | `sortable.kbd.drop` |
| `Escape` | `sortable.kbd.cancel` |
| `Enter` / `Space` | `sortable.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | translations.root |
| `root` | `role` | 'group' |
| `item-drag-trigger` | `aria-disabled` | 'true' \| 'false' |
| `item-drag-trigger` | `aria-label` | translations.itemDragTrigger(name) |
| `item-drag-trigger` | `aria-pressed` | 'true' \| 'false' |
| `item-drag-trigger` | `aria-roledescription` | translations.itemDragTriggerRoleDescription |
| `item-drag-trigger` | `role` | 'button' |
| `drop-indicator` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/sortable.css` is written against `[data-scope="sortable"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-sortable` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-drag-mode` | context.get('mode') \| undefined |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-drop` | 'inside' \| undefined |
| `root` | `data-orientation` | props.orientation |
| `item` | `data-animating` | '' (present only while the condition holds) |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-dragging` | '' (present only while the condition holds) |
| `item` | `data-index` | String(item?.index ?? -1) |
| `item-drag-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `item-drag-trigger` | `data-dragging` | '' (present only while the condition holds) |
| `item-drag-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `item-drag-trigger` | `data-xh-action-control` | '' |
| `item-drag-trigger` | `data-xh-action-display` | 'always' |
| `item-drag-trigger` | `data-xh-action-profile` | 'icon' |
| `item-drag-trigger` | `data-xh-action-size` | 'xs' |
| `item-drag-trigger` | `data-xh-action-variant` | 'ghost' |
| `drop-indicator` | `data-orientation` | props.orientation |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-sortable-drag-bg-active` | `item-drag-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-sortable-drag-bg-hover` | `item-drag-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-sortable-drag-fg` | `item-drag-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-sortable-drag-fg-disabled` | `item-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-sortable-drag-fg-hover` | `item-drag-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-sortable-drag-grip-h` | `item-drag-trigger` | `block-size` | `empty` | `--xh-space-3` |
| `--xh-sortable-drag-grip-w` | `item-drag-trigger` | `inline-size` | `empty` | `--xh-space-1` |
| `--xh-sortable-drag-icon-size` | `item-drag-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-sortable-drag-radius` | `item-drag-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-sortable-drag-size` | `item-drag-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-sortable-drop-indicator-bg` | `drop-indicator` | `background` | `default` | `--xh-bg-brand` |
| `--xh-sortable-drop-indicator-radius` | `drop-indicator` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-sortable-drop-indicator-size` | `drop-indicator` | `block-size`<br>`inline-size` | `orientation=both`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` |
| `--xh-sortable-gap` | `root` | `gap` | `default` | `--xh-space-2` |
| `--xh-sortable-item-opacity-dragging` | `item` | `opacity` | `dragging` | `0.9` |
| `--xh-sortable-item-shadow-dragging` | `item` | `box-shadow` | `dragging` | `--xh-elevation-lifted` |
