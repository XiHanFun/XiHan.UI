# Listbox

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/listbox).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/listbox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/listbox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/listbox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/listbox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/listbox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="listbox"`: `root` · `label` · **`content`** · `item` · `item-prefix` · `item-text` · `item-description` · `item-suffix` · `item-indicator` · `group` · `group-label` · `empty` · `loading` · `load-more-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-listbox>` |
| Vue components | `XhListboxContent` `XhListboxEmpty` `XhListboxGroup` `XhListboxGroupLabel` `XhListboxItem` `XhListboxItemDescription` `XhListboxItemIndicator` `XhListboxItemPrefix` `XhListboxItemSuffix` `XhListboxItemText` `XhListboxLabel` `XhListboxLoadMoreTrigger` `XhListboxLoading` `XhListboxRoot` |
| Composable | `useListbox` |
| State machine | `listboxMachine` |
| Skin | `@xihan-ui/styles/listbox.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `collection` | `ListboxNode<V>[]` |  |
| `valueKey` | `SelectionValueKey<V>` |  |
| `virtualizer` | `CollectionVirtualizer` |  |
| `value` | `V \| V[]` |  |
| `defaultValue` | `V \| V[]` |  |
| `selectionMode` | `ListboxSelectionMode` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `loading` | `boolean` |  |
| `invalid` | `boolean` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `orientation` | `Orientation` |  |
| `typeahead` | `boolean` |  |
| `translations` | `Partial<ListboxTranslations>` |  |
| `onValueChange` | `(details: ListboxValueChangeDetails<V>) => void` |  |

