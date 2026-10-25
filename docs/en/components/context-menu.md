# ContextMenu

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/context-menu).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/context-menu" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/context-menu.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/context-menu" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/context-menu" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/context-menu.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="context-menu"`: `root` · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-icon` · `item-text` · `item-description` · `item-shortcut` · `item-suffix` · `item-indicator` · `separator` · `group` · `group-label` · `arrow`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-context-menu>` |
| Vue components | `XhContextMenuArrow` `XhContextMenuCheckboxItem` `XhContextMenuContent` `XhContextMenuGroup` `XhContextMenuGroupLabel` `XhContextMenuItem` `XhContextMenuItemDescription` `XhContextMenuItemIcon` `XhContextMenuItemIndicator` `XhContextMenuItemShortcut` `XhContextMenuItemSuffix` `XhContextMenuItemText` `XhContextMenuPositioner` `XhContextMenuRadioGroup` `XhContextMenuRadioItem` `XhContextMenuRoot` `XhContextMenuSeparator` `XhContextMenuSub` `XhContextMenuSubTrigger` `XhContextMenuTrigger` |
| Composable | `useContextMenu` |
| State machine | `contextMenuMachine` |
| Skin | `@xihan-ui/styles/context-menu.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `ContextMenuNode[]` |  |
| `checkboxValue` | `string[]` |  |
| `defaultCheckboxValue` | `string[]` |  |
| `radioValue` | `MenuRadioValue` |  |
| `defaultRadioValue` | `MenuRadioValue` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `placement` | `Placement` |  |
| `offset` | `number` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `typeahead` | `boolean` |  |
| `translations` | `Partial<ContextMenuTranslations>` |  |
| `longPressDelay` | `number` |  |
| `disabled` | `boolean` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onOpenChange` | `(details: ContextMenuOpenChangeDetails) => void` |  |
| `onItemSelect` | `(details: ContextMenuItemSelectDetails) => void` |  |
| `onCheckboxValueChange` | `(details: MenuCheckboxValueChangeDetails) => void` |  |
| `onRadioValueChange` | `(details: MenuRadioValueChangeDetails) => void` |  |

### ContextMenuNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `kind` | `MenuChoiceKind` |  |
| `label` | `string` |  |
| `disabled` | `boolean` |  |
| `tone` | `Tone` |  |
| `icon` | `IconRecord` |  |
| `description` | `string` |  |
| `shortcut` | `string` |  |
| `keyshortcuts` | `string` |  |
| `group` | `string` |  |
| `groupLabel` | `string` |  |
| `separatorBefore` | `boolean` |  |
| `closeOnSelect` | `boolean` |  |
| `children` | `MenuNode[]` |  |
| `checkboxValue` | `string[]` |  |
| `radioValue` | `MenuRadioValue` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `ContextMenuOpenChangeDetails` |
| `item-select` | `ContextMenuItemSelectDetails` |
| `checkbox-value-change` | `ContextMenuCheckboxValueChangeDetails` |
| `radio-value-change` | `ContextMenuRadioValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhContextMenuRoot` | `default` | `ContextMenuRootSlotProps` |
| `XhContextMenuRoot` | `trigger` | — |
| `XhContextMenuRoot` | `item` | `ContextMenuNodeMeta` |
| `XhContextMenuRoot` | `item-prefix` | `ContextMenuNodeMeta` |
| `XhContextMenuRoot` | `item-suffix` | `ContextMenuNodeMeta` |
| `XhContextMenuSub` | `default` | `ContextMenuSubSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhContextMenuGroup` | `value` | `string` | Yes |
| `XhContextMenuItem` | `value` | `string` | Yes |
| `XhContextMenuItem` | `disabled` | `boolean` |  |
| `XhContextMenuPositioner` | `container` | `() => Element \| null` |  |
| `XhContextMenuRadioGroup` | `value` | `string` | Yes |
| `XhContextMenuRoot` | `trigger` | `ReactNode` |  |
| `XhContextMenuRoot` | `renderItem` | `(node: ContextMenuNodeMeta) => ReactNode` |  |
| `XhContextMenuRoot` | `renderItemPrefix` | `(node: ContextMenuNodeMeta) => ReactNode` |  |
| `XhContextMenuRoot` | `renderItemSuffix` | `(node: ContextMenuNodeMeta) => ReactNode` |  |
| `XhContextMenuRoot` | `children` | `SlotChildren<ContextMenuRootSlotProps>` |  |
| `XhContextMenuSub` | `value` | `string` | Yes |
| `XhContextMenuSub` | `label` | `string` |  |
| `XhContextMenuSub` | `icon` | `IconRecord` |  |
| `XhContextMenuSub` | `disabled` | `boolean` |  |
| `XhContextMenuSub` | `collection` | `MenuNode[]` |  |
| `XhContextMenuSub` | `checkboxValue` | `string[]` |  |
| `XhContextMenuSub` | `defaultCheckboxValue` | `string[]` |  |
| `XhContextMenuSub` | `radioValue` | `ContextMenuRadioValue` |  |
| `XhContextMenuSub` | `defaultRadioValue` | `ContextMenuRadioValue` |  |
| `XhContextMenuSub` | `placement` | `Placement` |  |
| `XhContextMenuSub` | `offset` | `number` |  |
| `XhContextMenuSub` | `loop` | `boolean` |  |
| `XhContextMenuSub` | `openOnHover` | `boolean` |  |
| `XhContextMenuSub` | `hoverOpenDelay` | `number` |  |
| `XhContextMenuSub` | `hoverCloseDelay` | `number` |  |
| `XhContextMenuSub` | `dir` | `Direction` |  |
| `XhContextMenuSub` | `tone` | `Tone` |  |
| `XhContextMenuSub` | `size` | `Size` |  |
| `XhContextMenuSub` | `onCheckboxValueChange` | `MenuSchema['props']['onCheckboxValueChange']` |  |
| `XhContextMenuSub` | `onRadioValueChange` | `MenuSchema['props']['onRadioValueChange']` |  |
| `XhContextMenuSub` | `children` | `SlotChildren<ContextMenuSubSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `item-indicator` | 'checked' \| 'unchecked' \| 'checked' \| 'unchecked' \| undefined |

The following names are internal to the state machine.

**States**: `closed` · `pressing` · `open`

**Events**: `CONTEXT.MENU` · `OPEN` · `CLOSE` · `PRESS.START` · `PRESS.MOVE` · `PRESS.END` · `after.longPressDelay` · `ITEM.PRESS.START` · `ITEM.PRESS.END` · `CHECKBOX.VALUE.SET` · `RADIO.VALUE.SET` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `ITEM.LOST` · `ITEM.SELECT`

**Guards**: `isOpenControlled` · `movedBeyondTolerance` · `canPressItem` · `keepsMenuOpen` · `isDisabled`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `disabled` | `boolean` |
| `collection` | `readonly ContextMenuNodeMeta[]` |
| `pressing` | `boolean` |
| `point` | `ContextMenuPoint \| null` |
| `focusedValue` | `string \| null` |
| `checkboxValue` | `readonly string[]` |
| `radioValue` | `Readonly<MenuRadioValue>` |
| `isCheckboxItemChecked` | `(value: string) => boolean` |
| `isRadioItemChecked` | `(group: string, value: string) => boolean` |
| `setCheckboxValue` | `(next: string[]) => void` |
| `setRadioValue` | `(next: MenuRadioValue) => void` |
| `setOpen` | `(next: boolean) => void` |
| `openAt` | `(x: number, y: number) => void` |
| `getRootProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['element']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getItemProps` | `(props: ContextMenuItemProps) => T['element']` |
| `getCheckboxItemProps` | `(props: ContextMenuCheckboxItemProps) => T['element']` |
| `getRadioItemProps` | `(props: ContextMenuRadioItemProps) => T['element']` |
| `getItemIconProps` | `(props: ContextMenuAnyItemProps) => T['element']` |
| `getItemTextProps` | `(props: ContextMenuAnyItemProps) => T['element']` |
| `getItemIndicatorProps` | `(props: ContextMenuAnyItemProps) => T['element']` |
| `getItemDescriptionProps` | `(props: ContextMenuAnyItemProps) => T['element']` |
| `getItemShortcutProps` | `(props: ContextMenuAnyItemProps) => T['element']` |
| `getItemSuffixProps` | `(props: ContextMenuAnyItemProps) => T['element']` |
| `getSeparatorProps` | `() => T['element']` |
| `getGroupProps` | `(props: ContextMenuGroupProps) => T['element']` |
| `getRadioGroupProps` | `(props: ContextMenuGroupProps) => T['element']` |
| `getGroupLabelProps` | `(props: ContextMenuGroupProps) => T['element']` |
| `getArrowProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ContextMenu` / `Shift+F10` | `context-menu.kbd.open` |
| `ArrowDown` | `context-menu.kbd.next` |
| `ArrowUp` | `context-menu.kbd.prev` |
| `Home` | `context-menu.kbd.first` |
| `End` | `context-menu.kbd.last` |
| any single printable character | `context-menu.kbd.typeahead` |
| `Enter` / `Space` | `context-menu.kbd.select` |
| `Enter` / `Space` | `context-menu.kbd.press` |
| `Escape` | `context-menu.kbd.escape` |
| `Tab` / `Shift+Tab` | `context-menu.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | undefined \| id of the `content` part |
| `trigger` | `aria-haspopup` | undefined \| 'menu' |
| `trigger` | `aria-keyshortcuts` | undefined \| 'Shift+F10' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | translations.content |
| `content` | `role` | 'menu' |
| `item-icon` | `aria-hidden` | 'true' |
| `item-shortcut` | `aria-hidden` | 'true' |
| `item-indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-orientation` | 'horizontal' |
| `separator` | `role` | 'separator' |
| `group` | `aria-labelledby` | id of the `group-label` part |
| `group` | `role` | 'group' |
| `arrow` | `aria-hidden` | 'true' |
| `radio-group` | `aria-labelledby` | id of the `group-label` part |
| `radio-group` | `role` | 'group' |

