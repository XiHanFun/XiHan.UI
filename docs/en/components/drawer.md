# Drawer

Overlays component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/drawer).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/drawer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/drawer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/drawer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/drawer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/drawer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="drawer"`: **`root`** · `trigger` · `backdrop` · `positioner` · **`content`** · `header` · `title` · `description` · `body` · `footer` · `confirm-trigger` · `cancel-trigger` · `close-trigger` · `resize-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-drawer>` |
| Vue components | `XhDrawerBody` `XhDrawerCancelTrigger` `XhDrawerCloseTrigger` `XhDrawerConfirmTrigger` `XhDrawerContent` `XhDrawerDescription` `XhDrawerFooter` `XhDrawerHeader` `XhDrawerResizeTrigger` `XhDrawerRoot` `XhDrawerTitle` `XhDrawerTrigger` |
| Composable | `useDrawer` |
| State machine | `drawerMachine` |
| Skin | `@xihan-ui/styles/drawer.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `modal` | `boolean` |  |
| `contained` | `boolean` |  |
| `side` | `DrawerSide` |  |
| `role` | `'dialog' \| 'alertdialog'` |  |
| `closeOnEscape` | `boolean` |  |
| `closeOnInteractOutside` | `boolean` |  |
| `restoreFocus` | `boolean` |  |
| `size` | `Size` |  |
| `variant` | `OverlayBackdropVariant` |  |
| `unmountOnExit` | `boolean` |  |
| `parts` | `TitleDescriptionParts` |  |
| `translations` | `Partial<DrawerTranslations>` |  |
| `onOpenChange` | `(details: DrawerOpenChangeDetails) => void` |  |
| `onExitComplete` | `() => void` |  |
| `resizable` | `boolean` |  |
| `panelSize` | `number` |  |
| `defaultPanelSize` | `number` |  |
| `minPanelSize` | `number` |  |
| `maxPanelSize` | `number` |  |
| `onPanelSizeChange` | `(details: DrawerPanelSizeChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `confirm` | `CustomEvent` |
| `confirm-error` | `CustomEvent` |
| `cancel-press` | `CustomEvent` |
| `exit-complete` | `CustomEvent` |
| `panel-size-change` | `CustomEvent` |
| `open-change` | `DrawerOpenChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhDrawerRoot` | `default` | `DrawerRootSlotProps` |
| `XhDrawerRoot` | `trigger` | — |
| `XhDrawerRoot` | `title` | — |
| `XhDrawerRoot` | `description` | — |
| `XhDrawerRoot` | `body` | — |
| `XhDrawerRoot` | `footer` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhDrawerRoot` | `container` | `() => Element \| null` |  |
| `XhDrawerRoot` | `trigger` | `ReactNode` |  |
| `XhDrawerRoot` | `title` | `ReactNode` |  |
| `XhDrawerRoot` | `description` | `ReactNode` |  |
| `XhDrawerRoot` | `body` | `ReactNode` |  |
| `XhDrawerRoot` | `footer` | `ReactNode` |  |
| `XhDrawerRoot` | `actions` | `DrawerStructureActions` |  |
| `XhDrawerRoot` | `confirmText` | `string` |  |
| `XhDrawerRoot` | `cancelText` | `string` |  |
| `XhDrawerRoot` | `onConfirm` | `DrawerActionIntents['onConfirm']` |  |
| `XhDrawerRoot` | `onConfirmError` | `DrawerActionIntents['onConfirmError']` |  |
| `XhDrawerRoot` | `onCancelPress` | `DrawerActionIntents['onCancelPress']` |  |
| `XhDrawerRoot` | `children` | `SlotChildren<DrawerRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `RESIZE.START` · `RESIZE.NUDGE` · `RESIZE.TO_BOUND` · `RESIZE.MEASURE`

**Guards**: `canResize`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `panelSize` | `number \| null` |
| `resizing` | `boolean` |
| `side` | `DrawerSide` |
| `pending` | `boolean` |
| `actionError` | `DrawerConfirmErrorDetails \| null` |
| `setOpen` | `(next: boolean) => void` |
| `confirm` | `() => void` |
| `cancel` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getBackdropProps` | `() => T['element']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getHeaderProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getBodyProps` | `() => T['element']` |
| `getFooterProps` | `() => T['element']` |
| `getConfirmTriggerProps` | `() => T['button']` |
| `getCancelTriggerProps` | `() => T['button']` |
| `getCloseTriggerProps` | `() => T['button']` |
| `getResizeTriggerProps` | `() => T['element']` |
| `isContentMounted` | `(present: boolean) => boolean` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `drawer.kbd.open-on-trigger` |
| `Escape` | `drawer.kbd.escape` |
| `Tab` | `drawer.kbd.tab` |
| `Shift+Tab` | `drawer.kbd.shift-tab` |
| `Enter` / `Space` | `drawer.kbd.press` |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | `drawer.kbd.resize-step` |
| `Shift+ArrowLeft` / `Shift+ArrowRight` / `Shift+ArrowUp` / `Shift+ArrowDown` | `drawer.kbd.resize-large` |
| `Home` / `End` | `drawer.kbd.resize-bound` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | id of the `description` part \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | id of the `title` part \| undefined |
| `content` | `aria-modal` | 'true' \| 'false' |
| `content` | `role` | props.role |
| `confirm-trigger` | `aria-busy` | 'true' \| undefined |
| `confirm-trigger` | `aria-disabled` | 'true' \| undefined |
| `close-trigger` | `aria-label` | translations.close |
| `resize-trigger` | `aria-controls` | id of the `content` part |
| `resize-trigger` | `aria-label` | translations.resizeTrigger |
| `resize-trigger` | `aria-orientation` | 'vertical' \| 'horizontal' |
| `resize-trigger` | `aria-valuemax` | String(max) \| undefined |
| `resize-trigger` | `aria-valuemin` | String(min) |
| `resize-trigger` | `aria-valuenow` | String(now) \| undefined |
| `resize-trigger` | `role` | 'separator' |

