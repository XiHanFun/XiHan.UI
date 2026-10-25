# Menu

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/menu).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/menu" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/menu.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/menu" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/menu" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/menu.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="menu"`: `trigger` · `positioner` · **`content`** · **`item`** · `item-icon` · `item-text` · `item-description` · `item-shortcut` · `item-suffix` · `item-indicator` · `separator` · `group` · `group-label` · `arrow`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-menu>` |
| Vue components | `XhMenuArrow` `XhMenuCheckboxItem` `XhMenuContent` `XhMenuGroup` `XhMenuGroupLabel` `XhMenuItem` `XhMenuItemDescription` `XhMenuItemIcon` `XhMenuItemIndicator` `XhMenuItemShortcut` `XhMenuItemSuffix` `XhMenuItemText` `XhMenuPositioner` `XhMenuRadioGroup` `XhMenuRadioItem` `XhMenuRoot` `XhMenuSeparator` `XhMenuSub` `XhMenuSubTrigger` `XhMenuTrigger` |
| Composable | `useMenu` |
| State machine | `menuMachine` |
| Skin | `@xihan-ui/styles/menu.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `MenuNode[]` |  |
| `checkboxValue` | `string[]` |  |
| `defaultCheckboxValue` | `string[]` |  |
| `radioValue` | `MenuRadioValue` |  |
| `defaultRadioValue` | `MenuRadioValue` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `anchor` | `HTMLElement \| null` |  |
| `placement` | `Placement` |  |
| `offset` | `number` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `fitAvailableHeight` | `boolean` |  |
| `typeahead` | `boolean` |  |
| `disabled` | `boolean` |  |
| `translations` | `Partial<MenuTranslations>` |  |
| `submenu` | `boolean` |  |
| `openOnHover` | `boolean` |  |
| `hoverOpenDelay` | `number` |  |
| `hoverCloseDelay` | `number` |  |
| `onOpenChange` | `(details: MenuOpenChangeDetails) => void` |  |
| `onItemSelect` | `(details: MenuItemSelectDetails) => void` |  |
| `onCheckboxValueChange` | `(details: MenuCheckboxValueChangeDetails) => void` |  |
| `onRadioValueChange` | `(details: MenuRadioValueChangeDetails) => void` |  |

### MenuNode

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
| `open-change` | `MenuOpenChangeDetails` |
| `item-select` | `MenuItemSelectDetails` |
| `checkbox-value-change` | `MenuCheckboxValueChangeDetails` |
| `radio-value-change` | `MenuRadioValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhMenuRoot` | `default` | `MenuRootSlotProps` |
| `XhMenuRoot` | `trigger` | — |
| `XhMenuRoot` | `item` | `MenuNodeMeta` |
| `XhMenuRoot` | `item-prefix` | `MenuNodeMeta` |
| `XhMenuRoot` | `item-suffix` | `MenuNodeMeta` |
| `XhMenuSub` | `default` | `MenuSubSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhMenuGroup` | `value` | `string` | Yes |
| `XhMenuItem` | `value` | `string` | Yes |
| `XhMenuItem` | `disabled` | `boolean` |  |
| `XhMenuPositioner` | `container` | `() => Element \| null` |  |
| `XhMenuRadioGroup` | `value` | `string` | Yes |
| `XhMenuRoot` | `trigger` | `ReactNode` |  |
| `XhMenuRoot` | `triggerAsChild` | `boolean` |  |
| `XhMenuRoot` | `label` | `string` |  |
| `XhMenuRoot` | `renderItem` | `(node: MenuNodeMeta) => ReactNode` |  |
| `XhMenuRoot` | `renderItemPrefix` | `(node: MenuNodeMeta) => ReactNode` |  |
| `XhMenuRoot` | `renderItemSuffix` | `(node: MenuNodeMeta) => ReactNode` |  |
| `XhMenuRoot` | `children` | `SlotChildren<MenuRootSlotProps>` |  |
| `XhMenuSub` | `value` | `string` | Yes |
| `XhMenuSub` | `label` | `string` |  |
| `XhMenuSub` | `icon` | `IconRecord` |  |
| `XhMenuSub` | `disabled` | `boolean` |  |
| `XhMenuSub` | `collection` | `MenuNode[]` |  |
| `XhMenuSub` | `checkboxValue` | `string[]` |  |
| `XhMenuSub` | `defaultCheckboxValue` | `string[]` |  |
| `XhMenuSub` | `radioValue` | `MenuRadioValue` |  |
| `XhMenuSub` | `defaultRadioValue` | `MenuRadioValue` |  |
| `XhMenuSub` | `placement` | `Placement` |  |
| `XhMenuSub` | `offset` | `number` |  |
| `XhMenuSub` | `loop` | `boolean` |  |
| `XhMenuSub` | `openOnHover` | `boolean` |  |
| `XhMenuSub` | `hoverOpenDelay` | `number` |  |
| `XhMenuSub` | `hoverCloseDelay` | `number` |  |
| `XhMenuSub` | `dir` | `Direction` |  |
| `XhMenuSub` | `tone` | `Tone` |  |
| `XhMenuSub` | `size` | `Size` |  |
| `XhMenuSub` | `fitAvailableHeight` | `boolean` |  |
| `XhMenuSub` | `onCheckboxValueChange` | `MenuProps['onCheckboxValueChange']` |  |
| `XhMenuSub` | `onRadioValueChange` | `MenuProps['onRadioValueChange']` |  |
| `XhMenuSub` | `children` | `SlotChildren<MenuSubSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `item-indicator` | 'checked' \| 'unchecked' \| 'checked' \| 'unchecked' \| undefined |
| `submenu-trigger` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `TOGGLE` · `CLOSE` · `PRESS.START` · `PRESS.END` · `CHECKBOX.VALUE.SET` · `RADIO.VALUE.SET` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `ITEM.LOST` · `ITEM.SELECT`

