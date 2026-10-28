# Combobox

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/combobox).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/combobox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/combobox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/combobox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/combobox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/combobox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="combobox"`: `root` · `label` · **`control`** · `tag-list` · **`input`** · `trigger` · `clear-trigger` · `positioner` · **`content`** · `item` · `item-prefix` · `item-text` · `item-description` · `item-suffix` · `item-indicator` · `group` · `group-label` · `empty` · `loading` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-combobox>` |
| Vue components | `XhComboboxClearTrigger` `XhComboboxContent` `XhComboboxControl` `XhComboboxEmpty` `XhComboboxGroup` `XhComboboxGroupLabel` `XhComboboxHiddenInput` `XhComboboxInput` `XhComboboxItem` `XhComboboxItemDeleteTrigger` `XhComboboxItemDescription` `XhComboboxItemIndicator` `XhComboboxItemPrefix` `XhComboboxItemSuffix` `XhComboboxItemText` `XhComboboxLabel` `XhComboboxLoading` `XhComboboxOverflowTag` `XhComboboxPositioner` `XhComboboxRoot` `XhComboboxTag` `XhComboboxTagLabel` `XhComboboxTagList` `XhComboboxTrigger` |
| Composable | `useCombobox` |
| State machine | `comboboxMachine` |
| Skin | `@xihan-ui/styles/combobox.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `collection` | `ComboboxNode<V>[]` |  |
| `valueKey` | `SelectionValueKey<V>` |  |
| `filter` | `ComboboxFilterMode \| ComboboxFilter<V>` |  |
| `virtualizer` | `CollectionVirtualizer` |  |
| `value` | `V \| V[]` |  |
| `defaultValue` | `V \| V[]` |  |
| `inputValue` | `string` |  |
| `defaultInputValue` | `string` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `name` | `string` |  |
| `form` | `string` |  |
| `multiple` | `boolean` |  |
| `maxTagCount` | `number` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `loading` | `boolean` |  |
| `loop` | `boolean` |  |
| `placeholder` | `string` |  |
| `translations` | `Partial<ComboboxTranslations>` |  |
| `allowCustomValue` | `boolean` |  |
| `openOnClick` | `boolean` |  |
| `inputBehavior` | `ComboboxInputBehavior` |  |
| `placement` | `Placement` |  |
| `dir` | `Direction` |  |
| `offset` | `number` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onValueChange` | `(details: ComboboxValueChangeDetails<V>) => void` |  |
| `onClear` | `() => void` |  |
| `onInputValueChange` | `(details: ComboboxInputValueChangeDetails) => void` |  |
| `onOpenChange` | `(details: ComboboxOpenChangeDetails) => void` |  |

