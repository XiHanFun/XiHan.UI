# HierarchyChart <Badge type="tip" text="new" />

Charts component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/hierarchy-chart).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/hierarchy-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/hierarchy-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/hierarchy-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/hierarchy-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/hierarchy-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="hierarchy-chart"`: **`root`** · `caption` · `path` · `path-item` · `legend` · `legend-scale` · `legend-scale-name` · `legend-scale-bar` · `legend-scale-value` · **`viewport`** · **`plot`** · `node` · `node-label` · `group-header` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table-region` · `table`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-hierarchy-chart>` |
| Vue components | `XhHierarchyChartCaption` `XhHierarchyChartEmpty` `XhHierarchyChartLegend` `XhHierarchyChartPath` `XhHierarchyChartPlot` `XhHierarchyChartRoot` `XhHierarchyChartTooltip` `XhHierarchyChartViewport` |
| Composable | `useHierarchyChart` |
| State machine | `hierarchyChartMachine` |
| Skin | `@xihan-ui/styles/hierarchy-chart.css` |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `root-key-change` | `HierarchyRootKeyChangeDetails` |
| `active-key-change` | `ChartActiveKeyChangeDetails` |
| `datum-active` | `ChartDatumDetails` |
| `datum-press` | `ChartDatumDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhHierarchyChartRoot` | `default` | `HierarchyChartRootSlotProps` |
| `XhHierarchyChartRoot` | `caption` | — |
| `XhHierarchyChartRoot` | `tooltip` | `HierarchyChartTooltipSlotProps` |
| `XhHierarchyChartRoot` | `empty` | — |
| `XhHierarchyChartTooltip` | `default` | `HierarchyChartTooltipSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhHierarchyChartRoot` | `data` | `ChartRow \| readonly ChartRow[]` |  |
| `XhHierarchyChartRoot` | `childrenField` | `string` |  |
| `XhHierarchyChartRoot` | `idField` | `string` |  |
| `XhHierarchyChartRoot` | `parentField` | `string` |  |
| `XhHierarchyChartRoot` | `nameField` | `string` |  |
| `XhHierarchyChartRoot` | `valueField` | `string` |  |
| `XhHierarchyChartRoot` | `layout` | `HierarchyLayout` |  |
| `XhHierarchyChartRoot` | `tile` | `HierarchyTile` |  |
| `XhHierarchyChartRoot` | `depth` | `number` |  |
| `XhHierarchyChartRoot` | `colorBy` | `HierarchyColorBy` |  |
| `XhHierarchyChartRoot` | `palette` | `ChartPalette` |  |
| `XhHierarchyChartRoot` | `orientation` | `'vertical' \| 'horizontal'` |  |
| `XhHierarchyChartRoot` | `rootKey` | `string \| null` |  |
| `XhHierarchyChartRoot` | `defaultRootKey` | `string \| null` |  |
| `XhHierarchyChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  |
| `XhHierarchyChartRoot` | `activeKey` | `ChartKey \| null` |  |
| `XhHierarchyChartRoot` | `pending` | `boolean` |  |
| `XhHierarchyChartRoot` | `animated` | `boolean` |  |
| `XhHierarchyChartRoot` | `locale` | `string` |  |
| `XhHierarchyChartRoot` | `translations` | `Partial<HierarchyChartTranslations>` |  |
| `XhHierarchyChartRoot` | `onRootKeyChange` | `HierarchyChartProps['onRootKeyChange']` |  |
| `XhHierarchyChartRoot` | `onActiveKeyChange` | `HierarchyChartProps['onActiveKeyChange']` |  |
| `XhHierarchyChartRoot` | `onDatumActive` | `HierarchyChartProps['onDatumActive']` |  |
| `XhHierarchyChartRoot` | `onDatumPress` | `HierarchyChartProps['onDatumPress']` |  |
| `XhHierarchyChartRoot` | `caption` | `ReactNode` |  |
| `XhHierarchyChartRoot` | `renderTooltip` | `(props: HierarchyChartTooltipSlotProps) => ReactNode` |  |
| `XhHierarchyChartRoot` | `empty` | `ReactNode` |  |
| `XhHierarchyChartRoot` | `children` | `SlotChildren<HierarchyChartRootSlotProps>` |  |
| `XhHierarchyChartTooltip` | `children` | `SlotChildren<HierarchyChartTooltipSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'error' \| undefined |
| `tooltip` | 'visible' \| 'hidden' |
| `empty` | 'loading' \| undefined |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `ROOT.SET`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `model` | `HierarchyModel` |
| `scene` | `Scene` |
| `overlay` | `HierarchyOverlay` |
| `measured` | `boolean` |
| `empty` | `boolean` |
| `path` | `readonly HierarchyPathItem[]` |
| `legendScales` | `readonly HierarchyLegendScale[]` |
| `rootKey` | `string \| null` |
| `active` | `ChartDatumDetails \| null` |
| `tooltip` | `HierarchyTooltipModel \| null` |
| `summary` | `string` |
| `table` | `TableModel` |
| `emptyText` | `string` |
| `tableCaption` | `string` |
| `activeKey` | `ChartKey \| null` |
| `drillTo` | `(key: string \| null) => void` |
| `drillUp` | `() => void` |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` |
| `markTag` | `(mark: Mark) => HierarchyMarkTag` |
| `getRootProps` | `() => T['element']` |
| `getCaptionProps` | `() => T['element']` |
| `getPathProps` | `() => T['element']` |
| `getPathItemProps` | `(item: HierarchyPathItem) => T['button']` |
| `getLegendProps` | `() => T['element']` |
| `getLegendScaleProps` | `(scale: HierarchyLegendScale) => T['element']` |
| `getLegendScaleNameProps` | `() => T['element']` |
| `getLegendScaleBarProps` | `() => T['element']` |
| `getLegendScaleValueProps` | `(edge: 'min' \| 'max') => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getPlotProps` | `() => T['element']` |
| `getMarkProps` | `(mark: Mark) => T['element']` |
| `getTooltipProps` | `() => T['element']` |
| `getTooltipHeaderProps` | `() => T['element']` |
| `getTooltipRowProps` | `(row: HierarchyTooltipRow) => T['element']` |
| `getTooltipSwatchProps` | `(row: HierarchyTooltipRow) => T['element']` |
| `getTooltipValueProps` | `(row: HierarchyTooltipRow) => T['element']` |
| `getTooltipNameProps` | `(row: HierarchyTooltipRow) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getSummaryProps` | `() => T['element']` |
| `getTableRegionProps` | `() => T['element']` |
| `getTableProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `hierarchy-chart.kbd.tab` |
| `ArrowRight` | `hierarchy-chart.kbd.next` |
| `ArrowLeft` | `hierarchy-chart.kbd.prev` |
| `ArrowDown` | `hierarchy-chart.kbd.child` |
| `ArrowUp` | `hierarchy-chart.kbd.parent` |
| `Home` | `hierarchy-chart.kbd.first` |
| `End` | `hierarchy-chart.kbd.last` |
| `Enter` | `hierarchy-chart.kbd.drill` |
| `Space` | `hierarchy-chart.kbd.press` |
| `Backspace` | `hierarchy-chart.kbd.up` |
| `Escape` | `hierarchy-chart.kbd.dismiss` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `path` | `aria-label` | translations.pathLabel |
| `path-item` | `aria-current` | 'location' \| undefined |
| `path-item` | `aria-disabled` | 'true' \| undefined |
| `legend` | `aria-hidden` | 'true' |
| `plot` | `aria-describedby` | id of the `summary` part |
| `plot` | `aria-roledescription` | translations.chartRoleDescription |
| `plot` | `role` | 'tree' |
| `tooltip` | `aria-hidden` | 'true' |
| `mark` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/hierarchy-chart.css` is written against `[data-scope="hierarchy-chart"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-hierarchy-chart` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-palette` | props.palette \| undefined |
| `root` | `data-state` | 'error' \| undefined |
| `root` | `data-xh-chart-part` | 'root' |
| `caption` | `data-xh-chart-part` | 'caption' |
| `path-item` | `data-current` | '' (present only while the condition holds) |
| `path-item` | `data-pressed` | '' (present only while the condition holds) |
| `path-item` | `data-xh-collection-context` | 'nav' |
| `path-item` | `data-xh-collection-item` | '' |
| `path-item` | `data-xh-collection-size` | 'sm' |
| `path-item` | `data-xh-collection-terminal` | '' (present only while the condition holds) |
| `legend` | `data-xh-chart-part` | 'legend' |
| `legend-scale` | `data-level` | scale.level |
| `legend-scale-value` | `data-edge` | edge |
| `viewport` | `data-xh-chart-part` | 'viewport' |
| `plot` | `data-xh-chart-part` | 'plot' |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-loading` | '' (present only while the condition holds) |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |
| `mark` | `data-dimmed` | '' (present only while the condition holds) |
| `mark` | `data-level` | String(Math.min(geometry.level, 4)) \| undefined |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-hierarchy-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` |
| `--xh-hierarchy-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` |
| `--xh-hierarchy-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` |
| `--xh-hierarchy-chart-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-sm` |
| `--xh-hierarchy-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-4` |
| `--xh-hierarchy-chart-legend-scale-bar-radius` | `legend-scale-bar` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-hierarchy-chart-legend-scale-gap` | `legend-scale` | `gap` | `default` | `--xh-space-2` |
| `--xh-hierarchy-chart-legend-scale-width` | `legend-scale-bar` | `inline-size` | `default` | `--xh-chart-legend-scale-width` |
| `--xh-hierarchy-chart-node-gap` | `root` | `--xh-_chart-metric-gap` | `default` | `--xh-chart-gap` |
| `--xh-hierarchy-chart-node-radius` | `root` | `--xh-_chart-metric-radius` | `default` | `--xh-shape-inset` |
| `--xh-hierarchy-chart-path-column-gap` | `path` | `column-gap` | `default` | `--xh-icon-size` |
| `--xh-hierarchy-chart-path-fg` | `path-item` | `color` | `default`<br>`xh-collection-context=nav` | `--xh-fg-muted` |
| `--xh-hierarchy-chart-path-font-size` | `path`<br>`path-item` | `font-size` | `default` | `--xh-control-font-sm` |
| `--xh-hierarchy-chart-path-item-bg-hover` | `path-item` | `background-color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-bg-subtle` |
| `--xh-hierarchy-chart-path-item-bg-pressed` | `path-item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` |
| `--xh-hierarchy-chart-path-item-fg-current` | `path-item` | `color` | `current`<br>`xh-collection-context=nav`<br>`xh-collection-terminal` | `--xh-fg-default` |
| `--xh-hierarchy-chart-path-item-fg-hover` | `path-item` | `color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-fg-default` |
| `--xh-hierarchy-chart-path-item-font-weight-current` | `path-item` | `font-weight` | `current`<br>`xh-collection-context=nav`<br>`xh-collection-terminal` | `--xh-font-weight-medium` |
| `--xh-hierarchy-chart-path-item-px` | `path-item` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-hierarchy-chart-path-item-radius` | `path-item` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-hierarchy-chart-path-row-gap` | `path` | `row-gap` | `default` | `--xh-space-1` |
| `--xh-hierarchy-chart-path-separator-fg` | `path-item` | `background-color` | `default` | `--xh-fg-subtle` |
| `--xh-hierarchy-chart-series-color` | `legend-swatch`<br>`node`<br>`pattern-line`<br>`tooltip-swatch` | `background`<br>`border`<br>`fill`<br>`stroke` | `@media (forced-colors: active)`<br>`@media print`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` |
| `--xh-hierarchy-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` |
| `--xh-hierarchy-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` |
| `--xh-hierarchy-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` |
| `--xh-hierarchy-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-hierarchy-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` |
| `--xh-hierarchy-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` |
| `--xh-hierarchy-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` |
