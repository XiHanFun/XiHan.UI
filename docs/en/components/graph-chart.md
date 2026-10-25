# GraphChart <Badge type="tip" text="new" />

Charts component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/graph-chart).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/graph-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/graph-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/graph-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/graph-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/graph-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="graph-chart"`: **`root`** · `caption` · `legend` · `legend-item` · `legend-swatch` · `legend-label` · **`viewport`** · **`plot`** · `link` · `arrow` · `node` · `node-label` · `link-label` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table-region` · `table`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-graph-chart>` |
| Vue components | `XhGraphChartCaption` `XhGraphChartEmpty` `XhGraphChartLegend` `XhGraphChartPlot` `XhGraphChartRoot` `XhGraphChartTooltip` `XhGraphChartViewport` |
| Composable | `useGraphChart` |
| State machine | `graphChartMachine` |
| Skin | `@xihan-ui/styles/graph-chart.css` |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `view-change` | `GraphViewChangeDetails` |
| `hidden-series-change` | `ChartHiddenSeriesChangeDetails` |
| `active-key-change` | `ChartActiveKeyChangeDetails` |
| `datum-active` | `ChartDatumDetails` |
| `datum-press` | `ChartDatumDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhGraphChartRoot` | `default` | `GraphChartRootSlotProps` |
| `XhGraphChartRoot` | `caption` | — |
| `XhGraphChartRoot` | `tooltip` | `GraphChartTooltipSlotProps` |
| `XhGraphChartRoot` | `empty` | — |
| `XhGraphChartTooltip` | `default` | `GraphChartTooltipSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhGraphChartRoot` | `nodes` | `readonly GraphNodeDatum[]` |  |
| `XhGraphChartRoot` | `links` | `readonly GraphLinkDatum[]` |  |
| `XhGraphChartRoot` | `layout` | `GraphLayout` |  |
| `XhGraphChartRoot` | `root` | `string` |  |
| `XhGraphChartRoot` | `directed` | `boolean` |  |
| `XhGraphChartRoot` | `draggableNodes` | `boolean` |  |
| `XhGraphChartRoot` | `zoom` | `boolean` |  |
| `XhGraphChartRoot` | `view` | `GraphView` |  |
| `XhGraphChartRoot` | `defaultView` | `GraphView` |  |
| `XhGraphChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  |
| `XhGraphChartRoot` | `hiddenSeries` | `string[]` |  |
| `XhGraphChartRoot` | `defaultHiddenSeries` | `string[]` |  |
| `XhGraphChartRoot` | `activeKey` | `ChartKey \| null` |  |
| `XhGraphChartRoot` | `pending` | `boolean` |  |
| `XhGraphChartRoot` | `animated` | `boolean` |  |
| `XhGraphChartRoot` | `locale` | `string` |  |
| `XhGraphChartRoot` | `translations` | `Partial<GraphChartTranslations>` |  |
| `XhGraphChartRoot` | `onHiddenSeriesChange` | `GraphChartProps['onHiddenSeriesChange']` |  |
| `XhGraphChartRoot` | `onActiveKeyChange` | `GraphChartProps['onActiveKeyChange']` |  |
| `XhGraphChartRoot` | `onDatumActive` | `GraphChartProps['onDatumActive']` |  |
| `XhGraphChartRoot` | `onDatumPress` | `GraphChartProps['onDatumPress']` |  |
| `XhGraphChartRoot` | `onViewChange` | `GraphChartProps['onViewChange']` |  |
| `XhGraphChartRoot` | `caption` | `ReactNode` |  |
| `XhGraphChartRoot` | `renderTooltip` | `(props: GraphChartTooltipSlotProps) => ReactNode` |  |
| `XhGraphChartRoot` | `empty` | `ReactNode` |  |
| `XhGraphChartRoot` | `children` | `SlotChildren<GraphChartRootSlotProps>` |  |
| `XhGraphChartTooltip` | `children` | `SlotChildren<GraphChartTooltipSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'error' \| undefined |
| `tooltip` | 'visible' \| 'hidden' |
| `empty` | 'loading' \| undefined |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `SIM.FRAME` · `VIEW.SET`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `model` | `GraphModel` |
| `scene` | `Scene` |
| `overlay` | `GraphOverlay` |
| `measured` | `boolean` |
| `empty` | `boolean` |
| `legendItems` | `readonly GraphLegendItem[]` |
| `active` | `ChartDatumDetails \| null` |
| `tooltip` | `GraphTooltipModel \| null` |
| `summary` | `string` |
| `table` | `TableModel` |
| `emptyText` | `string` |
| `tableCaption` | `string` |
| `activeKey` | `ChartKey \| null` |
| `hiddenSeries` | `string[]` |
| `view` | `GraphView` |
| `toggleSeries` | `(id: string) => void` |
| `zoomBy` | `(factor: number, at?: { x: number, y: number }) => void` |
| `resetView` | `() => void` |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` |
| `markTag` | `(mark: Mark) => GraphMarkTag` |
| `getRootProps` | `() => T['element']` |
| `getCaptionProps` | `() => T['element']` |
| `getLegendProps` | `() => T['element']` |
| `getLegendItemProps` | `(item: GraphLegendItem) => T['button']` |
| `getLegendSwatchProps` | `(item: GraphLegendItem) => T['element']` |
| `getLegendLabelProps` | `(item: GraphLegendItem) => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getPlotProps` | `() => T['element']` |
| `getMarkProps` | `(mark: Mark) => T['element']` |
| `getTooltipProps` | `() => T['element']` |
| `getTooltipHeaderProps` | `() => T['element']` |
| `getTooltipRowProps` | `(row: GraphTooltipRow) => T['element']` |
| `getTooltipValueProps` | `(row: GraphTooltipRow) => T['element']` |
| `getTooltipNameProps` | `(row: GraphTooltipRow) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getSummaryProps` | `() => T['element']` |
| `getTableRegionProps` | `() => T['element']` |
| `getTableProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `graph-chart.kbd.tab` |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | `graph-chart.kbd.move` |
| `Home` | `graph-chart.kbd.first` |
| `End` | `graph-chart.kbd.last` |
| `Enter` / `Space` | `graph-chart.kbd.press` |
| `+` / `-` / `0` | `graph-chart.kbd.zoom` |
| `Escape` | `graph-chart.kbd.dismiss` |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | `graph-chart.kbd.legend-move` |
| `Enter` / `Space` | `graph-chart.kbd.legend-toggle` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `legend` | `aria-label` | translations.legendLabel |
| `legend` | `role` | 'toolbar' |
| `legend-item` | `aria-pressed` | 'false' \| 'true' |
| `legend-swatch` | `aria-hidden` | 'true' |
| `plot` | `aria-describedby` | id of the `summary` part |
| `plot` | `aria-roledescription` | translations.chartRoleDescription |
| `plot` | `role` | 'graphics-document' |
| `tooltip` | `aria-hidden` | 'true' |
| `mark` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/graph-chart.css` is written against `[data-scope="graph-chart"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-graph-chart` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-state` | 'error' \| undefined |
| `root` | `data-xh-chart-part` | 'root' |
| `caption` | `data-xh-chart-part` | 'caption' |
| `legend` | `data-xh-chart-part` | 'legend' |
| `legend-item` | `data-pressed` | '' (present only while the condition holds) |
| `legend-item` | `data-value` | item.id |
| `legend-item` | `data-xh-action-control` | '' |
| `legend-item` | `data-xh-action-profile` | 'text' |
| `legend-item` | `data-xh-action-size` | 'xs' |
| `legend-item` | `data-xh-action-variant` | 'ghost' |
| `legend-item` | `data-xh-chart-part` | 'legend-item' |
| `legend-item` | `data-xh-chart-pattern` | String(item.slot) |
| `legend-item` | `data-xh-chart-slot` | String(item.slot) |
| `legend-swatch` | `data-xh-chart-part` | 'legend-swatch' |
| `viewport` | `data-xh-chart-part` | 'viewport' |
| `plot` | `data-draggable` | '' (present only while the condition holds) |
| `plot` | `data-dragging` | '' (present only while the condition holds) |
| `plot` | `data-xh-chart-part` | 'plot' |
| `plot` | `data-zoomed` | '' (present only while the condition holds) |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-loading` | '' (present only while the condition holds) |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |
| `mark` | `data-dimmed` | '' (present only while the condition holds) |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-graph-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` |
| `--xh-graph-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` |
| `--xh-graph-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` |
| `--xh-graph-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-1` |
| `--xh-graph-chart-legend-swatch-radius` | `legend-swatch` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-graph-chart-link-color` | `arrow`<br>`link` | `fill`<br>`stroke` | `default` | `--xh-fg-subtle` |
| `--xh-graph-chart-link-width` | `link` | `stroke-width` | `default` | `--xh-stroke-thin` |
| `--xh-graph-chart-node-size` | `legend-swatch`<br>`root`<br>`tooltip-swatch` | `background` | `@media (forced-colors: active)`<br>`@media print`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-point-size` |
| `--xh-graph-chart-series-color` | `arrow`<br>`legend-swatch`<br>`link`<br>`node`<br>`pattern-line`<br>`tooltip-swatch` | `background`<br>`border`<br>`fill`<br>`stroke` | `@media (forced-colors: active)`<br>`@media print`<br>`highlighted`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` |
| `--xh-graph-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` |
| `--xh-graph-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` |
| `--xh-graph-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` |
| `--xh-graph-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-graph-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` |
| `--xh-graph-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` |
