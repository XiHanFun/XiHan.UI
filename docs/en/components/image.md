# Image

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/image).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/image" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/image.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/image" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/image" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/image.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="image"`: **`root`** · **`image`** · `placeholder` · `fallback`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-image>` |
| Vue components | `XhImageFallback` `XhImageImage` `XhImagePlaceholder` `XhImageRoot` |
| Composable | `useImage` |
| State machine | `imageMachine` |
| Skin | `@xihan-ui/styles/image.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `src` | `string` |  |
| `alt` | `string` |  |
| `fallbackDelay` | `number` |  |
| `onStatusChange` | `(details: ImageStatusChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `status-change` | `ImageStatusChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhImageRoot` | `default` | `ImageRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhImageRoot` | `children` | `SlotChildren<ImageRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `image` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `placeholder` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `fallback` | 'idle' \| 'loading' \| 'loaded' \| 'error' |

The following names are internal to the state machine.

**States**: `idle` · `loading` · `loaded` · `error`

**Events**: `SRC.CHANGE` · `IMAGE.LOAD` · `IMAGE.ERROR` · `after.fallbackDelay` · `PART.RENDERED`

**Guards**: `hasSrc`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `status` | `ImageStatus` |
| `loaded` | `boolean` |
| `showFallback` | `boolean` |
| `showPlaceholder` | `boolean` |
| `getRootProps` | `() => T['element']` |
| `getImageProps` | `() => T['img']` |
| `getPlaceholderProps` | `() => T['element']` |
| `getFallbackProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `placeholder` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/image.css` is written against `[data-scope="image"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-image` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-state` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `image` | `data-state` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `placeholder` | `data-state` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `fallback` | `data-state` | 'idle' \| 'loading' \| 'loaded' \| 'error' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-image-bg` | `root` | `background` | `default` | `--xh-bg-subtle` |
| `--xh-image-fallback-bg` | `fallback` | `background` | `default` | `--xh-bg-subtle-opaque` |
| `--xh-image-fallback-fg` | `fallback` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-image-fallback-font-size` | `fallback` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-image-fallback-min-h` | `fallback` | `min-block-size` | `default` | `--xh-control-h-lg` |
| `--xh-image-fallback-px` | `fallback` | `padding-inline` | `default` | `--xh-space-4` |
| `--xh-image-fallback-py` | `fallback` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-image-fit` | `image` | `object-fit` | `default` | `cover` |
| `--xh-image-h` | `root` | `block-size` | `default` | `auto` |
| `--xh-image-placeholder-bg` | `placeholder` | `background` | `default` | `--xh-bg-subtle-opaque` |
| `--xh-image-placeholder-fg` | `placeholder` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-image-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-image-ratio` | `root` | `aspect-ratio` | `default` | `auto` |
| `--xh-image-w` | `root` | `inline-size` | `default` | `100%` |
