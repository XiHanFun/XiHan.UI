# BarCode

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/bar-code).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/bar-code" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/bar-code.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/bar-code" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/bar-code" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/bar-code.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="bar-code"`: **`root`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-bar-code>` |
| Vue components | `XhBarCode` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/bar-code.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `barWidth` | `number` |  |
| `bearerBars` | `boolean` |  |
| `checksum` | `boolean` |  |
| `format` | `BarCodeFormat` |  |
| `gs1` | `boolean` |  |
| `height` | `number` |  |
| `label` | `string` |  |
| `margin` | `number` |  |
| `text` | `boolean` |  |
| `value` | `string` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'empty' |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `format` | `BarCodeFormat` |
| `runs` | `readonly number[]` |
| `modules` | `number` |
| `encoded` | `string` |
| `margin` | `number` |
| `pixelWidth` | `number` |
| `pixelHeight` | `number` |
| `viewBox` | `string` |
| `path` | `string` |
| `text` | `readonly BarCodeTextRun[]` |
| `fontSize` | `number` |
| `state` | `BarCodeState` |
| `error` | `string \| undefined` |
| `label` | `string \| undefined` |
| `getRootProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-hidden` | 'true' \| undefined |
| `root` | `aria-label` | undefined \| props.label |
| `root` | `role` | undefined \| 'img' |

## Style reference

### Skin

`@xihan-ui/styles/bar-code.css` is written against `[data-scope="bar-code"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-bar-code` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-format` | props.format |
| `root` | `data-modules` | undefined \| String(modules) |
| `root` | `data-state` | 'empty' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-bar-code-bg` | `root` | `background` | `default` | `--xh-color-neutral-0` |
| `--xh-bar-code-fg` | `root` | `color` | `default` | `--xh-color-neutral-950` |
| `--xh-bar-code-font-family` | `root` | `font-family` | `xh-geom=text` | `--xh-font-family-mono` |
| `--xh-bar-code-placeholder-bg` | `root` | `background` | `state=empty`<br>`state=error` | `--xh-bg-subtle` |
| `--xh-bar-code-placeholder-border` | `root` | `box-shadow` | `state=empty`<br>`state=error` | `--xh-border-default` |
| `--xh-bar-code-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-bar-code-text-fg` | `root` | `fill` | `xh-geom=text` | `currentColor` |