### ListboxNode

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
| `value-change` | `ListboxValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhListboxRoot` | `default` | `ListboxRootSlotProps<V>` |
| `XhListboxRoot` | `label` | — |
| `XhListboxRoot` | `empty` | — |
| `XhListboxRoot` | `item` | `ListboxNodeMeta<V>` |
| `XhListboxRoot` | `item-prefix` | `ListboxNodeMeta<V>` |
| `XhListboxRoot` | `item-suffix` | `ListboxNodeMeta<V>` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhListboxGroup` | `value` | `string` | Yes |
| `XhListboxItem` | `value` | `unknown` | Yes |
| `XhListboxItem` | `disabled` | `boolean` |  |
| `XhListboxRoot` | `label` | `ReactNode` |  |
| `XhListboxRoot` | `empty` | `ReactNode` |  |
| `XhListboxRoot` | `renderItem` | `(node: ListboxNodeMeta<V>) => ReactNode` |  |
| `XhListboxRoot` | `renderItemPrefix` | `(node: ListboxNodeMeta<V>) => ReactNode` |  |
| `XhListboxRoot` | `renderItemSuffix` | `(node: ListboxNodeMeta<V>) => ReactNode` |  |
| `XhListboxRoot` | `children` | `SlotChildren<ListboxRootSlotProps<V>>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `item-prefix` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `item-suffix` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `VALUE.CLEAR` · `ITEM.SELECT` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `LIST.BLUR` · `PRESS.START` · `PRESS.END`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `V[]` |
| `valueKeys` | `string[]` |
| `collection` | `readonly ListboxNodeMeta<V>[]` |
| `selectionMode` | `ListboxSelectionMode` |
| `focusedValue` | `V \| null` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `loading` | `boolean` |
| `translations` | `ListboxTranslations` |
| `isSelected` | `(value: V) => boolean` |
| `setValue` | `(next: V[]) => void` |
| `select` | `(value: V) => void` |
| `toggle` | `(value: V) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getLoadingProps` | `() => T['element']` |
| `getLoadMoreTriggerProps` | `() => T['element']` |
| `getGroupProps` | `(props: ListboxGroupProps) => T['element']` |
| `getGroupLabelProps` | `(props: ListboxGroupProps) => T['element']` |
| `getItemProps` | `(props: ListboxItemProps<V>) => T['element']` |
| `getItemPrefixProps` | `(props: ListboxItemProps<V>) => T['element']` |
| `getItemTextProps` | `(props: ListboxItemProps<V>) => T['element']` |
| `getItemDescriptionProps` | `(props: ListboxItemProps<V>) => T['element']` |
| `getItemSuffixProps` | `(props: ListboxItemProps<V>) => T['element']` |
| `getItemIndicatorProps` | `(props: ListboxItemProps<V>) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `listbox.kbd.tab` |
| `ArrowDown` | `listbox.kbd.next` |
| `ArrowUp` | `listbox.kbd.prev` |
| `Home` | `listbox.kbd.first` |
| `End` | `listbox.kbd.last` |
| `Enter` / `Space` | `listbox.kbd.select` |
| `Space` / `Enter` / `Ctrl+Space` | `listbox.kbd.toggle` |
| `Shift+ArrowDown` / `Shift+ArrowUp` | `listbox.kbd.extend` |
| `Ctrl+A` / `Cmd+A` | `listbox.kbd.select-all` |
| `Enter` / `Space` | `listbox.kbd.press` |
| any single printable character | `listbox.kbd.typeahead` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-disabled` | 'true' \| 'false' |
| `content` | `aria-invalid` | 'true' \| 'false' |
| `content` | `aria-label` | props.ariaLabel |
| `content` | `aria-labelledby` | id of the `label` part \| undefined |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `aria-orientation` | props.orientation |
| `content` | `aria-readonly` | 'true' \| 'false' |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-prefix` | `aria-hidden` | 'true' |
| `item-indicator` | `aria-hidden` | 'true' |
| `group` | `aria-labelledby` | id of the `group-label` part |
| `group` | `role` | 'group' |

## Style reference

### Skin

`@xihan-ui/styles/listbox.css` is written against `[data-scope="listbox"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-listbox` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `content` | `data-disabled` | '' (present only while the condition holds) |
| `content` | `data-invalid` | '' (present only while the condition holds) |
| `content` | `data-orientation` | props.orientation |
| `content` | `data-readonly` | '' (present only while the condition holds) |
| `content` | `data-xh-virtualized` | '' (present only while the condition holds) |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-tone` | metaOf.get(item.value)?.tone |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-prefix` | `data-disabled` | '' (present only while the condition holds) |
| `item-prefix` | `data-highlighted` | '' (present only while the condition holds) |
| `item-prefix` | `data-state` | 'checked' \| 'unchecked' |
| `item-prefix` | `data-xh-collection-slot` | 'prefix' |
| `item-text` | `data-disabled` | '' (present only while the condition holds) |
| `item-text` | `data-highlighted` | '' (present only while the condition holds) |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-description` | `data-disabled` | '' (present only while the condition holds) |
| `item-description` | `data-highlighted` | '' (present only while the condition holds) |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-suffix` | `data-disabled` | '' (present only while the condition holds) |
| `item-suffix` | `data-highlighted` | '' (present only while the condition holds) |
| `item-suffix` | `data-state` | 'checked' \| 'unchecked' |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `item-indicator` | `data-disabled` | '' (present only while the condition holds) |
| `item-indicator` | `data-highlighted` | '' (present only while the condition holds) |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `group` | `data-disabled` | '' (present only while the condition holds) |
| `group-label` | `data-disabled` | '' (present only while the condition holds) |
| `empty` | `data-disabled` | '' (present only while the condition holds) |
| `loading` | `data-disabled` | '' (present only while the condition holds) |
| `loading` | `data-loading` | '' (present only while the condition holds) |
| `loading` | `data-xh-loading-ring` | '' |
| `load-more-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `load-more-trigger` | `data-loading` | '' (present only while the condition holds) |
| `load-more-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `load-more-trigger` | `data-xh-action-control` | '' |
| `load-more-trigger` | `data-xh-action-display` | 'always' |
| `load-more-trigger` | `data-xh-action-profile` | 'row' |
| `load-more-trigger` | `data-xh-action-size` | props.size |
| `load-more-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-listbox-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` |
| `--xh-listbox-content-border` | `content` | `border` | `default` | `--xh-border-default` |
| `--xh-listbox-content-border-invalid` | `content` | `border-color` | `invalid` | `--xh-border-invalid` |
| `--xh-listbox-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-listbox-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-listbox-content-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-md` |
| `--xh-listbox-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-listbox-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-listbox-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-listbox-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` |
| `--xh-listbox-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_listbox-font-size` |
| `--xh-listbox-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_listbox-item-px` |
| `--xh-listbox-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-listbox-gap` | `root` | `gap` | `default` | `--xh-space-2` |
| `--xh-listbox-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-listbox-group-label-fg` | `group-label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-listbox-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-listbox-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-listbox-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_listbox-item-px` |
| `--xh-listbox-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-listbox-group-spacing` | `group` | `margin-block-start` | `has([data-scope='listbox'][data-part='item']:not([hidden])`<br>`not([data-scope='listbox'][data-part='content'] [hidden] *)` | `--xh-space-1_5` |
| `--xh-listbox-icon-size` | `item`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-_collection-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-listbox-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-listbox-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-listbox-item-check-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-listbox-item-indicator-fg` |
| `--xh-listbox-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-default` |
| `--xh-listbox-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-listbox-item-fg` |
| `--xh-listbox-item-font-size` | `item` | `font-size` | `default` | `--xh-_listbox-font-size` |
| `--xh-listbox-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-medium` |
| `--xh-listbox-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `default`<br>`xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_listbox-gap` |
| `--xh-listbox-item-indicator-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-_listbox-accent` |
| `--xh-listbox-item-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-listbox-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-listbox-item-px` | `item` | `padding-inline` | `default` | `--xh-_listbox-item-px` |
| `--xh-listbox-item-py` | `item` | `padding-block` | `default` | `--xh-_listbox-item-py` |
| `--xh-listbox-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-listbox-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-listbox-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-listbox-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-listbox-load-more-trigger-bg-hover` | `load-more-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-listbox-load-more-trigger-fg` | `load-more-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_tone-fg` |
| `--xh-listbox-load-more-trigger-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-_listbox-font-size` |
| `--xh-listbox-load-more-trigger-gap` | `load-more-trigger` | `gap` | `default` | `--xh-_listbox-gap` |
| `--xh-listbox-load-more-trigger-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-_listbox-item-px` |
| `--xh-listbox-load-more-trigger-py` | `load-more-trigger` | `padding-block` | `xh-action-profile=row` | `--xh-_listbox-item-py` |
| `--xh-listbox-load-more-trigger-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-listbox-loading-fg` | `loading` | `color` | `default` | `--xh-fg-muted` |
| `--xh-listbox-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_listbox-font-size` |
| `--xh-listbox-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_listbox-item-px` |
| `--xh-listbox-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` |
