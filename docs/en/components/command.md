# Command

Overlays component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/command).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/command" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/command.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/command" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/command" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/command.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="command"`: `trigger` · `backdrop` · `positioner` · **`content`** · **`input`** · **`list`** · `group` · `group-label` · `item` · `item-prefix` · `item-text` · `item-description` · `item-shortcut` · `item-suffix` · `empty` · `loading` · `footer`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-command>` |
| Vue components | `XhCommandContent` `XhCommandEmpty` `XhCommandFooter` `XhCommandGroup` `XhCommandGroupLabel` `XhCommandInput` `XhCommandItem` `XhCommandItemDescription` `XhCommandItemPrefix` `XhCommandItemShortcut` `XhCommandItemSuffix` `XhCommandItemText` `XhCommandList` `XhCommandLoading` `XhCommandRoot` `XhCommandTrigger` |
| Composable | `useCommand` |
| State machine | `commandMachine` |
| Skin | `@xihan-ui/styles/command.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `readonly CommandNode[]` |  |
| `groups` | `readonly CommandGroup[]` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `inputValue` | `string` |  |
| `defaultInputValue` | `string` |  |
| `filter` | `boolean` |  |
| `caseSensitive` | `boolean` |  |
| `closeOnSelect` | `boolean` |  |
| `modal` | `boolean` |  |
| `closeOnEscape` | `boolean` |  |
| `closeOnInteractOutside` | `boolean` |  |
| `restoreFocus` | `boolean` |  |
| `loop` | `boolean` |  |
| `loading` | `boolean` |  |
| `placeholder` | `string` |  |
| `dir` | `Direction` |  |
| `size` | `Size` |  |
| `variant` | `OverlayBackdropVariant` |  |
| `translations` | `Partial<CommandTranslations>` |  |
| `onOpenChange` | `(details: CommandOpenChangeDetails) => void` |  |
| `onInputValueChange` | `(details: CommandInputValueChangeDetails) => void` |  |
| `onItemSelect` | `(details: CommandItemSelectDetails) => void` |  |

### CommandNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `keywords` | `readonly string[]` |  |
| `group` | `string` |  |
| `disabled` | `boolean` |  |
| `tone` | `Tone` |  |
| `description` | `string` |  |
| `shortcut` | `string` |  |

### CommandGroup

Elements of `groups`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `CommandOpenChangeDetails` |
| `input-value-change` | `CommandInputValueChangeDetails` |
| `item-select` | `CommandItemSelectDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhCommandRoot` | `default` | `CommandRootSlotProps` |
| `XhCommandRoot` | `trigger` | — |
| `XhCommandRoot` | `item` | `CommandNodeMeta` |
| `XhCommandRoot` | `item-prefix` | `CommandNodeMeta` |
| `XhCommandRoot` | `item-suffix` | `CommandNodeMeta` |
| `XhCommandRoot` | `empty` | — |
| `XhCommandRoot` | `footer` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhCommandContent` | `container` | `() => Element \| null` |  |
| `XhCommandGroup` | `value` | `string` | Yes |
| `XhCommandItem` | `value` | `string` | Yes |
| `XhCommandItem` | `disabled` | `boolean` |  |
| `XhCommandRoot` | `empty` | `ReactNode` |  |
| `XhCommandRoot` | `trigger` | `ReactNode` |  |
| `XhCommandRoot` | `footer` | `ReactNode` |  |
| `XhCommandRoot` | `renderItem` | `(node: CommandNodeMeta) => ReactNode` |  |
| `XhCommandRoot` | `renderItemPrefix` | `(node: CommandNodeMeta) => ReactNode` |  |
| `XhCommandRoot` | `renderItemSuffix` | `(node: CommandNodeMeta) => ReactNode` |  |
| `XhCommandRoot` | `children` | `SlotChildren<CommandRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `list` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |
| `footer` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `INPUT.CHANGE` · `INPUT.SET` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.SELECT` · `PRESS.START` · `PRESS.END` · `ARRIVALS.TRACKED`