## Style reference

### Skin

`@xihan-ui/styles/context-menu.css` is written against `[data-scope="context-menu"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-context-menu` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-pressing` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-placement` | actual placement computed by the positioning engine |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-xh-material` | 'frosted' |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item-icon` | `data-disabled` | '' (present only while the condition holds) |
| `item-icon` | `data-highlighted` | '' (present only while the condition holds) |
| `item-icon` | `data-xh-collection-slot` | 'icon' |
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
| `item-indicator` | `data-disabled` | '' (present only while the condition holds) |
| `item-indicator` | `data-highlighted` | '' (present only while the condition holds) |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' \| 'checked' \| 'unchecked' \| undefined |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `item-indicator` | `data-xh-menu-choice-indicator` | item.kind \| undefined |
| `separator` | `data-xh-collection-separator` | '' |
| `arrow` | `data-placement` | actual placement computed by the positioning engine |
| `radio-group` | `data-value` | group.value |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-context-menu-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` |
| `--xh-context-menu-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` |
| `--xh-context-menu-border` | `arrow`<br>`content` | `border` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border`<br>`--xh-material-frosted-border` |
| `--xh-context-menu-content-bg` | `arrow`<br>`content` | `background` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg`<br>`--xh-material-frosted-bg` |
| `--xh-context-menu-content-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-context-menu-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-context-menu-content-px` | `content` | `padding-inline` | `default` | `0` |
| `--xh-context-menu-content-py` | `content` | `padding-block` | `default` | `--xh-surface-pad-xs` |
| `--xh-context-menu-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-context-menu-content-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-context-menu-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-context-menu-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-context-menu-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-context-menu-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-regular` |
| `--xh-context-menu-group-label-mt` | `group-label` | `margin-block-start` | `default` | `--xh-space-2` |
| `--xh-context-menu-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_context-menu-item-px` |
| `--xh-context-menu-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-context-menu-highlight` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-highlight` |
| `--xh-context-menu-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-context-menu-item-bg-active` | `item` | `background-color` | `in-path` | `--xh-bg-subtle` |
| `--xh-context-menu-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` |
| `--xh-context-menu-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-context-menu-item-description-fg` | `item-description` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-context-menu-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-control-caption-md` |
| `--xh-context-menu-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-material-frosted-fg` |
| `--xh-context-menu-item-font-size` | `item` | `font-size` | `default` | `--xh-_context-menu-font-size` |
| `--xh-context-menu-item-gap` | `item` | `gap` | `default` | `--xh-_context-menu-item-gap` |
| `--xh-context-menu-item-h` | `item` | `min-block-size` | `default` | `--xh-_context-menu-item-h` |
| `--xh-context-menu-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone` |
| `--xh-context-menu-item-indicator-size` | `content`<br>`group`<br>`item`<br>`item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default`<br>`has(> [data-scope='context-menu'][data-part='item'] > [data-xh-menu-choice-indicator], > [data-scope='context-menu'][data-part='group'] > [data-scope='context-menu'][data-part='item'] > [data-xh-menu-choice-indicator])`<br>`not([aria-haspopup='menu'], [aria-checked])`<br>`xh-menu-choice-indicator` | `--xh-control-indicator-size` |
| `--xh-context-menu-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-context-menu-item-px` | `item` | `padding-inline` | `default` | `--xh-_context-menu-item-px` |
| `--xh-context-menu-item-py` | `item` | `padding-block` | `default` | `--xh-_context-menu-item-py` |
| `--xh-context-menu-item-radius` | `item` | `border-radius` | `default` | `0` |
| `--xh-context-menu-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-context-menu-max-h` | `content` | `max-block-size` | `default` | `--xh-_context-menu-max-h` |
| `--xh-context-menu-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` |
| `--xh-context-menu-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` |
| `--xh-context-menu-separator-color` | `separator` | `background` | `default` | `--xh-material-frosted-separator` |
| `--xh-context-menu-separator-my` | `separator` | `margin-block` | `default` | `--xh-space-0_5` |
| `--xh-context-menu-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-context-menu-separator-thickness` | `separator` | `block-size` | `default` | `--xh-stroke-thin` |
| `--xh-context-menu-submenu-indicator-fg` | `item` | `background-color` | `default` | `currentColor` |
| `--xh-context-menu-submenu-indicator-size` | `item` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-context-menu-trigger-bg-pressing` | `trigger` | `background` | `pressing` | `--xh-bg-subtle` |
