# Grid

Layout component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/grid).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/grid" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/grid.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/grid" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/grid" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/grid.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="grid"`: **`root`** · `item`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-grid>` |
| Vue components | `XhGridItem` `XhGridRoot` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/grid.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `align` | `GridAlign` |  |
| `cols` | `GridCols` |  |
| `columnGap` | `GridGap` |  |
| `gap` | `GridGap` |  |
| `justifyItems` | `GridJustifyItems` |  |
| `minColWidth` | `GridMinColWidth` |  |
| `rowGap` | `GridGap` |  |
| `rows` | `GridRowCount` |  |
| `ruled` | `boolean` |  |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhGridItem` | `span` | `GridColumnCount \| string \| GridSpanByBreakpoint` |  |
| `XhGridItem` | `offset` | `GridColumnOffset \| string \| GridOffsetByBreakpoint` |  |
| `XhGridItem` | `rowSpan` | `GridRowCount \| string \| GridRowSpanByBreakpoint` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getItemProps` | `(props?: GridItemProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/grid.css` is written against `[data-scope="grid"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-grid` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-cols` | cols.base |
| `root` | `data-cols-lg` | cols.lg |
| `root` | `data-cols-md` | cols.md |
| `root` | `data-cols-sm` | cols.sm |
| `root` | `data-cols-xl` | cols.xl |
| `root` | `data-column-gap` | props.columnGap |
| `root` | `data-gap` | props.gap |
| `root` | `data-justify-items` | props.justifyItems |
| `root` | `data-min-col` | props.minColWidth |
| `root` | `data-row-gap` | props.rowGap |
| `root` | `data-rows` | tier(props.rows, MAX_COLUMN_COUNT) |
| `root` | `data-split` | '' (present only while the condition holds) |
| `item` | `data-offset` | offset.base |
| `item` | `data-offset-lg` | offset.lg |
| `item` | `data-offset-md` | offset.md |
| `item` | `data-offset-sm` | offset.sm |
| `item` | `data-offset-xl` | offset.xl |
| `item` | `data-row-span` | rowSpan.base |
| `item` | `data-row-span-lg` | rowSpan.lg |
| `item` | `data-row-span-md` | rowSpan.md |
| `item` | `data-row-span-sm` | rowSpan.sm |
| `item` | `data-row-span-xl` | rowSpan.xl |
| `item` | `data-span` | span.base |
| `item` | `data-span-lg` | span.lg |
| `item` | `data-span-md` | span.md |
| `item` | `data-span-sm` | span.sm |
| `item` | `data-span-xl` | span.xl |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-grid-column-gap` | `root` | `column-gap` | `column-gap=lg`<br>`column-gap=md`<br>`column-gap=sm`<br>`column-gap=xl`<br>`column-gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs` |
| `--xh-grid-columns` | `root` | `grid-template-columns` | `default`<br>`min-col` | `--xh-_grid-col-min`<br>`--xh-_grid-cols` |
| `--xh-grid-divider` | `item`<br>`root` | `border`<br>`border-block-end`<br>`border-inline-end` | `split` | `--xh-border-default` |
| `--xh-grid-gap` | `root` | `gap` | `default`<br>`gap=lg`<br>`gap=md`<br>`gap=sm`<br>`gap=xl`<br>`gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs`<br>`--xh-space-0` |
| `--xh-grid-row-gap` | `root` | `row-gap` | `row-gap=lg`<br>`row-gap=md`<br>`row-gap=sm`<br>`row-gap=xl`<br>`row-gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs` |
| `--xh-grid-rows` | `root` | `grid-template-rows` | `rows` | `--xh-_grid-rows` |
| `--xh-grid-ruled-padding` | `item`<br>`root` | `padding` | `split` | `--xh-space-1_5` |
