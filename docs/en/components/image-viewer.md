# ImageViewer

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/image-viewer).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/image-viewer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/image-viewer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/image-viewer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/image-viewer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/image-viewer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="image-viewer"`: `trigger` · `backdrop` · `positioner` · **`content`** · `viewport` · **`image`** · `toolbar` · `zoom-in-trigger` · `zoom-out-trigger` · `rotate-left-trigger` · `rotate-right-trigger` · `flip-horizontal-trigger` · `flip-vertical-trigger` · `reset-trigger` · `prev-trigger` · `next-trigger` · `counter` · `close-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-image-viewer>` |
| Vue components | `XhImageViewerCloseTrigger` `XhImageViewerContent` `XhImageViewerCounter` `XhImageViewerFlipHorizontalTrigger` `XhImageViewerFlipVerticalTrigger` `XhImageViewerImage` `XhImageViewerNextTrigger` `XhImageViewerPrevTrigger` `XhImageViewerResetTrigger` `XhImageViewerRoot` `XhImageViewerRotateLeftTrigger` `XhImageViewerRotateRightTrigger` `XhImageViewerToolbar` `XhImageViewerTrigger` `XhImageViewerViewport` `XhImageViewerZoomInTrigger` `XhImageViewerZoomOutTrigger` |
| Composable | `useImageViewer` |
| State machine | `imageViewerMachine` |
| Skin | `@xihan-ui/styles/image-viewer.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `ImageViewerItem[]` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `index` | `number` |  |
| `defaultIndex` | `number` |  |
| `loop` | `boolean` |  |
| `zoomStep` | `number` |  |
| `minScale` | `number` |  |
| `maxScale` | `number` |  |
| `closeOnEscape` | `boolean` |  |
| `closeOnInteractOutside` | `boolean` |  |
| `restoreFocus` | `boolean` |  |
| `variant` | `OverlayBackdropVariant` |  |
| `size` | `Size` |  |
| `translations` | `Partial<ImageViewerTranslations>` |  |
| `onOpenChange` | `(details: ImageViewerOpenChangeDetails) => void` |  |
| `onIndexChange` | `(details: ImageViewerIndexChangeDetails) => void` |  |

