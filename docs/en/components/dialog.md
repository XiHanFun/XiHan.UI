# Dialog

Overlays component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/dialog).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/dialog" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/dialog.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/dialog" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/dialog" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/dialog.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="dialog"`: `trigger` · `backdrop` · `positioner` · **`content`** · `header` · `drag-trigger` · `indicator` · `title` · `description` · `body` · `footer` · `close-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-dialog>` |
| Vue components | `XhDialogBody` `XhDialogCloseTrigger` `XhDialogContent` `XhDialogDescription` `XhDialogDragTrigger` `XhDialogFooter` `XhDialogHeader` `XhDialogIndicator` `XhDialogRoot` `XhDialogTitle` `XhDialogTrigger` |
| Composable | `useDialog` |
| State machine | `dialogMachine` |
| Skin | `@xihan-ui/styles/dialog.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `modal` | `boolean` |  |
| `role` | `'dialog' \| 'alertdialog'` |  |
| `closeOnEscape` | `boolean` |  |
| `closeOnInteractOutside` | `boolean` |  |
| `restoreFocus` | `boolean` |  |
| `initialFocus` | `string` |  |
| `size` | `Size` |  |
| `variant` | `OverlayBackdropVariant` |  |
| `draggable` | `boolean` |  |
| `unmountOnExit` | `boolean` |  |
| `parts` | `TitleDescriptionParts` |  |
| `translations` | `Partial<DialogTranslations>` |  |
| `onOpenChange` | `(details: DialogOpenChangeDetails) => void` |  |
| `onExitComplete` | `() => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `exit-complete` | `CustomEvent` |
| `open-change` | `DialogOpenChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhDialogRoot` | `default` | `DialogRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhDialogContent` | `container` | `() => Element \| null` |  |
| `XhDialogRoot` | `children` | `SlotChildren<DialogRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END` · `DRAG.START` · `DRAG.NUDGE` · `DRAG.RESET` · `GESTURE.MOVE` · `GESTURE.END`

**Guards**: `isOpenControlled` · `canDrag`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `offset` | `DialogOffset` |
| `dragging` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `getTriggerProps` | `() => T['button']` |
| `getBackdropProps` | `() => T['element']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getHeaderProps` | `() => T['element']` |
| `getDragTriggerProps` | `() => T['button']` |
| `getIndicatorProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getBodyProps` | `() => T['element']` |
| `getFooterProps` | `() => T['element']` |
| `getCloseTriggerProps` | `() => T['button']` |
| `isContentMounted` | `(present: boolean) => boolean` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `dialog.kbd.open-on-trigger` |
| `Escape` | `dialog.kbd.escape` |
| `Tab` | `dialog.kbd.tab` |
| `Shift+Tab` | `dialog.kbd.shift-tab` |
| `Enter` / `Space` | `dialog.kbd.press` |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | `dialog.kbd.drag-move` |
| `Shift+ArrowUp` / `Shift+ArrowDown` / `Shift+ArrowLeft` / `Shift+ArrowRight` | `dialog.kbd.drag-large` |
| `Enter` / `Space` | `dialog.kbd.drag-reset` |

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
| `drag-trigger` | `aria-disabled` | 'false' \| 'true' |
| `drag-trigger` | `aria-label` | translations.dragTrigger |
| `indicator` | `aria-hidden` | 'true' |
| `close-trigger` | `aria-label` | translations.close |

## Style reference

### Skin

