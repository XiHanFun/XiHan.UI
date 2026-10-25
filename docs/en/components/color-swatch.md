# ColorSwatch

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/color-swatch).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-swatch" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-swatch.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-swatch" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-swatch" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-swatch.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="color-swatch"`: **`root`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-color-swatch>` |
| Vue components | `XhColorSwatch` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/color-swatch.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `label` | `string` |  |
| `size` | `Size` |  |
| `value` | `string` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string` |
| `valid` | `boolean` |
| `rgba` | `ColorRgba` |
| `css` | `string` |
| `getRootProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-hidden` | undefined \| 'true' |
| `root` | `aria-label` | props.label |
| `root` | `role` | 'img' \| undefined |

## Style reference

### Skin

`@xihan-ui/styles/color-swatch.css` is written against `[data-scope="color-swatch"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-color-swatch` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-value` | value \|\| undefined |
| `root` | `data-xh-swatch` | '' |
| `root` | `data-xh-swatch-size` | props.size |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-color-swatch-border` | `root` | `--xh-swatch-border` | `default` | `--xh-border-default` |
| `--xh-color-swatch-border-invalid` | `root` | `--xh-swatch-border` | `invalid` | `--xh-border-invalid` |
| `--xh-color-swatch-radius` | `root` | `--xh-swatch-radius` | `default` | `--xh-shape-inset` |
| `--xh-color-swatch-size` | `root` | `--xh-swatch-size` | `default` | `--xh-_swatch-size` |