### ImageViewerItem

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `src` | `string` | Yes |
| `alt` | `string` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `ImageViewerOpenChangeDetails` |
| `index-change` | `ImageViewerIndexChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhImageViewerRoot` | `default` | `ImageViewerRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhImageViewerContent` | `container` | `() => Element \| null` |  |
| `XhImageViewerRoot` | `children` | `SlotChildren<ImageViewerRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `viewport` | 'open' \| 'closed' |
| `image` | 'open' \| 'closed' |
| `toolbar` | 'open' \| 'closed' |
| `counter` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `CLOSE` · `INDEX.SET` · `INDEX.NEXT` · `INDEX.PREV` · `ZOOM.BY` · `ZOOM.SET` · `ROTATE.BY` · `FLIP` · `TRANSFORM.RESET` · `IMAGE.LOAD` · `IMAGE.ERROR` · `PAN.MOVE` · `POINTERS.DOWN` · `POINTERS.CHANGE` · `POINTERS.END` · `PAN.END` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

**Guards**: `isOpenControlled` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `index` | `number` |
| `count` | `number` |
| `currentItem` | `ImageViewerItem \| null` |
| `transform` | `ImageViewerTransform` |
| `panning` | `boolean` |
| `imageStatus` | `ImageViewerImageStatus` |
| `canPrev` | `boolean` |
| `canNext` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `setIndex` | `(next: number) => void` |
| `next` | `() => void` |
| `prev` | `() => void` |
| `zoomIn` | `() => void` |
| `zoomOut` | `() => void` |
| `setScale` | `(scale: number) => void` |
| `rotateLeft` | `() => void` |
| `rotateRight` | `() => void` |
| `flipHorizontal` | `() => void` |
| `flipVertical` | `() => void` |
| `reset` | `() => void` |
| `getTriggerProps` | `() => T['button']` |
| `getBackdropProps` | `() => T['element']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getImageProps` | `() => T['img']` |
| `getToolbarProps` | `() => T['element']` |
| `getZoomInTriggerProps` | `() => T['button']` |
| `getZoomOutTriggerProps` | `() => T['button']` |
| `getRotateLeftTriggerProps` | `() => T['button']` |
| `getRotateRightTriggerProps` | `() => T['button']` |
| `getFlipHorizontalTriggerProps` | `() => T['button']` |
| `getFlipVerticalTriggerProps` | `() => T['button']` |
| `getResetTriggerProps` | `() => T['button']` |
| `getPrevTriggerProps` | `() => T['button']` |
| `getNextTriggerProps` | `() => T['button']` |
| `getCounterProps` | `() => T['element']` |
| `getCloseTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `image-viewer.kbd.open-on-trigger` |
| `Escape` | `image-viewer.kbd.escape` |
| `Tab` | `image-viewer.kbd.tab` |
| `Shift+Tab` | `image-viewer.kbd.shift-tab` |
| `ArrowLeft` | `image-viewer.kbd.prev` |
| `ArrowRight` | `image-viewer.kbd.next` |
| `Home` | `image-viewer.kbd.first` |
| `End` | `image-viewer.kbd.last` |
| `+` / `=` | `image-viewer.kbd.zoom-in` |
| `-` | `image-viewer.kbd.zoom-out` |
| `0` | `image-viewer.kbd.reset` |
| `Enter` / `Space` | `image-viewer.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `backdrop` | `aria-hidden` | 'true' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | currentItem?.alt |
| `content` | `aria-modal` | 'true' |
| `content` | `role` | 'dialog' |
| `viewport` | `aria-busy` | imageStatus === 'loading' \|\| undefined |
| `toolbar` | `aria-label` | label.toolbar |
| `toolbar` | `role` | 'group' |
| `counter` | `aria-live` | 'polite' |

## Style reference

### Skin

`@xihan-ui/styles/image-viewer.css` is written against `[data-scope="image-viewer"][data-part="trigger"]` part selectors; the published build uses the mount class `.xh-scope-image-viewer` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-instant` | '' (present only while the condition holds) |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-xh-backdrop` | undefined \| 'dark' |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-xh-ink` | 'light' |
| `viewport` | `data-dragging` | '' (present only while the condition holds) |
| `viewport` | `data-error` | '' (present only while the condition holds) |
| `viewport` | `data-loading` | '' (present only while the condition holds) |
| `viewport` | `data-state` | 'open' \| 'closed' |
| `viewport` | `data-xh-loading-ring` | '' |
| `image` | `data-animating` | '' (present only while the condition holds) |
| `image` | `data-dragging` | '' (present only while the condition holds) |
| `image` | `data-error` | '' (present only while the condition holds) |
| `image` | `data-loading` | '' (present only while the condition holds) |
| `image` | `data-state` | 'open' \| 'closed' |
| `toolbar` | `data-state` | 'open' \| 'closed' |
| `toolbar` | `data-xh-ink-surface` | '' |
| `toolbar` | `data-xh-liquid` | '' |
| `zoom-in-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `zoom-in-trigger` | `data-xh-action-control` | '' |
| `zoom-in-trigger` | `data-xh-action-display` | 'always' |
| `zoom-in-trigger` | `data-xh-action-profile` | 'icon' |
| `zoom-in-trigger` | `data-xh-action-size` | 'xs' |
| `zoom-out-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `zoom-out-trigger` | `data-xh-action-control` | '' |
| `zoom-out-trigger` | `data-xh-action-display` | 'always' |
| `zoom-out-trigger` | `data-xh-action-profile` | 'icon' |
| `zoom-out-trigger` | `data-xh-action-size` | 'xs' |
| `rotate-left-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `rotate-left-trigger` | `data-xh-action-control` | '' |
| `rotate-left-trigger` | `data-xh-action-display` | 'always' |
| `rotate-left-trigger` | `data-xh-action-profile` | 'icon' |
| `rotate-left-trigger` | `data-xh-action-size` | 'xs' |
| `rotate-right-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `rotate-right-trigger` | `data-xh-action-control` | '' |
| `rotate-right-trigger` | `data-xh-action-display` | 'always' |
| `rotate-right-trigger` | `data-xh-action-profile` | 'icon' |
| `rotate-right-trigger` | `data-xh-action-size` | 'xs' |
| `flip-horizontal-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `flip-horizontal-trigger` | `data-xh-action-control` | '' |
| `flip-horizontal-trigger` | `data-xh-action-display` | 'always' |
| `flip-horizontal-trigger` | `data-xh-action-profile` | 'icon' |
| `flip-horizontal-trigger` | `data-xh-action-size` | 'xs' |
| `flip-vertical-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `flip-vertical-trigger` | `data-xh-action-control` | '' |
| `flip-vertical-trigger` | `data-xh-action-display` | 'always' |
| `flip-vertical-trigger` | `data-xh-action-profile` | 'icon' |
| `flip-vertical-trigger` | `data-xh-action-size` | 'xs' |
| `reset-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `reset-trigger` | `data-xh-action-control` | '' |
| `reset-trigger` | `data-xh-action-display` | 'always' |
| `reset-trigger` | `data-xh-action-profile` | 'icon' |
| `reset-trigger` | `data-xh-action-size` | 'xs' |
| `prev-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `prev-trigger` | `data-xh-action-control` | '' |
| `prev-trigger` | `data-xh-action-display` | 'always' |
| `prev-trigger` | `data-xh-action-profile` | 'floating' |
| `prev-trigger` | `data-xh-action-size` | props.size |
| `prev-trigger` | `data-xh-liquid` | '' |
| `next-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `next-trigger` | `data-xh-action-control` | '' |
| `next-trigger` | `data-xh-action-display` | 'always' |
| `next-trigger` | `data-xh-action-profile` | 'floating' |
| `next-trigger` | `data-xh-action-size` | props.size |
| `next-trigger` | `data-xh-liquid` | '' |
| `counter` | `data-count` | String(count) |
| `counter` | `data-index` | String(index + 1) |
| `counter` | `data-state` | 'open' \| 'closed' |
| `counter` | `data-xh-liquid` | '' |
| `close-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'floating' |
| `close-trigger` | `data-xh-action-size` | props.size |
| `close-trigger` | `data-xh-liquid` | '' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-image-viewer-action-bg-active` | `close-trigger`<br>`content`<br>`next-trigger`<br>`prev-trigger`<br>`toolbar` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`material=liquid`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-_liquid-bg-pressed`<br>`--xh-bg-media-chrome-active`<br>`--xh-bg-subtle-hover` |
| `--xh-image-viewer-action-bg-hover` | `close-trigger`<br>`content`<br>`next-trigger`<br>`prev-trigger`<br>`toolbar` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`material=liquid`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-_liquid-bg-hover`<br>`--xh-bg-media-chrome-hover`<br>`--xh-bg-subtle` |
| `--xh-image-viewer-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` |
| `--xh-image-viewer-backdrop-blur` | `backdrop` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` |
| `--xh-image-viewer-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` |
| `--xh-image-viewer-chrome-bg` | `close-trigger`<br>`content`<br>`counter`<br>`next-trigger`<br>`prev-trigger`<br>`toolbar` | `--xh-ink-surface`<br>`background`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`material=liquid`<br>`where([data-material='liquid'])`<br>`xh-ink-surface`<br>`xh-liquid` | `--xh-_liquid-bg`<br>`--xh-bg-media-chrome`<br>`--xh-material-liquid-focus-surface` |
| `--xh-image-viewer-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`material=liquid`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-_image-viewer-chrome-bg-active`<br>`--xh-_liquid-bg-pressed` |
| `--xh-image-viewer-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`material=liquid`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-_image-viewer-chrome-bg-hover`<br>`--xh-_liquid-bg-hover` |
| `--xh-image-viewer-close-fg` | `close-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`material=liquid`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-material-liquid-fg`<br>`currentColor` |
| `--xh-image-viewer-close-radius` | `close-trigger` | `border-radius` | `default`<br>`material=liquid`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-shape-circle` |
| `--xh-image-viewer-close-size` | `close-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=floating`<br>`xh-action-profile=icon` | `--xh-_image-viewer-nav-size` |
| `--xh-image-viewer-counter-padding` | `counter` | `padding` | `default` | `--xh-space-1` |
| `--xh-image-viewer-counter-radius` | `counter` | `border-radius` | `default`<br>`material=liquid`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-image-viewer-overlay-radius` |
| `--xh-image-viewer-error-fg` | `viewport` | `background-color` | `error` | `--xh-fg-danger` |
| `--xh-image-viewer-fg` | `content` | `color` | `default` | `--xh-fg-on-media-chrome` |
| `--xh-image-viewer-icon-size` | `close-trigger`<br>`content`<br>`next-trigger`<br>`prev-trigger`<br>`toolbar` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-_image-viewer-nav-glyph`<br>`--xh-glyph-size-md` |
| `--xh-image-viewer-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-image-viewer-nav-size` | `next-trigger`<br>`prev-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=floating`<br>`xh-action-profile=icon` | `--xh-_image-viewer-nav-size` |
| `--xh-image-viewer-overlay-radius` | `counter`<br>`next-trigger`<br>`prev-trigger`<br>`toolbar` | `border-radius` | `default`<br>`material=liquid`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-_action-profile-radius`<br>`--xh-shape-control`<br>`--xh-shape-pill`<br>`--xh-shape-surface` |
| `--xh-image-viewer-status-size` | `viewport` | `--xh-icon-size` | `default` | `--xh-glyph-size-lg` |
| `--xh-image-viewer-toolbar-bg` | `toolbar` | `--xh-ink-surface`<br>`background` | `default` | `--xh-_image-viewer-page-surface` |
| `--xh-image-viewer-toolbar-gap` | `toolbar` | `gap` | `default` | `--xh-space-1` |
| `--xh-image-viewer-toolbar-padding` | `toolbar` | `padding` | `default` | `--xh-space-1_5` |
| `--xh-image-viewer-toolbar-radius` | `toolbar` | `border-radius` | `default` | `--xh-_action-profile-radius` |
| `--xh-image-viewer-toolbar-radius-outer` | `toolbar` | `border-radius` | `default`<br>`material=liquid`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-image-viewer-overlay-radius` |
