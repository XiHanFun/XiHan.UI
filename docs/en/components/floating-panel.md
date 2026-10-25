# FloatingPanel

Overlays component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/floating-panel).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/floating-panel" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/floating-panel.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/floating-panel" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/floating-panel" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/floating-panel.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="floating-panel"`: `root` · `trigger` · **`positioner`** · **`content`** · `header` · `title` · `drag-trigger` · `resize-trigger` · `window-state-trigger` · `close-trigger` · `body`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-floating-panel>` |
| Vue components | `XhFloatingPanelBody` `XhFloatingPanelCloseTrigger` `XhFloatingPanelContent` `XhFloatingPanelDragTrigger` `XhFloatingPanelHeader` `XhFloatingPanelPositioner` `XhFloatingPanelResizeTrigger` `XhFloatingPanelRoot` `XhFloatingPanelTitle` `XhFloatingPanelTrigger` `XhFloatingPanelWindowStateTrigger` |
| Composable | `useFloatingPanel` |
| State machine | `floatingPanelMachine` |
| Skin | `@xihan-ui/styles/floating-panel.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `position` | `FloatingPanelPosition` |  |
| `defaultPosition` | `FloatingPanelPosition` |  |
| `dimensions` | `FloatingPanelSize` |  |
| `defaultDimensions` | `FloatingPanelSize` |  |
| `minSize` | `FloatingPanelSize` |  |
| `maxSize` | `FloatingPanelSize` |  |
| `windowState` | `FloatingPanelWindowState` |  |
| `defaultWindowState` | `FloatingPanelWindowState` |  |
| `draggable` | `boolean` |  |
| `resizable` | `boolean` |  |
| `disabled` | `boolean` |  |
| `parts` | `Pick<TitleDescriptionParts, 'title'>` |  |
| `translations` | `Partial<FloatingPanelTranslations>` |  |
| `onOpenChange` | `(details: FloatingPanelOpenChangeDetails) => void` |  |
| `onPositionChange` | `(details: FloatingPanelPositionChangeDetails) => void` |  |
| `onDimensionsChange` | `(details: FloatingPanelDimensionsChangeDetails) => void` |  |
| `onWindowStateChange` | `(details: FloatingPanelWindowStateChangeDetails) => void` |  |
| `onDragStart` | `(details: FloatingPanelDragStartDetails) => void` |  |
| `onDragEnd` | `(details: FloatingPanelDragEndDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `FloatingPanelOpenChangeDetails` |
| `position-change` | `FloatingPanelPositionChangeDetails` |
| `dimensions-change` | `FloatingPanelDimensionsChangeDetails` |
| `window-state-change` | `FloatingPanelWindowStateChangeDetails` |
| `drag-start` | `FloatingPanelDragStartDetails` |
| `drag-end` | `FloatingPanelDragEndDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhFloatingPanelRoot` | `default` | `FloatingPanelRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhFloatingPanelPositioner` | `container` | `() => Element \| null` |  |
| `XhFloatingPanelResizeTrigger` | `edge` | `FloatingPanelResizeEdge` | Yes |
| `XhFloatingPanelRoot` | `children` | `SlotChildren<FloatingPanelRootSlotProps>` |  |
| `XhFloatingPanelWindowStateTrigger` | `windowState` | `FloatingPanelWindowState` | Yes |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `window-state-trigger` | 'on' \| 'off' |

The following names are internal to the state machine.

**States**: `closed` · `open` · `open.dragging` · `open.idle` · `open.resizing`

**Events**: `OPEN` · `CLOSE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `POSITION.SET` · `POSITION.NUDGE` · `DIMENSIONS.SET` · `DIMENSIONS.NUDGE` · `WINDOW_STATE.SET` · `DRAG.START` · `RESIZE.START` · `DRAG.MOVE` · `DRAG.END` · `PRESS.START` · `PRESS.END` · `WINDOW_STATE.SETTLED` · `WINDOW.RAISE` · `WINDOW.DEPTH`

**Guards**: `canDrag` · `canInteract` · `canResize` · `isOpenControlled` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `windowState` | `FloatingPanelWindowState` |
| `position` | `FloatingPanelPosition` |
| `dimensions` | `FloatingPanelSize` |
| `dragging` | `boolean` |
| `resizing` | `boolean` |
| `disabled` | `boolean` |
| `canDrag` | `boolean` |
| `canResize` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `setPosition` | `(next: FloatingPanelPosition) => void` |
| `setDimensions` | `(next: FloatingPanelSize) => void` |
| `setWindowState` | `(next: FloatingPanelWindowState) => void` |
| `getRootProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getHeaderProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getDragTriggerProps` | `() => T['button']` |
| `getResizeTriggerProps` | `(props: FloatingPanelResizeTriggerProps) => T['element']` |
| `getWindowStateTriggerProps` | `(props: FloatingPanelWindowStateTriggerProps) => T['button']` |
| `getCloseTriggerProps` | `() => T['button']` |
| `getBodyProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Escape` | `floating-panel.kbd.escape` |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | `floating-panel.kbd.move` |
| `Shift+ArrowUp` / `Shift+ArrowDown` / `Shift+ArrowLeft` / `Shift+ArrowRight` | `floating-panel.kbd.move-large` |
| `Enter` / `Space` | `floating-panel.kbd.recenter` |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | `floating-panel.kbd.resize` |
| `Shift+ArrowUp` / `Shift+ArrowDown` / `Shift+ArrowLeft` / `Shift+ArrowRight` | `floating-panel.kbd.resize-large` |
| `Enter` / `Space` | `floating-panel.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-labelledby` | id of the `title` part \| undefined |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `drag-trigger` | `aria-disabled` | 'false' \| 'true' |
| `drag-trigger` | `aria-label` | label.dragTrigger |
| `resize-trigger` | `aria-controls` | id of the `content` part |
| `resize-trigger` | `aria-disabled` | 'false' \| 'true' |
| `resize-trigger` | `aria-label` | label.resizeTrigger(item.edge) |
| `resize-trigger` | `aria-orientation` | 'vertical' \| 'horizontal' |
| `resize-trigger` | `aria-valuemax` | String(Math.round(valueMax)) \| undefined |
| `resize-trigger` | `aria-valuemin` | String(Math.round(horizontal ? minSize.width : minSiz… |
| `resize-trigger` | `aria-valuenow` | String(Math.round(horizontal ? dimensions.width : dim… |
| `resize-trigger` | `aria-valuetext` | label.resizeValueText(dimensions) |
| `resize-trigger` | `role` | 'separator' |
| `window-state-trigger` | `aria-disabled` | 'true' \| 'false' |
| `window-state-trigger` | `aria-label` | label.windowStateTrigger(item.windowState) |
| `window-state-trigger` | `aria-pressed` | 'true' \| 'false' |
| `close-trigger` | `aria-label` | label.close |

## Style reference

### Skin

`@xihan-ui/styles/floating-panel.css` is written against `[data-scope="floating-panel"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-floating-panel` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-resizing` | '' (present only while the condition holds) |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-window-state` | context.get('windowState') |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `positioner` | `data-animating` | '' (present only while the condition holds) |
| `positioner` | `data-instant` | '' (present only while the condition holds) |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-window-state` | context.get('windowState') |
| `content` | `data-disabled` | '' (present only while the condition holds) |
| `content` | `data-dragging` | '' (present only while the condition holds) |
| `content` | `data-resizing` | '' (present only while the condition holds) |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-window-state` | context.get('windowState') |
| `content` | `data-xh-material` | 'frosted' |
| `header` | `data-dragging` | '' (present only while the condition holds) |
| `header` | `data-window-state` | context.get('windowState') |
| `drag-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `drag-trigger` | `data-dragging` | '' (present only while the condition holds) |
| `resize-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `resize-trigger` | `data-edge` | item.edge |
| `resize-trigger` | `data-resizing` | '' (present only while the condition holds) |
| `window-state-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `window-state-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `window-state-trigger` | `data-state` | 'on' \| 'off' |
| `window-state-trigger` | `data-target-window-state` | item.windowState |
| `window-state-trigger` | `data-xh-action-control` | '' |
| `window-state-trigger` | `data-xh-action-display` | 'always' |
| `window-state-trigger` | `data-xh-action-profile` | 'icon' |
| `window-state-trigger` | `data-xh-action-size` | 'sm' |
| `window-state-trigger` | `data-xh-action-variant` | 'ghost' |
| `close-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |
| `body` | `data-window-state` | context.get('windowState') |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-floating-panel-action-bg-active` | `close-trigger`<br>`window-state-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-floating-panel-action-bg-hover` | `close-trigger`<br>`window-state-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-floating-panel-action-bg-on` | `window-state-trigger` | `--xh-ink-surface`<br>`background-color` | `focus-visible`<br>`state=on`<br>`xh-ink-surface` | `--xh-bg-brand-subtle` |
| `--xh-floating-panel-action-bg-on-active` | `window-state-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-bg-brand-subtle-active` |
| `--xh-floating-panel-action-bg-on-hover` | `window-state-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=on` | `--xh-bg-brand-subtle-hover` |
| `--xh-floating-panel-action-fg` | `close-trigger`<br>`window-state-trigger` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-floating-panel-action-fg-active` | `close-trigger`<br>`window-state-trigger` | `color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-pressed` |
| `--xh-floating-panel-action-fg-hover` | `close-trigger`<br>`window-state-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover` |
| `--xh-floating-panel-action-fg-on` | `window-state-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-fg-on-brand-subtle` |
| `--xh-floating-panel-action-radius` | `window-state-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-floating-panel-action-size` | `window-state-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-floating-panel-bg` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg` |
| `--xh-floating-panel-body-px` | `body` | `padding-inline` | `default` | `--xh-surface-px-sm` |
| `--xh-floating-panel-body-py` | `body` | `padding-block` | `default` | `--xh-surface-py-sm` |
| `--xh-floating-panel-border` | `content` | `border` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border` |
| `--xh-floating-panel-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-floating-panel-close-size` | `close-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-floating-panel-corner-size` | `positioner`<br>`resize-trigger` | `height`<br>`width` | `edge=ne`<br>`edge=nw`<br>`edge=se`<br>`edge=sw` | `--xh-space-4` |
| `--xh-floating-panel-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-floating-panel-handle-size` | `positioner`<br>`resize-trigger` | `height`<br>`width` | `edge=e`<br>`edge=n`<br>`edge=s`<br>`edge=w` | `--xh-space-2` |
| `--xh-floating-panel-header-bg` | `header` | `background` | `default` | `--xh-material-frosted-bg` |
| `--xh-floating-panel-header-border` | `header` | `border-block-end` | `default` | `--xh-material-frosted-separator` |
| `--xh-floating-panel-header-gap` | `header` | `gap` | `default` | `--xh-control-gap-sm` |
| `--xh-floating-panel-header-px` | `header` | `padding-inline` | `default` | `--xh-space-3` |
| `--xh-floating-panel-header-py` | `header` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-floating-panel-icon-size` | `close-trigger`<br>`content`<br>`root`<br>`trigger`<br>`window-state-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` |
| `--xh-floating-panel-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-floating-panel-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-floating-panel-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-floating-panel-title-fg` | `title` | `color` | `default` | `--xh-material-frosted-fg` |
| `--xh-floating-panel-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-floating-panel-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-floating-panel-trigger-bg` | `trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` |
| `--xh-floating-panel-trigger-border` | `trigger` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest` |
| `--xh-floating-panel-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-floating-panel-trigger-h` | `trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-floating-panel-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-floating-panel-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` |
