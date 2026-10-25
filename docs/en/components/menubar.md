# Menubar

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/menubar).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/menubar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/menubar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/menubar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/menubar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/menubar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="menubar"`: **`root`** · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-icon` · `item-text` · `item-description` · `item-shortcut` · `item-suffix` · `item-indicator` · `separator` · `group` · `group-label` · `arrow`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-menubar>` |
| Vue components | `XhMenubarArrow` `XhMenubarCheckboxItem` `XhMenubarContent` `XhMenubarGroup` `XhMenubarGroupLabel` `XhMenubarItem` `XhMenubarItemDescription` `XhMenubarItemIcon` `XhMenubarItemIndicator` `XhMenubarItemShortcut` `XhMenubarItemSuffix` `XhMenubarItemText` `XhMenubarPositioner` `XhMenubarRadioGroup` `XhMenubarRadioItem` `XhMenubarRoot` `XhMenubarSeparator` `XhMenubarSub` `XhMenubarSubTrigger` `XhMenubarTrigger` |
| Composable | `useMenubar` |
| State machine | `menubarMachine` |
| Skin | `@xihan-ui/styles/menubar.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `MenubarNode[]` |  |
| `checkboxValue` | `string[]` |  |
| `defaultCheckboxValue` | `string[]` |  |
| `radioValue` | `MenuRadioValue` |  |
| `defaultRadioValue` | `MenuRadioValue` |  |
| `value` | `string \| null` |  |
| `defaultValue` | `string \| null` |  |
| `orientation` | `Orientation` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `disabled` | `boolean` |  |
| `typeahead` | `boolean` |  |
| `placement` | `Placement` |  |
| `offset` | `number` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<MenubarTranslations>` |  |
| `onValueChange` | `(details: MenubarValueChangeDetails) => void` |  |
| `onItemSelect` | `(details: MenubarItemSelectDetails) => void` |  |
| `onCheckboxValueChange` | `(details: MenuCheckboxValueChangeDetails) => void` |  |
| `onRadioValueChange` | `(details: MenuRadioValueChangeDetails) => void` |  |

### MenubarNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `kind` | `MenuChoiceKind` |  |
| `label` | `string` |  |
| `icon` | `IconRecord` |  |
| `description` | `string` |  |
| `shortcut` | `string` |  |
| `keyshortcuts` | `string` |  |
| `disabled` | `boolean` |  |
| `tone` | `Tone` |  |
| `group` | `string` |  |
| `groupLabel` | `string` |  |
| `separatorBefore` | `boolean` |  |
| `closeOnSelect` | `boolean` |  |
| `items` | `MenubarNode[]` |  |
| `children` | `MenuNode[]` |  |
| `checkboxValue` | `string[]` |  |
| `radioValue` | `MenuRadioValue` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `MenubarValueChangeDetails` |
| `item-select` | `MenubarItemSelectDetails` |
| `checkbox-value-change` | `MenubarCheckboxValueChangeDetails` |
| `radio-value-change` | `MenubarRadioValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhMenubarRoot` | `default` | `MenubarRootSlotProps` |
| `XhMenubarRoot` | `item` | `MenubarNodeMeta` |
| `XhMenubarRoot` | `item-prefix` | `MenubarNodeMeta` |
| `XhMenubarRoot` | `item-suffix` | `MenubarNodeMeta` |
| `XhMenubarSub` | `default` | `MenubarSubSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhMenubarContent` | `value` | `string` |  |
| `XhMenubarGroup` | `value` | `string` | Yes |
| `XhMenubarItem` | `value` | `string` | Yes |
| `XhMenubarItem` | `disabled` | `boolean` |  |
| `XhMenubarPositioner` | `value` | `string` | Yes |
| `XhMenubarPositioner` | `container` | `() => Element \| null` |  |
| `XhMenubarRadioGroup` | `value` | `string` | Yes |
| `XhMenubarRoot` | `renderItem` | `(node: MenubarNodeMeta) => ReactNode` |  |
| `XhMenubarRoot` | `renderItemPrefix` | `(node: MenubarNodeMeta) => ReactNode` |  |
| `XhMenubarRoot` | `renderItemSuffix` | `(node: MenubarNodeMeta) => ReactNode` |  |
| `XhMenubarRoot` | `children` | `SlotChildren<MenubarRootSlotProps>` |  |
| `XhMenubarSub` | `value` | `string` | Yes |
| `XhMenubarSub` | `label` | `string` |  |
| `XhMenubarSub` | `icon` | `IconRecord` |  |
| `XhMenubarSub` | `disabled` | `boolean` |  |
| `XhMenubarSub` | `collection` | `MenuNode[]` |  |
| `XhMenubarSub` | `checkboxValue` | `string[]` |  |
| `XhMenubarSub` | `defaultCheckboxValue` | `string[]` |  |
| `XhMenubarSub` | `radioValue` | `MenubarRadioValue` |  |
| `XhMenubarSub` | `defaultRadioValue` | `MenubarRadioValue` |  |
| `XhMenubarSub` | `placement` | `Placement` |  |
| `XhMenubarSub` | `offset` | `number` |  |
| `XhMenubarSub` | `loop` | `boolean` |  |
| `XhMenubarSub` | `openOnHover` | `boolean` |  |
| `XhMenubarSub` | `hoverOpenDelay` | `number` |  |
| `XhMenubarSub` | `hoverCloseDelay` | `number` |  |
| `XhMenubarSub` | `dir` | `Direction` |  |
| `XhMenubarSub` | `tone` | `Tone` |  |
| `XhMenubarSub` | `size` | `Size` |  |
| `XhMenubarSub` | `onCheckboxValueChange` | `MenuSchema['props']['onCheckboxValueChange']` |  |
| `XhMenubarSub` | `onRadioValueChange` | `MenuSchema['props']['onRadioValueChange']` |  |
| `XhMenubarSub` | `children` | `SlotChildren<MenubarSubSlotProps>` |  |
| `XhMenubarTrigger` | `value` | `string` | Yes |
| `XhMenubarTrigger` | `disabled` | `boolean` |  |

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

**States**: `idle` · `open`

**Events**: `TRIGGER.TOGGLE` · `TRIGGER.OPEN` · `TRIGGER.POINTER` · `TRIGGER.FOCUS` · `CLOSE` · `MENUBAR.BLUR` · `VALUE.SET` · `PRESENCE.SET` · `ITEM.FOCUS` · `ITEM.LOST` · `ITEM.SELECT` · `CHECKBOX.VALUE.SET` · `RADIO.VALUE.SET` · `PRESS.START` · `PRESS.END` · `SYNC.OPEN` · `SYNC.CLOSE`

**Guards**: `hasValue` · `isCurrent` · `shouldAbsorbToggle` · `shouldSwitch` · `canPress` · `keepsMenuOpen`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string \| null` |
| `collection` | `readonly MenubarNodeMeta[]` |
| `open` | `boolean` |
| `focusedValue` | `string \| null` |
| `focusedItem` | `string \| null` |
| `orientation` | `Orientation` |
| `disabled` | `boolean` |
| `checkboxValue` | `readonly string[]` |
| `radioValue` | `Readonly<MenuRadioValue>` |
| `isCheckboxItemChecked` | `(value: string) => boolean` |
| `isRadioItemChecked` | `(group: string, value: string) => boolean` |
| `setCheckboxValue` | `(next: string[]) => void` |
| `setRadioValue` | `(next: MenuRadioValue) => void` |
| `isOpen` | `(value: string) => boolean` |
| `setValue` | `(next: string \| null) => void` |
| `getRootProps` | `() => T['element']` |
| `getTriggerProps` | `(props: MenubarTriggerProps) => T['button']` |
| `getPositionerProps` | `(props: MenubarContentProps) => T['element']` |
| `getContentProps` | `(props: MenubarContentProps) => T['element']` |
| `getItemProps` | `(props: MenubarItemProps) => T['element']` |
| `getCheckboxItemProps` | `(props: MenubarCheckboxItemProps) => T['element']` |
| `getRadioItemProps` | `(props: MenubarRadioItemProps) => T['element']` |
| `getItemIconProps` | `(props: MenubarAnyItemProps) => T['element']` |
| `getItemTextProps` | `(props: MenubarAnyItemProps) => T['element']` |
| `getItemIndicatorProps` | `(props: MenubarAnyItemProps) => T['element']` |
| `getItemDescriptionProps` | `(props: MenubarAnyItemProps) => T['element']` |
| `getItemShortcutProps` | `(props: MenubarAnyItemProps) => T['element']` |
| `getItemSuffixProps` | `(props: MenubarAnyItemProps) => T['element']` |
| `getSeparatorProps` | `() => T['element']` |
| `getGroupProps` | `(props: MenubarGroupProps) => T['element']` |
| `getRadioGroupProps` | `(props: MenubarGroupProps) => T['element']` |
| `getGroupLabelProps` | `(props: MenubarGroupProps) => T['element']` |
| `getArrowProps` | `(props: MenubarContentProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowRight` | `menubar.kbd.next` |
| `ArrowLeft` | `menubar.kbd.prev` |
| `Home` | `menubar.kbd.first` |
| `End` | `menubar.kbd.last` |
| `ArrowDown` / `Enter` / `Space` | `menubar.kbd.open-first` |
| `ArrowUp` | `menubar.kbd.open-last` |
| `ArrowDown` | `menubar.kbd.item-next` |
| `ArrowUp` | `menubar.kbd.item-prev` |
| `Home` | `menubar.kbd.item-first` |
| `End` | `menubar.kbd.item-last` |
| `ArrowRight` / `ArrowLeft` | `menubar.kbd.across` |
| `a-z` / `0-9` | `menubar.kbd.typeahead` |
| `Enter` / `Space` | `menubar.kbd.select` |
| `Enter` / `Space` | `menubar.kbd.press` |
| `Escape` | `menubar.kbd.escape` |
| `Tab` / `Shift+Tab` | `menubar.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-label` | translations.root |
| `root` | `aria-orientation` | props.orientation |
| `root` | `role` | 'menubar' |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'menu' |
| `trigger` | `role` | 'menuitem' |
| `content` | `aria-hidden` | !isOpen \|\| undefined |
| `content` | `aria-labelledby` | id of the `trigger` part |
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

