# Watermark

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/watermark).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/watermark" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/watermark.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/watermark" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/watermark" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/watermark.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="watermark"`: **`root`** · `content`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-watermark>` |
| Vue components | `XhWatermarkContent` `XhWatermarkRoot` |
| State machine | `watermarkMachine` |
| Skin | `@xihan-ui/styles/watermark.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `fontFamily` | `string` |  |
| `fontSize` | `number` |  |
| `fullscreen` | `boolean` |  |
| `gap` | `number` |  |
| `image` | `string` |  |
| `imageSize` | `WatermarkImageSize` |  |
| `opacity` | `number` |  |
| `rotate` | `number` |  |
| `text` | `string \| string[]` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `IMAGE.LOADED` · `IMAGE.CLEAR`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `lines` | `readonly string[]` |
| `tile` | `WatermarkTile` |
| `image` | `string` |
| `state` | `WatermarkState` |
| `fullscreen` | `boolean` |
| `getRootProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/watermark.css` is written against `[data-scope="watermark"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-watermark` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-watermark-fg` | `root` | `background-color` | `state=ready` | `--xh-fg-muted` |
| `--xh-watermark-image` | `root` | `-webkit-mask-image`<br>`mask-image` | `state=ready` | `none` |
| `--xh-watermark-layer` | `root` | `z-index` | `fullscreen`<br>`state=ready` | `--xh-layer-tooltip` |
| `--xh-watermark-tile` | `root` | `-webkit-mask-size`<br>`mask-size` | `state=ready` | `auto` |