**Guards**: `isOpenControlled` · `canPress` · `keepsMenuOpen`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `disabled` | `boolean` |
| `collection` | `readonly MenuNodeMeta[]` |
| `focusedValue` | `string \| null` |
| `checkboxValue` | `readonly string[]` |
| `radioValue` | `Readonly<MenuRadioValue>` |
| `isCheckboxItemChecked` | `(value: string) => boolean` |
| `isRadioItemChecked` | `(group: string, value: string) => boolean` |
| `setCheckboxValue` | `(next: string[]) => void` |
| `setRadioValue` | `(next: MenuRadioValue) => void` |
| `setOpen` | `(next: boolean) => void` |
| `getTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getItemProps` | `(props: MenuItemProps) => T['element']` |
| `getCheckboxItemProps` | `(props: MenuCheckboxItemProps) => T['element']` |
| `getRadioItemProps` | `(props: MenuRadioItemProps) => T['element']` |
| `getItemIconProps` | `(props: MenuAnyItemProps) => T['element']` |
| `getItemTextProps` | `(props: MenuAnyItemProps) => T['element']` |
| `getItemIndicatorProps` | `(props: MenuAnyItemProps) => T['element']` |
| `getItemDescriptionProps` | `(props: MenuAnyItemProps) => T['element']` |
| `getItemShortcutProps` | `(props: MenuAnyItemProps) => T['element']` |
| `getItemSuffixProps` | `(props: MenuAnyItemProps) => T['element']` |
| `getSubmenuTriggerProps` | `(props: MenuItemProps) => T['element']` |
| `getSeparatorProps` | `() => T['element']` |
| `getGroupProps` | `(props: MenuGroupProps) => T['element']` |
| `getRadioGroupProps` | `(props: MenuGroupProps) => T['element']` |
| `getGroupLabelProps` | `(props: MenuGroupProps) => T['element']` |
| `getArrowProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` / `ArrowDown` | `menu.kbd.open-first` |
| `ArrowUp` | `menu.kbd.open-last` |
| `ArrowDown` | `menu.kbd.next` |
| `ArrowUp` | `menu.kbd.prev` |
| `Home` | `menu.kbd.first` |
| `End` | `menu.kbd.last` |
| `Enter` / `Space` | `menu.kbd.select` |
| `Enter` / `Space` | `menu.kbd.press` |
| `Escape` | `menu.kbd.escape` |
| `Tab` / `Shift+Tab` | `menu.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'menu' |
| `trigger` | `aria-label` | props.translations.trigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | props.translations.content |
| `content` | `aria-labelledby` | id of the `trigger` part \| undefined |
| `content` | `role` | 'menu' |
| `item-icon` | `aria-hidden` | 'true' |
| `item-shortcut` | `aria-hidden` | 'true' |
| `item-indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-orientation` | 'horizontal' |
| `separator` | `role` | 'separator' |
| `group` | `aria-labelledby` | id of the `group-label` part |
| `group` | `role` | 'group' |
| `arrow` | `aria-hidden` | 'true' |
| `submenu-trigger` | `aria-controls` | id of the `content` part |
| `submenu-trigger` | `aria-disabled` | 'true' \| 'false' |
| `submenu-trigger` | `aria-expanded` | 'true' \| 'false' |
| `submenu-trigger` | `aria-haspopup` | 'menu' |
| `radio-group` | `aria-labelledby` | id of the `group-label` part |
| `submenu-trigger` | `role` | 'menuitem' |
| `radio-group` | `role` | 'group' |

## Style reference

### Skin

`@xihan-ui/styles/menu.css` is written against `[data-scope="menu"][data-part="trigger"]` part selectors; the published build uses the mount class `.xh-scope-menu` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-fit-available-height` | '' (present only while the condition holds) |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-placement` | actual placement computed by the positioning engine |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-tone` | props.tone |
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
| `submenu-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `submenu-trigger` | `data-in-path` | '' (present only while the condition holds) |
| `submenu-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `submenu-trigger` | `data-state` | 'open' \| 'closed' |
| `radio-group` | `data-value` | group.value |
| `submenu-trigger` | `data-xh-collection-context` | 'overlay' |
| `submenu-trigger` | `data-xh-collection-item` | '' |
| `submenu-trigger` | `data-xh-collection-size` | props.size |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-menu-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` |
| `--xh-menu-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` |
| `--xh-menu-border` | `arrow`<br>`content` | `border` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border`<br>`--xh-material-frosted-border` |
| `--xh-menu-content-bg` | `arrow`<br>`content` | `background` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg`<br>`--xh-material-frosted-bg` |
| `--xh-menu-content-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-menu-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-menu-content-px` | `content` | `padding-inline` | `default` | `0` |
| `--xh-menu-content-py` | `content` | `padding-block` | `default` | `--xh-surface-pad-xs` |
| `--xh-menu-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-menu-content-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-menu-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-menu-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-menu-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-menu-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-regular` |
| `--xh-menu-group-label-mt` | `group-label` | `margin-block-start` | `default` | `--xh-space-2` |
| `--xh-menu-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_menu-item-px` |
| `--xh-menu-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-menu-highlight` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-highlight` |
| `--xh-menu-icon-size` | `content` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-menu-item-bg-active` | `item` | `background-color` | `in-path` | `--xh-bg-subtle` |
| `--xh-menu-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` |
| `--xh-menu-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-menu-item-description-fg` | `item-description` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-menu-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-control-caption-md` |
| `--xh-menu-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-material-frosted-fg` |
| `--xh-menu-item-font-size` | `item` | `font-size` | `default` | `--xh-_menu-font-size` |
| `--xh-menu-item-gap` | `item` | `gap` | `default` | `--xh-_menu-item-gap` |
| `--xh-menu-item-h` | `item` | `min-block-size` | `default` | `--xh-_menu-item-h` |
| `--xh-menu-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone` |
| `--xh-menu-item-indicator-size` | `content`<br>`group`<br>`item`<br>`item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default`<br>`has(> [data-scope='menu'][data-part='item'] > [data-xh-menu-choice-indicator], > [data-scope='menu'][data-part='group'] > [data-scope='menu'][data-part='item'] > [data-xh-menu-choice-indicator])`<br>`not([aria-haspopup='menu'], [aria-checked])`<br>`xh-menu-choice-indicator` | `--xh-control-indicator-size` |
| `--xh-menu-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-menu-item-px` | `item` | `padding-inline` | `default` | `--xh-_menu-item-px` |
| `--xh-menu-item-py` | `item` | `padding-block` | `default` | `--xh-_menu-item-py` |
| `--xh-menu-item-radius` | `item` | `border-radius` | `default` | `0` |
| `--xh-menu-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-menu-max-h` | `content` | `max-block-size` | `default` | `--xh-_menu-max-h` |
| `--xh-menu-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` |
| `--xh-menu-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` |
| `--xh-menu-separator-color` | `separator` | `background` | `default` | `--xh-material-frosted-separator` |
| `--xh-menu-separator-my` | `separator` | `margin-block` | `default` | `--xh-space-0_5` |
| `--xh-menu-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-menu-separator-thickness` | `separator` | `block-size` | `default` | `--xh-stroke-thin` |
| `--xh-menu-submenu-indicator-fg` | `item` | `background-color` | `default` | `currentColor` |
| `--xh-menu-submenu-indicator-size` | `item` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-menu-trigger-bg-active` | `trigger` | `background` | `disabled`<br>`not([data-disabled])`<br>`state=open` | `--xh-bg-subtle` |
