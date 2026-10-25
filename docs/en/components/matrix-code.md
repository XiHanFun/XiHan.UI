# MatrixCode

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/matrix-code).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/matrix-code" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/matrix-code.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/matrix-code" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/matrix-code" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/matrix-code.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="matrix-code"`: **`root`** · `logo`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-matrix-code>` |
| Vue components | `XhMatrixCode` `XhMatrixCodeLogo` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/matrix-code.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `columns` | `number` |  |
| `eyeShape` | `MatrixCodeEyeShape` |  |
| `format` | `MatrixCodeFormat` |  |
| `gs1` | `boolean` |  |
| `label` | `string` |  |
| `level` | `MatrixCodeLevel` |  |
| `logo` | `boolean` |  |
| `margin` | `number` |  |
| `moduleShape` | `MatrixCodeModuleShape` |  |
| `pixelSize` | `number` |  |
| `rectangular` | `boolean` |  |
| `value` | `string` |  |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhMatrixCode` | `children` | `ReactNode` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'empty' |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `format` | `MatrixCodeFormat` |
| `modules` | `readonly (readonly boolean[])[]` |
| `version` | `number` |
| `columns` | `number` |
| `rows` | `number` |
| `margin` | `number` |
| `viewBox` | `string` |
| `path` | `string` |
| `eyePath` | `string` |
| `logoArea` | `MatrixCodeLogoArea \| undefined` |
| `logoDamage` | `MatrixCodeLogoDamage \| undefined` |
| `state` | `MatrixCodeState` |
| `error` | `string \| undefined` |
| `label` | `string \| undefined` |
| `getRootProps` | `() => T['element']` |
| `getLogoProps` | `() => T['element']` |

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

`@xihan-ui/styles/matrix-code.css` is written against `[data-scope="matrix-code"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-matrix-code` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-columns` | undefined \| String(columns) |
| `root` | `data-format` | props.format |
| `root` | `data-level` | 'M' \| String(pdfLevel) \| undefined |
| `root` | `data-logo` | '' (present only while the condition holds) |
| `root` | `data-rows` | undefined \| String(rows) |
| `root` | `data-state` | 'empty' |
| `root` | `data-version` | undefined \| String(version) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-matrix-code-bg` | `root` | `background`<br>`fill` | `default`<br>`xh-geom=logo-clear` | `--xh-color-neutral-0` |
| `--xh-matrix-code-eye-fg` | `root` | `fill` | `xh-geom=eyes` | `currentColor` |
| `--xh-matrix-code-fg` | `root` | `color` | `default` | `--xh-color-neutral-950` |
| `--xh-matrix-code-placeholder-bg` | `root` | `background` | `state=empty`<br>`state=error` | `--xh-bg-subtle` |
| `--xh-matrix-code-placeholder-border` | `root` | `box-shadow` | `state=empty`<br>`state=error` | `--xh-border-default` |
| `--xh-matrix-code-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` |