**Guards**: `isOpenControlled` · `keepsOpenOnSelect` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `inputValue` | `string` |
| `groups` | `readonly CommandGroupMeta[]` |
| `results` | `readonly CommandNodeMeta[]` |
| `highlightedValue` | `string \| null` |
| `empty` | `boolean` |
| `loading` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `setInputValue` | `(next: string) => void` |
| `select` | `(value: string) => void` |
| `getTriggerProps` | `() => T['button']` |
| `getBackdropProps` | `() => T['element']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getInputProps` | `() => T['input']` |
| `getListProps` | `() => T['element']` |
| `getGroupProps` | `(props: CommandGroupProps) => T['element']` |
| `getGroupLabelProps` | `(props: CommandGroupProps) => T['element']` |
| `getItemProps` | `(props: CommandItemProps) => T['element']` |
| `getItemPrefixProps` | `(props: CommandItemProps) => T['element']` |
| `getItemTextProps` | `(props: CommandItemProps) => T['element']` |
| `getItemDescriptionProps` | `(props: CommandItemProps) => T['element']` |
| `getItemShortcutProps` | `(props: CommandItemProps) => T['element']` |
| `getItemSuffixProps` | `(props: CommandItemProps) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getLoadingProps` | `() => T['element']` |
| `getFooterProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `command.kbd.open-on-trigger` |
| `Escape` | `command.kbd.escape` |
| `ArrowDown` | `command.kbd.next` |
| `ArrowUp` | `command.kbd.prev` |
| `Home` | `command.kbd.first` |
| `End` | `command.kbd.last` |
| `Enter` | `command.kbd.select` |
| `Enter` | `command.kbd.press` |
| `Tab` | `command.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | translations.title |
| `content` | `aria-modal` | 'true' \| 'false' |
| `content` | `role` | 'dialog' |
| `input` | `aria-activedescendant` | id of the `item` part \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | id of the `list` part |
| `input` | `aria-expanded` | 'true' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-label` | translations.input |
| `input` | `role` | 'combobox' |
| `list` | `aria-busy` | 'true' \| undefined |
| `list` | `aria-label` | translations.list |
| `list` | `role` | 'listbox' |
| `group` | `aria-labelledby` | id of the `group-label` part |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-prefix` | `aria-hidden` | 'true' |
| `item-shortcut` | `aria-hidden` | 'true' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/command.css` is written against `[data-scope="command"][data-part="trigger"]` part selectors; the published build uses the mount class `.xh-scope-command` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-instant` | '' (present only while the condition holds) |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `input` | `data-state` | 'open' \| 'closed' |
| `input` | `data-xh-field-input` | '' |
| `list` | `data-instant` | '' (present only while the condition holds) |
| `list` | `data-state` | 'open' \| 'closed' |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-tone` | metaOf.get(item.value)?.tone |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-prefix` | `data-disabled` | '' (present only while the condition holds) |
| `item-prefix` | `data-highlighted` | '' (present only while the condition holds) |
| `item-prefix` | `data-xh-collection-slot` | 'prefix' |
| `item-text` | `data-disabled` | '' (present only while the condition holds) |
| `item-text` | `data-highlighted` | '' (present only while the condition holds) |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-description` | `data-disabled` | '' (present only while the condition holds) |
| `item-description` | `data-highlighted` | '' (present only while the condition holds) |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-shortcut` | `data-disabled` | '' (present only while the condition holds) |
| `item-shortcut` | `data-highlighted` | '' (present only while the condition holds) |
| `item-shortcut` | `data-xh-collection-slot` | 'shortcut' |
| `item-suffix` | `data-disabled` | '' (present only while the condition holds) |
| `item-suffix` | `data-highlighted` | '' (present only while the condition holds) |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-loading` | '' (present only while the condition holds) |
| `loading` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-xh-loading-ring` | '' |
| `footer` | `data-state` | 'open' \| 'closed' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-command-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` |
| `--xh-command-backdrop-blur` | `backdrop` | `backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` |
| `--xh-command-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` |
| `--xh-command-bg` | `content` | `background` | `default` | `--xh-material-elevated-bg` |
| `--xh-command-border` | `content` | `border` | `default` | `--xh-material-elevated-border` |
| `--xh-command-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` |
| `--xh-command-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_command-font-size` |
| `--xh-command-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_command-px` |
| `--xh-command-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-command-fg` | `content` | `color` | `default` | `--xh-material-elevated-fg` |
| `--xh-command-footer-border` | `footer` | `border-block-start` | `default` | `--xh-material-elevated-border` |
| `--xh-command-footer-fg` | `footer` | `color` | `default` | `--xh-fg-muted` |
| `--xh-command-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-command-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` |
| `--xh-command-footer-px` | `footer` | `padding-inline` | `default` | `--xh-_command-px` |
| `--xh-command-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-command-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-command-group-label-fg` | `group-label` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-command-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-command-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-regular` |
| `--xh-command-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_command-px` |
| `--xh-command-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-command-group-spacing` | `group` | `margin-block-start` | `default` | `--xh-space-2` |
| `--xh-command-icon-size` | `content`<br>`positioner` | `--xh-icon-size` | `is([data-part='positioner'], [data-part='content'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-command-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-surface` |
| `--xh-command-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` |
| `--xh-command-input-border` | `input` | `border-block-end` | `default` | `--xh-material-elevated-border` |
| `--xh-command-input-fg` | `input` | `color` | `default` | `--xh-fg-default` |
| `--xh-command-input-font-size` | `input` | `font-size` | `default` | `--xh-_command-font-size` |
| `--xh-command-input-h` | `input` | `block-size` | `default` | `--xh-_command-input-h` |
| `--xh-command-input-px` | `input` | `padding-inline` | `default` | `--xh-_command-px` |
| `--xh-command-inset-block-start` | `positioner` | `padding-block-start` | `default` | `--xh-space-8` |
| `--xh-command-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-command-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-command-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-default` |
| `--xh-command-item-font-size` | `item` | `font-size` | `default` | `--xh-_command-font-size` |
| `--xh-command-item-gap` | `item` | `gap` | `default` | `--xh-_command-gap` |
| `--xh-command-item-h` | `item` | `min-block-size` | `default` | `--xh-_command-item-h` |
| `--xh-command-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-command-item-px` | `item` | `padding-inline` | `default` | `--xh-_command-px` |
| `--xh-command-item-py` | `item` | `padding-block` | `default` | `--xh-_command-item-py` |
| `--xh-command-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-command-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-command-list-gap` | `list` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-command-list-px` | `list` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-command-list-py` | `list` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-command-loading-fg` | `loading` | `color` | `default` | `--xh-fg-muted` |
| `--xh-command-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_command-font-size` |
| `--xh-command-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_command-px` |
| `--xh-command-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-command-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` |
| `--xh-command-max-w` | `content` | `max-inline-size` | `default` | `--xh-_command-max-w` |
| `--xh-command-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-command-positioner-pb` | `positioner` | `padding-block-end` | `default` | `--xh-space-4` |
| `--xh-command-positioner-px` | `positioner` | `padding-inline` | `default` | `--xh-space-4` |
| `--xh-command-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-command-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` |
