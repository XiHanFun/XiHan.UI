# Highlight

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/highlight).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/highlight" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/highlight.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/highlight" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/highlight" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/highlight.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="highlight"`: **`root`** · `mark`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-highlight>` |
| Vue components | `XhHighlight` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/highlight.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `caseSensitive` | `boolean` |  |
| `keyword` | `string \| readonly string[]` |  |
| `text` | `string` |  |
| `tone` | `Tone` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `text` | `string` |
| `segments` | `readonly HighlightSegment[]` |
| `getRootProps` | `() => T['element']` |
| `getMarkProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/highlight.css` is written against `[data-scope="highlight"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-highlight` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-case-sensitive` | '' (present only while the condition holds) |
| `root` | `data-tone` | props.tone |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-highlight-mark-bg` | `mark`<br>`root` | `background` | `default`<br>`tone` | `--xh-_tone-subtle`<br>`--xh-bg-mark` |
| `--xh-highlight-mark-fg` | `mark`<br>`root` | `color` | `default`<br>`tone` | `--xh-_tone-fg`<br>`--xh-fg-default` |
| `--xh-highlight-mark-font-weight` | `mark` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-highlight-mark-px` | `mark` | `padding-inline` | `default` | `--xh-space-0_5` |
| `--xh-highlight-mark-radius` | `mark` | `border-radius` | `default` | `--xh-shape-inset` |