`@xihan-ui/styles/menubar.css` is written against `[data-scope="menubar"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-menubar` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-in-path` | '' (present only while the condition holds) |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-collection-context` | 'nav' |
| `trigger` | `data-xh-collection-item` | '' |
| `trigger` | `data-xh-collection-size` | props.size |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine \| undefined |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-placement` | actual placement computed by the positioning engine \| undefined |
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
| `--xh-menubar-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` |
| `--xh-menubar-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` |
| `--xh-menubar-bg` | `root` | `background` | `default` | `transparent` |
| `--xh-menubar-border` | `arrow`<br>`content` | `border` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border`<br>`--xh-material-frosted-border` |
| `--xh-menubar-content-bg` | `arrow`<br>`content` | `background` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg`<br>`--xh-material-frosted-bg` |
| `--xh-menubar-content-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-menubar-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-menubar-content-px` | `content` | `padding-inline` | `default` | `0` |
| `--xh-menubar-content-py` | `content` | `padding-block` | `default` | `--xh-surface-pad-xs` |
| `--xh-menubar-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-menubar-content-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-menubar-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-menubar-gap` | `root` | `gap` | `default` | `--xh-space-1` |
| `--xh-menubar-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-menubar-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-menubar-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-menubar-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-regular` |
| `--xh-menubar-group-label-mt` | `group-label` | `margin-block-start` | `default` | `--xh-space-2` |
| `--xh-menubar-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_menubar-item-px` |
| `--xh-menubar-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-menubar-highlight` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-highlight` |
| `--xh-menubar-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-menubar-item-bg-active` | `item` | `background-color` | `in-path`<br>`xh-collection-context=nav` | `--xh-bg-subtle` |
| `--xh-menubar-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-bg-subtle` |
| `--xh-menubar-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` |
| `--xh-menubar-item-description-fg` | `item-description` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-menubar-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-control-caption-md` |
| `--xh-menubar-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-material-frosted-fg` |
| `--xh-menubar-item-font-size` | `item` | `font-size` | `default` | `--xh-_menubar-font-size` |
| `--xh-menubar-item-gap` | `item` | `gap` | `default` | `--xh-_menubar-item-gap` |
| `--xh-menubar-item-h` | `item` | `min-block-size` | `default` | `--xh-_menubar-item-h` |
| `--xh-menubar-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone` |
| `--xh-menubar-item-indicator-size` | `content`<br>`group`<br>`item`<br>`item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default`<br>`has(> [data-scope='menubar'][data-part='item'] > [data-xh-menu-choice-indicator], > [data-scope='menubar'][data-part='group'] > [data-scope='menubar'][data-part='item'] > [data-xh-menu-choice-indicator])`<br>`not([aria-haspopup='menu'], [aria-checked])`<br>`xh-menu-choice-indicator` | `--xh-control-indicator-size` |
| `--xh-menubar-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-menubar-item-px` | `item` | `padding-inline` | `default` | `--xh-_menubar-item-px` |
| `--xh-menubar-item-py` | `item` | `padding-block` | `default` | `--xh-_menubar-item-py` |
| `--xh-menubar-item-radius` | `item` | `border-radius` | `default` | `0` |
| `--xh-menubar-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-menubar-max-h` | `content` | `max-block-size` | `default` | `--xh-_menubar-max-h` |
| `--xh-menubar-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` |
| `--xh-menubar-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` |
| `--xh-menubar-px` | `root` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-menubar-py` | `root` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-menubar-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-menubar-separator-color` | `separator` | `background` | `default` | `--xh-material-frosted-separator` |
| `--xh-menubar-separator-my` | `separator` | `margin-block` | `default` | `--xh-space-0_5` |
| `--xh-menubar-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-menubar-separator-thickness` | `separator` | `block-size` | `default` | `--xh-stroke-thin` |
| `--xh-menubar-submenu-indicator-fg` | `item` | `background-color` | `default` | `currentColor` |
| `--xh-menubar-submenu-indicator-size` | `item` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-menubar-trigger-bg-active` | `trigger` | `background-color` | `in-path`<br>`xh-collection-context=nav` | `--xh-bg-subtle` |
| `--xh-menubar-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-bg-subtle` |
| `--xh-menubar-trigger-bg-pressed` | `trigger` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` |
| `--xh-menubar-trigger-fg` | `trigger` | `color` | `default`<br>`xh-collection-context=nav` | `--xh-fg-default` |
| `--xh-menubar-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_menubar-font-size` |
| `--xh-menubar-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-sm` |
| `--xh-menubar-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_menubar-trigger-px` |
| `--xh-menubar-trigger-py` | `trigger` | `padding-block` | `default` | `--xh-_menubar-trigger-py` |
| `--xh-menubar-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` |
