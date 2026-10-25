# Masonry

Layout component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/masonry).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/masonry" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/masonry.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/masonry" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/masonry" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/masonry.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="masonry"`: **`root`** · **`column`** · `item`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-masonry>` |
| Vue components | `XhMasonry` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/masonry.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `columns` | `MasonryColumns` |  |
| `gap` | `MasonryGap` |  |
| `sequential` | `boolean` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getColumnProps` | `(props: MasonryColumnProps) => T['element']` |
| `getItemProps` | `(props: MasonryItemProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/masonry.css` is written against `[data-scope="masonry"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-masonry` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-gap` | props.gap |
| `root` | `data-sequential` | '' (present only while the condition holds) |
| `column` | `data-index` | String(column.index) |
| `item` | `data-column` | String(item.column) |
| `item` | `data-index` | String(item.index) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-masonry-gap` | `column`<br>`root` | `gap` | `default`<br>`gap=lg`<br>`gap=md`<br>`gap=sm`<br>`gap=xl`<br>`gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs`<br>`--xh-space-0` |
