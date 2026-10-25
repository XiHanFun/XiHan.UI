# SankeyChart <Badge type="tip" text="new" />

Charts component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/sankey-chart).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/sankey-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/sankey-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/sankey-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/sankey-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/sankey-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="sankey-chart"`: **`root`** · `caption` · `legend` · `legend-item` · `legend-swatch` · `legend-label` · **`viewport`** · **`plot`** · `defs` · `gradient` · `gradient-stop` · `link` · `node` · `node-label` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table-region` · `table`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-sankey-chart>` |
| Vue components | `XhSankeyChartCaption` `XhSankeyChartEmpty` `XhSankeyChartLegend` `XhSankeyChartPlot` `XhSankeyChartRoot` `XhSankeyChartTooltip` `XhSankeyChartViewport` |
| Composable | `useSankeyChart` |
| State machine | `sankeyChartMachine` |
| Skin | `@xihan-ui/styles/sankey-chart.css` |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `hidden-series-change` | `ChartHiddenSeriesChangeDetails` |
| `active-key-change` | `ChartActiveKeyChangeDetails` |
| `datum-active` | `ChartDatumDetails` |
| `datum-press` | `ChartDatumDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhSankeyChartRoot` | `default` | `SankeyChartRootSlotProps` |
| `XhSankeyChartRoot` | `caption` | — |
| `XhSankeyChartRoot` | `tooltip` | `SankeyChartTooltipSlotProps` |
| `XhSankeyChartRoot` | `empty` | — |
| `XhSankeyChartTooltip` | `default` | `SankeyChartTooltipSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhSankeyChartRoot` | `nodes` | `readonly SankeyNodeDatum[]` |  |
| `XhSankeyChartRoot` | `links` | `readonly SankeyLinkDatum[]` |  |
| `XhSankeyChartRoot` | `orientation` | `SankeyOrientation` |  |
| `XhSankeyChartRoot` | `nodeAlign` | `SankeyNodeAlign` |  |
| `XhSankeyChartRoot` | `linkColor` | `SankeyLinkColor` |  |
| `XhSankeyChartRoot` | `nodeSort` | `SankeyNodeSort` |  |
| `XhSankeyChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  |
| `XhSankeyChartRoot` | `hiddenSeries` | `string[]` |  |
| `XhSankeyChartRoot` | `defaultHiddenSeries` | `string[]` |  |
| `XhSankeyChartRoot` | `activeKey` | `ChartKey \| null` |  |
| `XhSankeyChartRoot` | `pending` | `boolean` |  |
| `XhSankeyChartRoot` | `animated` | `boolean` |  |
| `XhSankeyChartRoot` | `locale` | `string` |  |
| `XhSankeyChartRoot` | `translations` | `Partial<SankeyChartTranslations>` |  |
| `XhSankeyChartRoot` | `onHiddenSeriesChange` | `SankeyChartProps['onHiddenSeriesChange']` |  |
| `XhSankeyChartRoot` | `onActiveKeyChange` | `SankeyChartProps['onActiveKeyChange']` |  |
| `XhSankeyChartRoot` | `onDatumActive` | `SankeyChartProps['onDatumActive']` |  |
| `XhSankeyChartRoot` | `onDatumPress` | `SankeyChartProps['onDatumPress']` |  |
| `XhSankeyChartRoot` | `caption` | `ReactNode` |  |
| `XhSankeyChartRoot` | `renderTooltip` | `(props: SankeyChartTooltipSlotProps) => ReactNode` |  |
| `XhSankeyChartRoot` | `empty` | `ReactNode` |  |
| `XhSankeyChartRoot` | `children` | `SlotChildren<SankeyChartRootSlotProps>` |  |
| `XhSankeyChartTooltip` | `children` | `SlotChildren<SankeyChartTooltipSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'error' \| undefined |
| `tooltip` | 'visible' \| 'hidden' |
| `empty` | 'loading' \| undefined |

The following names are internal to the state machine.

**States**: `idle`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `model` | `SankeyModel` |
| `scene` | `Scene` |
| `overlay` | `SankeyOverlay` |
| `measured` | `boolean` |
| `empty` | `boolean` |
| `legendItems` | `readonly SankeyLegendItem[]` |
| `gradients` | `readonly SankeyGradient[]` |
| `active` | `ChartDatumDetails \| null` |
| `tooltip` | `SankeyTooltipModel \| null` |
| `summary` | `string` |
| `table` | `TableModel` |
| `emptyText` | `string` |
| `tableCaption` | `string` |
| `activeKey` | `ChartKey \| null` |
| `hiddenSeries` | `string[]` |
| `toggleSeries` | `(id: string) => void` |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` |
| `markTag` | `(mark: Mark) => SankeyMarkTag` |
| `getRootProps` | `() => T['element']` |
| `getCaptionProps` | `() => T['element']` |
| `getLegendProps` | `() => T['element']` |
| `getLegendItemProps` | `(item: SankeyLegendItem) => T['button']` |
| `getLegendSwatchProps` | `(item: SankeyLegendItem) => T['element']` |
| `getLegendLabelProps` | `(item: SankeyLegendItem) => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getPlotProps` | `() => T['element']` |
| `getDefsProps` | `() => T['element']` |
| `getGradientProps` | `(gradient: SankeyGradient) => T['element']` |
| `getGradientStopProps` | `(gradient: SankeyGradient, at: 'from' \| 'to') => T['element']` |
| `getMarkProps` | `(mark: Mark) => T['element']` |
| `getTooltipProps` | `() => T['element']` |
| `getTooltipHeaderProps` | `() => T['element']` |
| `getTooltipRowProps` | `(row: SankeyTooltipRow) => T['element']` |
| `getTooltipSwatchProps` | `(row: SankeyTooltipRow) => T['element']` |
| `getTooltipValueProps` | `(row: SankeyTooltipRow) => T['element']` |
| `getTooltipNameProps` | `(row: SankeyTooltipRow) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getSummaryProps` | `() => T['element']` |
| `getTableRegionProps` | `() => T['element']` |
| `getTableProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `sankey-chart.kbd.tab` |
| `ArrowDown` | `sankey-chart.kbd.next` |
| `ArrowUp` | `sankey-chart.kbd.prev` |
| `ArrowRight` | `sankey-chart.kbd.downstream` |
| `ArrowLeft` | `sankey-chart.kbd.upstream` |
| `Home` | `sankey-chart.kbd.first` |
| `End` | `sankey-chart.kbd.last` |
| `Enter` / `Space` | `sankey-chart.kbd.press` |
| `Escape` | `sankey-chart.kbd.dismiss` |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | `sankey-chart.kbd.legend-move` |
| `Enter` / `Space` | `sankey-chart.kbd.legend-toggle` |

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

`@xihan-ui/styles/sankey-chart.css` is written against `[data-scope="sankey-chart"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-sankey-chart` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

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
| `plot` | `data-xh-chart-part` | 'plot' |
| `gradient-stop` | `data-xh-chart-slot` | String(at === 'from' ? gradient.from : gradient.to) |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-row` | `data-xh-chart-pattern` | undefined \| String(row.slot) |
| `tooltip-row` | `data-xh-chart-slot` | undefined \| String(row.slot) |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
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
| `--xh-sankey-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` |
| `--xh-sankey-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` |
| `--xh-sankey-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` |
| `--xh-sankey-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-1` |
| `--xh-sankey-chart-legend-swatch-radius` | `legend-swatch` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-sankey-chart-link-alpha` | `link` | `fill-opacity` | `default` | `--xh-chart-link-alpha` |
| `--xh-sankey-chart-link-color` | `link` | `fill` | `default` | `--xh-chart-categorical-other` |
| `--xh-sankey-chart-node-radius` | `root` | `--xh-_chart-metric-radius` | `default` | `--xh-shape-inset` |
| `--xh-sankey-chart-node-width` | `root` | `--xh-_chart-metric-bar-max` | `default` | `--xh-space-3` |
| `--xh-sankey-chart-series-color` | `gradient-stop`<br>`legend-swatch`<br>`link`<br>`node`<br>`pattern-line`<br>`tooltip-swatch` | `background`<br>`border`<br>`fill`<br>`stop-color`<br>`stroke` | `@media (forced-colors: active)`<br>`@media print`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns`<br>`xh-chart-slot`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` |
| `--xh-sankey-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` |
| `--xh-sankey-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` |
| `--xh-sankey-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` |
| `--xh-sankey-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-sankey-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` |
| `--xh-sankey-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` |
| `--xh-sankey-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` |
