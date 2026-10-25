# Separator

Layout component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/separator).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/separator" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/separator.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/separator" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/separator" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/separator.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="separator"`: **`root`** · `line` · `content`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-separator>` |
| Vue components | `XhSeparator` `XhSeparatorContent` `XhSeparatorLine` `XhSeparatorRoot` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/separator.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `align` | `SeparatorAlign` |  |
| `dashed` | `boolean` |  |
| `decorative` | `boolean` |  |
| `orientation` | `'horizontal' \| 'vertical'` |  |
| `variant` | `SeparatorVariant` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getLineProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/separator/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-hidden` | 'true' \| undefined |
| `root` | `aria-orientation` | 'vertical' \| undefined |
| `root` | `role` | 'none' \| 'separator' |
| `line` | `role` | 'none' |

## Style reference

### Skin

`@xihan-ui/styles/separator.css` is written against `[data-scope="separator"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-separator` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-dashed` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-variant` | props.variant |
| `line` | `data-orientation` | props.orientation |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-separator-align-length` | `line`<br>`root` | `flex` | `align=end`<br>`align=start`<br>`first-child`<br>`last-child` | `--xh-space-6` |
| `--xh-separator-color` | `line`<br>`root` | `background` | `dashed`<br>`default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`variant=strong`<br>`variant=subtle` | `--xh-border-default`<br>`--xh-border-strong`<br>`--xh-material-soft-separator` |
| `--xh-separator-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-separator-content-font-size` | `content` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-separator-content-font-weight` | `content` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-separator-dash-gap` | `line`<br>`root` | `background` | `dashed`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1_5` |
| `--xh-separator-dash-length` | `line`<br>`root` | `background` | `dashed`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1_5` |
| `--xh-separator-gap` | `root` | `gap` | `has([data-part='content'])` | `--xh-space-4` |
| `--xh-separator-mx` | `root` | `margin-inline` | `orientation=vertical` | `--xh-space-3` |
| `--xh-separator-my` | `root` | `margin-block` | `has([data-part='content'])`<br>`orientation=horizontal` | `--xh-space-2_5`<br>`--xh-space-5` |
| `--xh-separator-radius` | `line`<br>`root` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-separator-thickness` | `line`<br>`root` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thin` |