## Style reference

### Skin

`@xihan-ui/styles/drawer.css` is written against `[data-scope="drawer"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-drawer` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-contained` | '' (present only while the condition holds) |
| `root` | `data-side` | props.side |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `backdrop` | `data-contained` | '' (present only while the condition holds) |
| `backdrop` | `data-instant` | '' (present only while the condition holds) |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-contained` | '' (present only while the condition holds) |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-contained` | '' (present only while the condition holds) |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-resizing` | '' (present only while the condition holds) |
| `content` | `data-side` | props.side |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `confirm-trigger` | `data-loading` | '' (present only while the condition holds) |
| `confirm-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `confirm-trigger` | `data-xh-action-control` | '' |
| `confirm-trigger` | `data-xh-action-display` | 'always' |
| `confirm-trigger` | `data-xh-action-profile` | 'text' |
| `confirm-trigger` | `data-xh-action-size` | 'md' |
| `confirm-trigger` | `data-xh-action-variant` | 'solid' |
| `confirm-trigger` | `data-xh-ink-surface` | '' |
| `confirm-trigger` | `data-xh-loading-ring` | 'overlay' |
| `cancel-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `cancel-trigger` | `data-xh-action-control` | '' |
| `cancel-trigger` | `data-xh-action-display` | 'always' |
| `cancel-trigger` | `data-xh-action-profile` | 'text' |
| `cancel-trigger` | `data-xh-action-size` | 'md' |
| `cancel-trigger` | `data-xh-action-variant` | 'outline' |
| `close-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |
| `resize-trigger` | `data-resizing` | '' (present only while the condition holds) |
| `resize-trigger` | `data-side` | props.side |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-drawer-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` |
| `--xh-drawer-backdrop-blur` | `backdrop` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` |
| `--xh-drawer-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` |
| `--xh-drawer-bg` | `content` | `background` | `default` | `--xh-material-elevated-bg` |
| `--xh-drawer-body-px` | `body` | `padding-inline` | `default` | `--xh-surface-px-sm` |
| `--xh-drawer-body-py` | `body` | `padding-block` | `default` | `--xh-surface-py-sm` |
| `--xh-drawer-border` | `content` | `border` | `default` | `--xh-material-elevated-border` |
| `--xh-drawer-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-drawer-close-bg-focus` | `close-trigger` | `background-color` | `focus-visible` | `--xh-_action-variant-bg-focus-visible` |
| `--xh-drawer-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-drawer-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-drawer-close-fg-focus` | `close-trigger` | `color` | `focus-visible` | `--xh-drawer-close-fg-hover` |
| `--xh-drawer-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed` |
| `--xh-drawer-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-drawer-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`inset-block-start`<br>`padding-inline-end` | `default`<br>`has([data-scope='drawer'][data-part='close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` |
| `--xh-drawer-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-drawer-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-drawer-fg` | `content` | `color` | `default` | `--xh-material-elevated-fg` |
| `--xh-drawer-footer-gap` | `footer` | `gap` | `default` | `--xh-control-gap-md` |
| `--xh-drawer-footer-pt` | `footer` | `padding-block-start` | `default` | `--xh-space-2` |
| `--xh-drawer-footer-px` | `content`<br>`footer` | `padding-inline` | `has([data-scope='drawer'][data-part='body'])` | `--xh-surface-px-sm` |
| `--xh-drawer-footer-py` | `content`<br>`footer` | `padding-block` | `has([data-scope='drawer'][data-part='body'])` | `--xh-overlay-sheet-footer-py` |
| `--xh-drawer-gap` | `content` | `gap` | `default` | `--xh-stack-gap-md` |
| `--xh-drawer-header-gap` | `header` | `gap` | `default` | `--xh-stack-gap-sm` |
| `--xh-drawer-header-pb` | `content`<br>`header` | `padding-block-end` | `default`<br>`has([data-scope='drawer'][data-part='body'])` | `--xh-_drawer-header-pb`<br>`--xh-space-2` |
| `--xh-drawer-header-pt` | `content`<br>`header` | `padding-block-start` | `has([data-scope='drawer'][data-part='body'])` | `--xh-_drawer-header-pt` |
| `--xh-drawer-header-px` | `content`<br>`header` | `padding-inline` | `has([data-scope='drawer'][data-part='body'])` | `--xh-surface-px-sm` |
| `--xh-drawer-icon-size` | `close-trigger`<br>`content`<br>`root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-xs` |
| `--xh-drawer-layer` | `content`<br>`positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-drawer-px` | `content` | `padding-inline` | `contained`<br>`default` | `--xh-surface-px-sm` |
| `--xh-drawer-py` | `content` | `padding-block-end`<br>`padding-block-start` | `contained`<br>`default` | `--xh-_drawer-header-pt`<br>`--xh-overlay-sheet-footer-py` |
| `--xh-drawer-radius` | `content` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-shape-sheet` |
| `--xh-drawer-resize-indicator-length` | `resize-trigger` | `block-size`<br>`inline-size` | `is([data-side='left'], [data-side='right'])`<br>`is([data-side='top'], [data-side='bottom'])`<br>`side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-space-8` |
| `--xh-drawer-resize-indicator-thickness` | `resize-trigger` | `block-size`<br>`inline-size` | `is([data-side='left'], [data-side='right'])`<br>`is([data-side='top'], [data-side='bottom'])`<br>`side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-stroke-strong` |
| `--xh-drawer-resize-trigger-bg` | `resize-trigger` | `background` | `default` | `--xh-border-control` |
| `--xh-drawer-resize-trigger-bg-active` | `resize-trigger` | `background` | `resizing` | `--xh-bg-brand` |
| `--xh-drawer-resize-trigger-bg-hover` | `resize-trigger` | `background` | `hover` | `--xh-border-control-hover` |
| `--xh-drawer-resize-trigger-radius` | `resize-trigger` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-drawer-resize-trigger-size` | `resize-trigger` | `block-size`<br>`inline-size` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-space-2` |
| `--xh-drawer-separator` | `content`<br>`footer`<br>`header` | `border-block-end`<br>`border-block-start` | `has([data-scope='drawer'][data-part='body'])` | `--xh-material-elevated-separator` |
| `--xh-drawer-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` |
| `--xh-drawer-size` | `content` | `block-size`<br>`inline-size` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-_drawer-size` |
| `--xh-drawer-title-fg` | `title` | `color` | `default` | `--xh-fg-default` |
| `--xh-drawer-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` |
| `--xh-drawer-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` |
| `--xh-drawer-trigger-bg` | `trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` |
| `--xh-drawer-trigger-bg-active` | `trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-drawer-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-drawer-trigger-bg-open` | `trigger` | `--xh-ink-surface`<br>`background-color` | `focus-visible`<br>`state=open`<br>`xh-ink-surface` | `--xh-bg-subtle` |
| `--xh-drawer-trigger-border` | `trigger` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest` |
| `--xh-drawer-trigger-border-hover` | `trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` |
| `--xh-drawer-trigger-border-open` | `trigger` | `border`<br>`border-color` | `focus-visible`<br>`state=open` | `--xh-border-control-hover` |
| `--xh-drawer-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-drawer-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` |
| `--xh-drawer-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-drawer-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-drawer-trigger-h` | `trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-drawer-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-drawer-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` |
