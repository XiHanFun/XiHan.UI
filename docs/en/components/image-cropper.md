# ImageCropper

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/image-cropper).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/image-cropper" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/image-cropper.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/image-cropper" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/image-cropper" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/image-cropper.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="image-cropper"`: **`root`** · **`viewport`** · **`image`** · **`crop-area`** · `crop-handle` · `grid` · `zoom-slider` · `rotate-slider` · `flip-trigger` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-image-cropper>` |
| Vue components | `XhImageCropperCropArea` `XhImageCropperCropHandle` `XhImageCropperFlipTrigger` `XhImageCropperGrid` `XhImageCropperHiddenInput` `XhImageCropperImage` `XhImageCropperRoot` `XhImageCropperRotateSlider` `XhImageCropperViewport` `XhImageCropperZoomSlider` |
| Composable | `useImageCropper` |
| State machine | `imageCropperMachine` |
| Skin | `@xihan-ui/styles/image-cropper.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `src` | `string` |  |
| `alt` | `string` |  |
| `aspectRatio` | `number \| null` |  |
| `value` | `ImageCropperRect` |  |
| `defaultValue` | `ImageCropperRect` |  |
| `minWidth` | `number` |  |
| `minHeight` | `number` |  |
| `zoom` | `number` |  |
| `defaultZoom` | `number` |  |
| `minZoom` | `number` |  |
| `maxZoom` | `number` |  |
| `zoomStep` | `number` |  |
| `rotation` | `number` |  |
| `defaultRotation` | `number` |  |
| `minRotation` | `number` |  |
| `maxRotation` | `number` |  |
| `rotationStep` | `number` |  |
| `flip` | `ImageCropperFlip` |  |
| `defaultFlip` | `ImageCropperFlip` |  |
| `shape` | `ImageCropperShape` |  |
| `ariaLabel` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `name` | `string` |  |
| `translations` | `Partial<ImageCropperTranslations>` |  |
| `onValueChange` | `(details: ImageCropperValueChangeDetails) => void` |  |
| `onValueChangeEnd` | `(details: ImageCropperValueChangeEndDetails) => void` |  |
| `onZoomChange` | `(details: ImageCropperZoomChangeDetails) => void` |  |
| `onRotationChange` | `(details: ImageCropperRotationChangeDetails) => void` |  |
| `onFlipChange` | `(details: ImageCropperFlipChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `ImageCropperValueChangeDetails` |
| `value-change-end` | `ImageCropperValueChangeEndDetails` |
| `zoom-change` | `ImageCropperZoomChangeDetails` |
| `rotation-change` | `ImageCropperRotationChangeDetails` |
| `flip-change` | `ImageCropperFlipChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhImageCropperRoot` | `default` | `ImageCropperRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhImageCropperCropHandle` | `position` | `ImageCropperHandlePosition` | Yes |
| `XhImageCropperFlipTrigger` | `axis` | `ImageCropperFlipAxis` | Yes |
| `XhImageCropperRoot` | `children` | `SlotChildren<ImageCropperRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `flip-trigger` | 'on' \| 'off' |

The following names are internal to the state machine.

**States**: `dragging` · `idle` · `resizing`

**Events**: `VALUE.SET` · `ZOOM.SET` · `ROTATE.SET` · `FLIP.SET` · `FLIP.TOGGLE` · `IMAGE.LOAD` · `CROP.NUDGE` · `HANDLE.NUDGE` · `DRAG.START` · `RESIZE.START` · `DRAG.MOVE` · `DRAG.END` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `canEdit` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `ImageCropperRect` |
| `zoom` | `number` |
| `rotation` | `number` |
| `flip` | `ImageCropperFlip` |
| `natural` | `ImageCropperSize` |
| `dragging` | `boolean` |
| `resizing` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `getCropRect` | `() => ImageCropperRect` |
| `toCanvas` | `(options?: CropToCanvasOptions) => HTMLCanvasElement \| null` |
| `setValue` | `(next: ImageCropperRect) => void` |
| `setZoom` | `(next: number) => void` |
| `setRotation` | `(next: number) => void` |
| `setFlip` | `(next: ImageCropperFlip) => void` |
| `toggleFlip` | `(axis: ImageCropperFlipAxis) => void` |
| `getRootProps` | `() => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getImageProps` | `() => T['img']` |
| `getCropAreaProps` | `() => T['element']` |
| `getCropHandleProps` | `(props: ImageCropperHandleProps) => T['button']` |
| `getGridProps` | `() => T['element']` |
| `getZoomSliderProps` | `() => T['input']` |
| `getRotateSliderProps` | `() => T['input']` |
| `getFlipTriggerProps` | `(props: ImageCropperFlipTriggerProps) => T['button']` |
| `getHiddenInputProps` | `() => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | `image-cropper.kbd.move` |
| `Shift+ArrowLeft` / `Shift+ArrowRight` / `Shift+ArrowUp` / `Shift+ArrowDown` | `image-cropper.kbd.move-large` |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | `image-cropper.kbd.resize` |
| `Shift+ArrowLeft` / `Shift+ArrowRight` / `Shift+ArrowUp` / `Shift+ArrowDown` | `image-cropper.kbd.resize-large` |
| `Enter` / `Space` | `image-cropper.kbd.flip` |
| `Enter` / `Space` | `image-cropper.kbd.flip-press` |
| `Tab` / `Shift+Tab` | `image-cropper.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `crop-area` | `aria-disabled` | 'true' \| 'false' |
| `crop-area` | `aria-label` | props.ariaLabel |
| `crop-area` | `role` | 'application' |
| `crop-handle` | `aria-disabled` | 'true' \| 'false' |
| `crop-handle` | `aria-label` | label.handle(position) |
| `crop-handle` | `aria-valuemax` | String(HANDLE_AXIS[position] === 'width' ? natural.wi… |
| `crop-handle` | `aria-valuemin` | String(HANDLE_AXIS[position] === 'width' ? minWidth :… |
| `crop-handle` | `aria-valuenow` | String(HANDLE_AXIS[position] === 'width' ? value.widt… |
| `crop-handle` | `aria-valuetext` | label.valueText({ ...value }) |
| `crop-handle` | `role` | 'slider' |
| `grid` | `aria-hidden` | 'true' |
| `zoom-slider` | `aria-label` | label.zoomSlider |
| `rotate-slider` | `aria-label` | label.rotateSlider |
| `flip-trigger` | `aria-label` | label.flip(axis) |
| `flip-trigger` | `aria-pressed` | 'true' \| 'false' |

## Style reference

### Skin

`@xihan-ui/styles/image-cropper.css` is written against `[data-scope="image-cropper"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-image-cropper` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-resizing` | '' (present only while the condition holds) |
| `root` | `data-shape` | props.shape |
| `viewport` | `data-disabled` | '' (present only while the condition holds) |
| `viewport` | `data-dragging` | '' (present only while the condition holds) |
| `viewport` | `data-readonly` | '' (present only while the condition holds) |
| `viewport` | `data-resizing` | '' (present only while the condition holds) |
| `crop-area` | `data-disabled` | '' (present only while the condition holds) |
| `crop-area` | `data-dragging` | '' (present only while the condition holds) |
| `crop-area` | `data-readonly` | '' (present only while the condition holds) |
| `crop-area` | `data-resizing` | '' (present only while the condition holds) |
| `crop-area` | `data-shape` | props.shape |
| `crop-handle` | `data-disabled` | '' (present only while the condition holds) |
| `crop-handle` | `data-position` | position |
| `crop-handle` | `data-readonly` | '' (present only while the condition holds) |
| `crop-handle` | `data-resizing` | '' (present only while the condition holds) |
| `grid` | `data-shape` | props.shape |
| `zoom-slider` | `data-disabled` | '' (present only while the condition holds) |
| `rotate-slider` | `data-disabled` | '' (present only while the condition holds) |
| `flip-trigger` | `data-axis` | axis |
| `flip-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `flip-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `flip-trigger` | `data-state` | 'on' \| 'off' |
| `flip-trigger` | `data-xh-action-control` | '' |
| `flip-trigger` | `data-xh-action-display` | 'always' |
| `flip-trigger` | `data-xh-action-profile` | 'text' |
| `flip-trigger` | `data-xh-action-size` | 'sm' |
| `flip-trigger` | `data-xh-action-variant` | 'outline' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-image-cropper-bg` | `viewport` | `background` | `default` | `--xh-bg-muted` |
| `--xh-image-cropper-crop-area-radius` | `crop-area` | `border-radius` | `shape=round` | `--xh-shape-circle` |
| `--xh-image-cropper-crop-border` | `crop-area` | `border-color` | `default` | `--xh-bg-surface` |
| `--xh-image-cropper-grid-line` | `grid` | `background-image` | `default` | `--xh-bg-subtle-opaque` |
| `--xh-image-cropper-handle-bg` | `crop-handle` | `background`<br>`border` | `default`<br>`is([data-position='nw'], [data-position='ne'], [data-position='sw'], [data-position='se'])`<br>`position=ne`<br>`position=nw`<br>`position=se`<br>`position=sw` | `--xh-bg-surface` |
| `--xh-image-cropper-handle-bg-hover` | `crop-handle` | `background`<br>`border` | `disabled`<br>`hover`<br>`is([data-position='nw'], [data-position='ne'], [data-position='sw'], [data-position='se'])`<br>`not([data-disabled], [data-readonly])`<br>`position=ne`<br>`position=nw`<br>`position=se`<br>`position=sw`<br>`readonly` | `--xh-bg-subtle-opaque` |
| `--xh-image-cropper-handle-bg-resizing` | `crop-handle` | `background`<br>`border` | `is([data-position='nw'], [data-position='ne'], [data-position='sw'], [data-position='se'])`<br>`position=ne`<br>`position=nw`<br>`position=se`<br>`position=sw`<br>`resizing` | `--xh-bg-brand` |
| `--xh-image-cropper-handle-border` | `crop-handle` | `border` | `is([data-position='nw'], [data-position='ne'], [data-position='sw'], [data-position='se'])`<br>`position=ne`<br>`position=nw`<br>`position=se`<br>`position=sw` | `--xh-_image-cropper-handle-color` |
| `--xh-image-cropper-handle-length` | `crop-handle` | `block-size`<br>`inline-size` | `is([data-position='e'], [data-position='w'])`<br>`is([data-position='n'], [data-position='s'])`<br>`position=e`<br>`position=n`<br>`position=s`<br>`position=w` | `--xh-space-8` |
| `--xh-image-cropper-handle-radius` | `crop-handle` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-image-cropper-handle-size` | `crop-handle`<br>`root` | `block-size`<br>`inline-size`<br>`inset` | `default`<br>`is([data-position='nw'], [data-position='ne'], [data-position='sw'], [data-position='se'])`<br>`position=ne`<br>`position=nw`<br>`position=se`<br>`position=sw` | `--xh-control-indicator-size` |
| `--xh-image-cropper-handle-thickness` | `crop-handle` | `block-size`<br>`border-block-end-width`<br>`border-block-start-width`<br>`border-inline-end-width`<br>`border-inline-start-width`<br>`inline-size` | `is([data-position='e'], [data-position='w'])`<br>`is([data-position='n'], [data-position='s'])`<br>`position=e`<br>`position=n`<br>`position=ne`<br>`position=nw`<br>`position=s`<br>`position=se`<br>`position=sw`<br>`position=w` | `--xh-stroke-strong` |
| `--xh-image-cropper-mask` | `crop-area` | `box-shadow` | `default` | `--xh-bg-overlay` |
| `--xh-image-cropper-slider-accent` | `rotate-slider`<br>`zoom-slider` | `accent-color` | `default` | `--xh-bg-brand` |
| `--xh-image-cropper-slider-w` | `rotate-slider`<br>`zoom-slider` | `inline-size` | `default` | `100%` |
| `--xh-image-cropper-viewport-radius` | `viewport` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-image-cropper-w` | `root` | `inline-size` | `default` | `100%` |