`@xihan-ui/styles/dialog.css` is written against `[data-scope="dialog"][data-part="trigger"]` part selectors; the published build uses the mount class `.xh-scope-dialog` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `backdrop` | `data-instant` | '' (present only while the condition holds) |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-draggable` | '' (present only while the condition holds) |
| `content` | `data-dragging` | '' (present only while the condition holds) |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `header` | `data-draggable` | '' (present only while the condition holds) |
| `drag-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `drag-trigger` | `data-dragging` | '' (present only while the condition holds) |
| `title` | `data-draggable` | '' (present only while the condition holds) |
| `close-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-dialog-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` |
| `--xh-dialog-backdrop-blur` | `backdrop` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` |
| `--xh-dialog-backdrop-filter` | `backdrop`<br>`content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default`<br>`variant=blur` | `--xh-dialog-backdrop-blur`<br>`--xh-material-elevated-backdrop` |
| `--xh-dialog-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` |
| `--xh-dialog-bg` | `content` | `background` | `default` | `--xh-material-elevated-bg` |
| `--xh-dialog-body-px` | `body` | `padding-inline` | `default` | `--xh-overlay-sheet-px` |
| `--xh-dialog-body-py` | `body` | `padding-block` | `default` | `--xh-overlay-sheet-body-py` |
| `--xh-dialog-border` | `content` | `border` | `default` | `--xh-material-elevated-border` |
| `--xh-dialog-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-dialog-close-bg-focus` | `close-trigger` | `background-color` | `focus-visible` | `--xh-_action-variant-bg-focus-visible` |
| `--xh-dialog-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-dialog-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-dialog-close-fg-focus` | `close-trigger` | `color` | `focus-visible` | `--xh-dialog-close-fg-hover` |
| `--xh-dialog-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed` |
| `--xh-dialog-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-dialog-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`inset-block-start`<br>`padding-inline-end` | `default`<br>`has([data-scope='dialog'][data-part='close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` |
| `--xh-dialog-content-backdrop-filter` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-dialog-backdrop-filter` |
| `--xh-dialog-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-dialog-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-dialog-drag-trigger-min-h` | `drag-trigger` | `min-block-size` | `default` | `--xh-space-6` |
| `--xh-dialog-drag-trigger-radius` | `drag-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-dialog-fg` | `content` | `color` | `default` | `--xh-material-elevated-fg` |
| `--xh-dialog-footer-gap` | `footer` | `gap` | `default` | `--xh-control-gap-md` |
| `--xh-dialog-footer-pt` | `footer` | `padding-block-start` | `default` | `--xh-space-2` |
| `--xh-dialog-footer-px` | `content`<br>`footer` | `padding-inline` | `has([data-scope='dialog'][data-part='body'])` | `--xh-overlay-sheet-px` |
| `--xh-dialog-footer-py` | `content`<br>`footer` | `padding-block` | `has([data-scope='dialog'][data-part='body'])` | `--xh-overlay-sheet-footer-py` |
| `--xh-dialog-gap` | `content` | `gap` | `default` | `--xh-stack-gap-md` |
| `--xh-dialog-header-gap` | `header` | `gap` | `default` | `--xh-stack-gap-sm` |
| `--xh-dialog-header-pb` | `content`<br>`header` | `padding-block-end` | `default`<br>`has([data-scope='dialog'][data-part='body'])` | `--xh-_dialog-header-pb`<br>`--xh-space-2` |
| `--xh-dialog-header-pt` | `content`<br>`header` | `padding-block-start` | `has([data-scope='dialog'][data-part='body'])` | `--xh-_dialog-header-pt` |
| `--xh-dialog-header-px` | `content`<br>`header` | `padding-inline` | `has([data-scope='dialog'][data-part='body'])` | `--xh-overlay-sheet-px` |
| `--xh-dialog-icon-size` | `close-trigger`<br>`content`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-xs` |
| `--xh-dialog-indicator-bg` | `indicator` | `background` | `default` | `--xh-_tone-subtle` |
| `--xh-dialog-indicator-fg` | `indicator` | `color` | `default` | `--xh-_tone-fg` |
| `--xh-dialog-indicator-mark-size` | `indicator` | `--xh-icon-size` | `default` | `--xh-dialog-indicator-size` |
| `--xh-dialog-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-dialog-indicator-size` | `indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` |
| `--xh-dialog-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-dialog-max-w` | `content` | `max-inline-size` | `default` | `--xh-_dialog-max-w` |
| `--xh-dialog-positioner-padding` | `positioner` | `padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default` | `--xh-space-4` |
| `--xh-dialog-px` | `content` | `padding-inline` | `default` | `--xh-overlay-sheet-px` |
| `--xh-dialog-py` | `content` | `padding-block-end`<br>`padding-block-start` | `default` | `--xh-_dialog-header-pt`<br>`--xh-overlay-sheet-body-py` |
| `--xh-dialog-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-dialog-separator` | `content`<br>`footer`<br>`header` | `border-block-end`<br>`border-block-start` | `has([data-scope='dialog'][data-part='body'])`<br>`has([data-scope='dialog'][data-part='footer'])` | `--xh-material-elevated-separator` |
| `--xh-dialog-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` |
| `--xh-dialog-title-fg` | `title` | `color` | `default` | `--xh-fg-default` |
| `--xh-dialog-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` |
| `--xh-dialog-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` |