### ComboboxNode

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
| `value-change` | `ComboboxValueChangeDetails` |
| `clear` | `` |
| `input-value-change` | `ComboboxInputValueChangeDetails` |
| `open-change` | `ComboboxOpenChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhComboboxRoot` | `default` | `ComboboxRootSlotProps<V>` |
| `XhComboboxRoot` | `label` | — |
| `XhComboboxRoot` | `empty` | — |
| `XhComboboxRoot` | `item` | `ComboboxNodeMeta<V>` |
| `XhComboboxRoot` | `item-prefix` | `ComboboxNodeMeta<V>` |
| `XhComboboxRoot` | `item-suffix` | `ComboboxNodeMeta<V>` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhComboboxGroup` | `value` | `string` | Yes |
| `XhComboboxInput` | `as` | `ComboboxInputHost` |  |
| `XhComboboxItem` | `value` | `unknown` | Yes |
| `XhComboboxItem` | `disabled` | `boolean` |  |
| `XhComboboxPositioner` | `container` | `() => Element \| null` |  |
| `XhComboboxRoot` | `label` | `ReactNode` |  |
| `XhComboboxRoot` | `empty` | `ReactNode` |  |
| `XhComboboxRoot` | `clearable` | `boolean` |  |
| `XhComboboxRoot` | `renderItem` | `(node: ComboboxNodeMeta<V>) => ReactNode` |  |
| `XhComboboxRoot` | `renderItemPrefix` | `(node: ComboboxNodeMeta<V>) => ReactNode` |  |
| `XhComboboxRoot` | `renderItemSuffix` | `(node: ComboboxNodeMeta<V>) => ReactNode` |  |
| `XhComboboxRoot` | `children` | `SlotChildren<ComboboxRootSlotProps<V>>` |  |
| `XhComboboxTag` | `value` | `unknown` | Yes |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `item` | 'checked' \| 'unchecked' |
| `item-prefix` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `item-suffix` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ESCAPE` · `INPUT.CHANGE` · `INPUT.SET` · `INPUT.BLUR` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.SELECT` · `VALUE.COMMIT` · `VALUE.SET` · `VALUE.CLEAR` · `ITEMS.SYNC` · `FORM.RESET` · `PRESS.START` · `PRESS.END` · `TAG_LIST.TRACKED`

**Guards**: `isOpenControlled` · `isMultiple` · `hasHighlight` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `translations` | `ComboboxTranslations` |
| `collection` | `readonly ComboboxNodeMeta<V>[]` |
| `value` | `V[]` |
| `valueKeys` | `string[]` |
| `inputValue` | `string` |
| `valueText` | `string \| null` |
| `highlightedValue` | `V \| null` |
| `multiple` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `required` | `boolean` |
| `empty` | `boolean` |
| `canClear` | `boolean` |
| `tags` | `ComboboxTagMeta<V>[]` |
| `overflowCount` | `number` |
| `overflowText` | `string` |
| `isSelected` | `(value: V) => boolean` |
| `setOpen` | `(next: boolean) => void` |
| `setValue` | `(next: V[]) => void` |
| `setInputValue` | `(next: string) => void` |
| `clear` | `() => void` |
| `deselect` | `(value: V) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getTagListProps` | `() => T['element']` |
| `getTagProps` | `(props: ComboboxTagProps<V>) => T['element']` |
| `getTagLabelProps` | `() => T['element']` |
| `getOverflowTagProps` | `() => T['element']` |
| `getItemDeleteTriggerProps` | `(props: ComboboxTagProps<V>) => T['button']` |
| `getInputProps` | `(props?: ComboboxInputProps) => T['input']` |
| `getTriggerProps` | `() => T['button']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getGroupProps` | `(props: ComboboxGroupProps) => T['element']` |
| `getGroupLabelProps` | `(props: ComboboxGroupProps) => T['element']` |
| `getItemProps` | `(props: ComboboxItemProps<V>) => T['element']` |
| `getItemPrefixProps` | `(props: ComboboxItemProps<V>) => T['element']` |
| `getItemTextProps` | `(props: ComboboxItemProps<V>) => T['element']` |
| `getItemDescriptionProps` | `(props: ComboboxItemProps<V>) => T['element']` |
| `getItemSuffixProps` | `(props: ComboboxItemProps<V>) => T['element']` |
| `getItemIndicatorProps` | `(props: ComboboxItemProps<V>) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getLoadingProps` | `() => T['element']` |
| `getHiddenInputProps` | `(props?: { value: string }) => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowDown` | `combobox.kbd.open-first` |
| `ArrowUp` | `combobox.kbd.open-last` |
| `Alt+ArrowDown` | `combobox.kbd.open-quiet` |
| `ArrowDown` | `combobox.kbd.next` |
| `ArrowUp` | `combobox.kbd.prev` |
| `Home` | `combobox.kbd.first` |
| `End` | `combobox.kbd.last` |
| `Enter` | `combobox.kbd.select` |
| `Enter` | `combobox.kbd.press` |
| `Enter` | `combobox.kbd.custom` |
| `Escape` | `combobox.kbd.escape` |
| `Alt+ArrowUp` | `combobox.kbd.close-alt` |
| `Tab` / `Shift+Tab` | `combobox.kbd.tab` |
| `Backspace` | `combobox.kbd.remove-last` |
| printable characters | `combobox.kbd.type` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `input` | `aria-activedescendant` | id of the `item` part \| undefined |
| `input` | `aria-autocomplete` | 'both' \| 'list' |
| `input` | `aria-controls` | id of the `content` part |
| `input` | `aria-expanded` | undefined \| 'true' \| 'false' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.ariaLabel |
| `input` | `aria-labelledby` | id of the `label` part \| undefined |
| `input` | `aria-required` | 'true' \| 'false' |
| `input` | `role` | undefined \| 'combobox' |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-label` | translations.trigger |
| `clear-trigger` | `aria-label` | translations.clearTrigger |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | props.ariaLabel |
| `content` | `aria-labelledby` | id of the `label` part \| undefined |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-prefix` | `aria-hidden` | 'true' |
| `item-indicator` | `aria-hidden` | 'true' |
| `group` | `aria-labelledby` | id of the `group-label` part |
| `group` | `role` | 'group' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |
| `hidden-input` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/combobox.css` is written against `[data-scope="combobox"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-combobox` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `label` | `data-required` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-state` | 'open' \| 'closed' |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-action-owner` | '' |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `tag-list` | `data-disabled` | '' (present only while the condition holds) |
| `tag-list` | `data-instant` | '' (present only while the condition holds) |
| `tag-list` | `data-xh-tag-list` | '' |
| `input` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-invalid` | '' (present only while the condition holds) |
| `input` | `data-readonly` | '' (present only while the condition holds) |
| `input` | `data-state` | 'open' \| 'closed' |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'textarea' \| 'single-line' |
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
| `content` | `data-xh-material` | 'frosted' |
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
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-loading` | '' (present only while the condition holds) |
| `loading` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-xh-loading-ring` | '' |
| `overflow-tag` | `data-count` | String(overflowCount) |
| `tag` | `data-value` | v |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-combobox-action-bg` | `clear-trigger`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-combobox-action-bg-active` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-combobox-action-bg-hover` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-combobox-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-field-clear`<br>`--xh-fg-muted` |
| `--xh-combobox-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-combobox-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-combobox-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-circle`<br>`--xh-shape-inset` |
| `--xh-combobox-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-combobox-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` |
| `--xh-combobox-content-bg` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg` |
| `--xh-combobox-content-border` | `content` | `border` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border` |
| `--xh-combobox-content-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-combobox-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-combobox-content-highlight` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-highlight` |
| `--xh-combobox-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` |
| `--xh-combobox-content-max-w` | `content` | `max-inline-size` | `default` | `none` |
| `--xh-combobox-content-min-h` | `content` | `min-block-size` | `default` | `--xh-_combobox-h` |
| `--xh-combobox-content-min-w` | `content` | `inline-size` | `default` | `--xh-overlay-menu-min-w` |
| `--xh-combobox-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-combobox-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-combobox-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-combobox-content-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-combobox-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-combobox-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-combobox-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-combobox-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-combobox-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-combobox-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-combobox-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-combobox-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-combobox-control-fg` | `control`<br>`input` | `color` | `xh-field-chrome`<br>`xh-field-input` | `--xh-fg-default` |
| `--xh-combobox-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_combobox-gap` |
| `--xh-combobox-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_combobox-h` |
| `--xh-combobox-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-combobox-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_combobox-px` |
| `--xh-combobox-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-combobox-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-combobox-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-combobox-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-combobox-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_combobox-font-size` |
| `--xh-combobox-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_combobox-item-px` |
| `--xh-combobox-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-combobox-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-combobox-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-combobox-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-combobox-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-combobox-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-combobox-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_combobox-item-px` |
| `--xh-combobox-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-combobox-group-spacing` | `group` | `margin-block-start` | `default` | `--xh-space-1_5` |
| `--xh-combobox-icon-size` | `control`<br>`positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-combobox-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` |
| `--xh-combobox-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` |
| `--xh-combobox-input-fg` | `input` | `color` | `xh-field-input` | `--xh-combobox-control-fg` |
| `--xh-combobox-input-font-size` | `input` | `font-size` | `xh-field-input` | `--xh-_combobox-font-size` |
| `--xh-combobox-input-min-w` | `input` | `min-inline-size` | `default` | `--xh-control-input-min-w` |
| `--xh-combobox-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-combobox-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-combobox-item-check-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-combobox-item-indicator-fg` |
| `--xh-combobox-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` |
| `--xh-combobox-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-combobox-item-fg` |
| `--xh-combobox-item-font-size` | `item` | `font-size` | `default` | `--xh-_combobox-font-size` |
| `--xh-combobox-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-medium` |
| `--xh-combobox-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `default`<br>`xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_combobox-gap` |
| `--xh-combobox-item-h` | `item` | `min-block-size` | `default` | `--xh-_combobox-item-h` |
| `--xh-combobox-item-indicator-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-_combobox-accent` |
| `--xh-combobox-item-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-combobox-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-combobox-item-px` | `item` | `padding-inline` | `default` | `--xh-_combobox-item-px` |
| `--xh-combobox-item-py` | `item` | `padding-block` | `default` | `--xh-_combobox-item-py` |
| `--xh-combobox-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-combobox-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-combobox-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-combobox-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-combobox-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-combobox-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-combobox-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-combobox-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-combobox-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_combobox-font-size` |
| `--xh-combobox-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_combobox-item-px` |
| `--xh-combobox-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-combobox-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-combobox-tag-list-gap` | `tag-list` | `gap` | `xh-tag-list` | `--xh-space-1` |
