# Toolbar

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/toolbar).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toolbar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toolbar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toolbar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toolbar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toolbar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="toolbar"`: **`root`** · `group` · **`item`** · `separator` · `overflow-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-toolbar>` |
| Vue components | `XhToolbarGroup` `XhToolbarItem` `XhToolbarOverflowTrigger` `XhToolbarRoot` `XhToolbarSeparator` |
| Composable | `useToolbar` |
| State machine | `toolbarMachine` |
| Skin | `@xihan-ui/styles/toolbar.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `orientation` | `Orientation` |  |
| `dir` | `Direction` |  |
| `loop` | `boolean` |  |
| `disabled` | `boolean` |  |
| `variant` | `ControlVariant` |  |
| `size` | `Size` |  |
| `translations` | `Partial<ToolbarTranslations>` |  |
| `itemIcons` | `Readonly<Record<string, IconRecord>>` |  |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhToolbarRoot` | `default` | `ToolbarRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhToolbarItem` | `value` | `string` | Yes |
| `XhToolbarItem` | `disabled` | `boolean` |  |
| `XhToolbarItem` | `iconOnly` | `boolean` |  |
| `XhToolbarItem` | `as` | `ElementType` |  |
| `XhToolbarRoot` | `children` | `SlotChildren<ToolbarRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `ITEM.FOCUS` · `OVERFLOW_TRIGGER.FOCUS` · `TOOLBAR.BLUR` · `PRESS.START` · `PRESS.END` · `OVERFLOW.SELECT`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `focusedValue` | `string \| null` |
| `orientation` | `Orientation` |
| `separatorOrientation` | `Orientation` |
| `disabled` | `boolean` |
| `overflowItems` | `readonly ToolbarOverflowItem[]` |
| `getRootProps` | `() => T['element']` |
| `getGroupProps` | `() => T['element']` |
| `getItemProps` | `(props: ToolbarItemProps) => T['element']` |
| `getSeparatorProps` | `() => T['element']` |
| `getOverflowTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `toolbar.kbd.tab` |
| `ArrowRight` / `ArrowDown` | `toolbar.kbd.next` |
| `ArrowLeft` / `ArrowUp` | `toolbar.kbd.prev` |
| `Home` | `toolbar.kbd.first` |
| `End` | `toolbar.kbd.last` |
| `Enter` / `Space` | `toolbar.kbd.press` |
| `Enter` / `Space` / `ArrowDown` / `ArrowUp` | `toolbar.kbd.overflow-open` |
| `Escape` | `toolbar.kbd.overflow-close` |
| both arrow keys of the cross axis | `toolbar.kbd.cross-axis` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-orientation` | props.orientation |
| `root` | `role` | 'toolbar' |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `separator` | `aria-orientation` | 'vertical' \| 'horizontal' |
| `separator` | `role` | 'separator' |
| `overflow-trigger` | `aria-disabled` | 'true' \| 'false' |
| `overflow-trigger` | `aria-label` | resolveTranslations(TOOLBAR_EN_US, prop('translations… |

## Style reference

### Skin

`@xihan-ui/styles/toolbar.css` is written against `[data-scope="toolbar"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-toolbar` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `group` | `data-disabled` | '' (present only while the condition holds) |
| `group` | `data-orientation` | props.orientation |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-icon-only` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'icon' \| 'text' |
| `item` | `data-xh-action-size` | props.size |
| `item` | `data-xh-action-variant` | 'ghost' |
| `separator` | `data-orientation` | 'vertical' \| 'horizontal' |
| `overflow-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `overflow-trigger` | `data-xh-action-control` | '' |
| `overflow-trigger` | `data-xh-action-display` | 'always' |
| `overflow-trigger` | `data-xh-action-profile` | 'icon' |
| `overflow-trigger` | `data-xh-action-size` | props.size |
| `overflow-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-toolbar-bg` | `root` | `background` | `default` | `--xh-_toolbar-root-bg` |
| `--xh-toolbar-bg-disabled` | `root` | `background` | `disabled` | `--xh-_toolbar-root-bg-disabled` |
| `--xh-toolbar-border` | `root` | `border` | `default` | `--xh-_toolbar-root-border` |
| `--xh-toolbar-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-toolbar-gap` | `root` | `gap` | `default` | `--xh-_toolbar-gap` |
| `--xh-toolbar-group-gap` | `group` | `gap` | `default` | `--xh-space-0` |
| `--xh-toolbar-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-toolbar-item-bg` | `group`<br>`item` | `--xh-ink-surface`<br>`background-color` | `default`<br>`not([aria-pressed='true'])`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest`<br>`--xh-bg-subtle` |
| `--xh-toolbar-item-bg-active` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-toolbar-item-bg-disabled` | `group`<br>`item` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled`<br>`--xh-bg-subtle` |
| `--xh-toolbar-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-toolbar-item-bg-pressed` | `item` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-bg-brand-subtle` |
| `--xh-toolbar-item-bg-pressed-active` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-brand-subtle-active` |
| `--xh-toolbar-item-bg-pressed-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-brand-subtle-hover` |
| `--xh-toolbar-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-toolbar-item-fg-pressed` | `item` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-on-brand-subtle` |
| `--xh-toolbar-item-font-size` | `item` | `font-size` | `default` | `--xh-_action-profile-font-size` |
| `--xh-toolbar-item-font-weight` | `item` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-toolbar-item-gap` | `item` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-toolbar-item-h` | `item` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`icon-only`<br>`orientation=vertical`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-toolbar-item-px` | `item` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-toolbar-item-radius` | `group`<br>`item` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `default`<br>`first-of-type`<br>`last-of-type`<br>`not(:has(~ [data-scope='toolbar'][data-part='item']:not([hidden])`<br>`not([hidden])`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-_action-profile-radius`<br>`--xh-shape-control` |
| `--xh-toolbar-px` | `root` | `padding-inline` | `default` | `--xh-_toolbar-root-p` |
| `--xh-toolbar-py` | `root` | `padding-block` | `default` | `--xh-_toolbar-root-p` |
| `--xh-toolbar-radius` | `root` | `border-radius` | `default`<br>`variant=outline` | `--xh-shape-surface` |
| `--xh-toolbar-separator-color` | `group`<br>`separator` | `background` | `default` | `--xh-border-default`<br>`--xh-fg-default` |
| `--xh-toolbar-separator-gap` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-3` |
| `--xh-toolbar-separator-inset` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-0` |
| `--xh-toolbar-separator-opacity` | `group`<br>`separator` | `opacity` | `default` | `--xh-control-separator-opacity` |
| `--xh-toolbar-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-toolbar-separator-thickness` | `group`<br>`separator` | `block-size`<br>`inline-size`<br>`margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thin` |
| `--xh-toolbar-shadow` | `root` | `box-shadow` | `variant=outline` | `none` |
