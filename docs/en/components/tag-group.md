# TagGroup

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/tag-group).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tag-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tag-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tag-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tag-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tag-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="tag-group"`: `root` · `label` · **`list`** · `cell` · `item-indicator`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-tag-group>` |
| Vue components | `XhTagGroupCell` `XhTagGroupItem` `XhTagGroupItemDeleteTrigger` `XhTagGroupItemIndicator` `XhTagGroupItemText` `XhTagGroupLabel` `XhTagGroupList` `XhTagGroupRoot` |
| Composable | `useTagGroup` |
| State machine | `tagGroupMachine` |
| Skin | `@xihan-ui/styles/tag-group.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `collection` | `TagGroupNode[]` |  |
| `value` | `string \| string[]` |  |
| `defaultValue` | `string \| string[]` |  |
| `selectionMode` | `TagGroupSelectionMode` |  |
| `deletable` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `orientation` | `Orientation` |  |
| `typeahead` | `boolean` |  |
| `variant` | `TagVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onValueChange` | `(details: TagGroupValueChangeDetails) => void` |  |
| `onItemDelete` | `(details: TagGroupItemDeleteDetails) => void` |  |
| `translations` | `Partial<TagGroupTranslations>` |  |

### TagGroupNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `disabled` | `boolean` |  |
| `deletable` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `TagGroupValueChangeDetails` |
| `item-delete` | `TagGroupItemDeleteDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTagGroupRoot` | `default` | `TagGroupRootSlotProps` |
| `XhTagGroupRoot` | `label` | — |
| `XhTagGroupRoot` | `item` | `TagGroupNodeMeta` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTagGroupItem` | `value` | `string` | Yes |
| `XhTagGroupItem` | `disabled` | `boolean` |  |
| `XhTagGroupItem` | `deletable` | `boolean` |  |
| `XhTagGroupRoot` | `label` | `ReactNode` |  |
| `XhTagGroupRoot` | `renderItem` | `(node: TagGroupNodeMeta) => ReactNode` |  |
| `XhTagGroupRoot` | `children` | `SlotChildren<TagGroupRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `ITEM.SELECT` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `ITEM.DELETE` · `LIST.BLUR` · `PRESS.START` · `PRESS.END` · `LIST.TRACKED`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string[]` |
| `collection` | `readonly TagGroupNodeMeta[]` |
| `selectionMode` | `TagGroupSelectionMode` |
| `focusedValue` | `string \| null` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `required` | `boolean` |
| `deletable` | `boolean` |
| `isSelected` | `(value: string) => boolean` |
| `setValue` | `(next: string[]) => void` |
| `select` | `(value: string) => void` |
| `toggle` | `(value: string) => void` |
| `deleteItem` | `(value: string) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getListProps` | `() => T['element']` |
| `getItemProps` | `(props: TagGroupItemProps) => T['element']` |
| `getCellProps` | `(props: TagGroupItemProps) => T['element']` |
| `getItemIndicatorProps` | `(props: TagGroupItemProps) => T['element']` |
| `getItemTextProps` | `(props: TagGroupItemProps) => T['element']` |
| `getItemDeleteTriggerProps` | `(props: TagGroupItemProps) => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `tag-group.kbd.tab` |
| `ArrowRight` | `tag-group.kbd.next` |
| `ArrowLeft` | `tag-group.kbd.prev` |
| `Home` | `tag-group.kbd.first` |
| `End` | `tag-group.kbd.last` |
| `Enter` / `Space` | `tag-group.kbd.select` |
| `Enter` / `Space` | `tag-group.kbd.toggle` |
| `Ctrl+A` / `Cmd+A` | `tag-group.kbd.select-all` |
| `Delete` / `Backspace` | `tag-group.kbd.delete` |
| any single printable character | `tag-group.kbd.typeahead` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-invalid` | 'true' \| 'false' |
| `list` | `aria-label` | props.ariaLabel |
| `list` | `aria-labelledby` | id of the `label` part \| undefined |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `aria-readonly` | 'true' \| 'false' |
| `list` | `role` | 'grid' |
| `cell` | `role` | 'gridcell' |
| `item-indicator` | `aria-hidden` | 'true' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' \| undefined |
| `item` | `role` | 'row' |

## Style reference

### Skin

`@xihan-ui/styles/tag-group.css` is written against `[data-scope="tag-group"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-tag-group` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `list` | `data-disabled` | '' (present only while the condition holds) |
| `list` | `data-instant` | '' (present only while the condition holds) |
| `list` | `data-invalid` | '' (present only while the condition holds) |
| `list` | `data-orientation` | props.orientation |
| `list` | `data-required` | '' (present only while the condition holds) |
| `cell` | `data-disabled` | '' (present only while the condition holds) |
| `cell` | `data-highlighted` | '' (present only while the condition holds) |
| `cell` | `data-selected` | '' (present only while the condition holds) |
| `item-indicator` | `data-disabled` | '' (present only while the condition holds) |
| `item-indicator` | `data-highlighted` | '' (present only while the condition holds) |
| `item-indicator` | `data-selected` | '' (present only while the condition holds) |
| `item` | `data-deletable` | '' (present only while the condition holds) |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-selectable` | '' (present only while the condition holds) |
| `item` | `data-selected` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-tag-group-gap` | `root` | `gap` | `default` | `--xh-space-2` |
| `--xh-tag-group-item-bg-hover` | `list`<br>`root` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])`<br>`not([data-tone])`<br>`not([data-variant='solid'])`<br>`tone`<br>`variant=ghost`<br>`variant=solid` | `--xh-_tone-subtle-hover`<br>`--xh-bg-subtle`<br>`--xh-bg-subtle-hover` |
| `--xh-tag-group-item-bg-pressed` | `list`<br>`root` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-tone])`<br>`not([data-variant='solid'])`<br>`pressed`<br>`selectable`<br>`tone`<br>`variant=ghost`<br>`variant=solid` | `--xh-_tone-subtle-active`<br>`--xh-bg-subtle-active`<br>`--xh-bg-subtle-hover` |
| `--xh-tag-group-item-bg-pressed-solid` | `list`<br>`root` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`pressed`<br>`selectable`<br>`tone`<br>`variant=solid` | `--xh-_tone-active`<br>`--xh-bg-brand-active` |
| `--xh-tag-group-item-border-invalid` | `list`<br>`root` | `--xh-tag-border` | `invalid` | `--xh-border-invalid` |
| `--xh-tag-group-item-indicator-fg` | `item-indicator`<br>`root` | `color` | `default`<br>`variant=solid` | `--xh-_tone-fg`<br>`currentColor` |
| `--xh-tag-group-item-indicator-size` | `item-indicator` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` |
| `--xh-tag-group-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tag-group-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-tag-group-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-tag-group-list-gap` | `list` | `gap` | `default` | `--xh-space-2` |
