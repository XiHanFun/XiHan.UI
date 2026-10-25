# RadarChart <Badge type="tip" text="new" />

Charts component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/radar-chart).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/radar-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/radar-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/radar-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/radar-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/radar-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="radar-chart"`: **`root`** · `caption` · `legend` · `legend-item` · `legend-swatch` · `legend-label` · **`viewport`** · **`plot`** · `defs` · `pattern` · `pattern-line` · `grid-ring` · `ring-label` · `spoke` · `indicator-label` · `series` · `area-fill` · `line` · `point` · `crosshair` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table-region` · `table`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-radar-chart>` |
| Vue components | `XhRadarChartCaption` `XhRadarChartEmpty` `XhRadarChartLegend` `XhRadarChartPlot` `XhRadarChartRoot` `XhRadarChartTooltip` `XhRadarChartViewport` |
| Composable | `useRadarChart` |
| State machine | `radarChartMachine` |
| Skin | `@xihan-ui/styles/radar-chart.css` |

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
| `XhRadarChartRoot` | `default` | `RadarChartRootSlotProps` |
| `XhRadarChartRoot` | `caption` | — |
| `XhRadarChartRoot` | `tooltip` | `RadarChartTooltipSlotProps` |
| `XhRadarChartRoot` | `empty` | — |
| `XhRadarChartTooltip` | `default` | `RadarChartTooltipSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhRadarChartRoot` | `data` | `readonly ChartRow[]` |  |
| `XhRadarChartRoot` | `nameField` | `string` |  |
| `XhRadarChartRoot` | `indicators` | `readonly RadarIndicator[]` |  |
| `XhRadarChartRoot` | `shape` | `RadarShape` |  |
| `XhRadarChartRoot` | `area` | `boolean` |  |
| `XhRadarChartRoot` | `scale` | `RadarScale` |  |
| `XhRadarChartRoot` | `curve` | `RadarCurve` |  |
| `XhRadarChartRoot` | `rings` | `number` |  |
| `XhRadarChartRoot` | `ringLabels` | `boolean` |  |
| `XhRadarChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  |
| `XhRadarChartRoot` | `hiddenSeries` | `string[]` |  |
| `XhRadarChartRoot` | `defaultHiddenSeries` | `string[]` |  |
| `XhRadarChartRoot` | `activeKey` | `ChartKey \| null` |  |
| `XhRadarChartRoot` | `pending` | `boolean` |  |
| `XhRadarChartRoot` | `animated` | `boolean` |  |
| `XhRadarChartRoot` | `locale` | `string` |  |
| `XhRadarChartRoot` | `translations` | `Partial<RadarChartTranslations>` |  |
| `XhRadarChartRoot` | `onHiddenSeriesChange` | `RadarChartProps['onHiddenSeriesChange']` |  |
| `XhRadarChartRoot` | `onActiveKeyChange` | `RadarChartProps['onActiveKeyChange']` |  |
| `XhRadarChartRoot` | `onDatumActive` | `RadarChartProps['onDatumActive']` |  |
| `XhRadarChartRoot` | `onDatumPress` | `RadarChartProps['onDatumPress']` |  |
| `XhRadarChartRoot` | `caption` | `ReactNode` |  |
| `XhRadarChartRoot` | `renderTooltip` | `(props: RadarChartTooltipSlotProps) => ReactNode` |  |
| `XhRadarChartRoot` | `empty` | `ReactNode` |  |
| `XhRadarChartRoot` | `children` | `SlotChildren<RadarChartRootSlotProps>` |  |
| `XhRadarChartTooltip` | `children` | `SlotChildren<RadarChartTooltipSlotProps>` |  |

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
| `model` | `RadarModel` |
| `scene` | `Scene` |
| `overlay` | `RadarOverlay` |
| `measured` | `boolean` |
| `empty` | `boolean` |
| `legendItems` | `readonly RadarLegendItem[]` |
| `patterns` | `readonly ChartPattern[]` |
| `active` | `ChartDatumDetails \| null` |
| `tooltip` | `RadarTooltipModel \| null` |
| `summary` | `string` |
| `table` | `TableModel` |
| `emptyText` | `string` |
| `tableCaption` | `string` |
| `activeKey` | `ChartKey \| null` |
| `hiddenSeries` | `string[]` |
| `toggleSeries` | `(id: string) => void` |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` |
| `markTag` | `(mark: Mark) => RadarMarkTag` |
| `getRootProps` | `() => T['element']` |
| `getCaptionProps` | `() => T['element']` |
| `getLegendProps` | `() => T['element']` |
| `getLegendItemProps` | `(item: RadarLegendItem) => T['button']` |
| `getLegendSwatchProps` | `(item: RadarLegendItem) => T['element']` |
| `getLegendLabelProps` | `(item: RadarLegendItem) => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getPlotProps` | `() => T['element']` |
| `getDefsProps` | `() => T['element']` |
| `getPatternProps` | `(pattern: ChartPattern) => T['element']` |
| `getPatternLineProps` | `(pattern: ChartPattern) => T['element']` |
| `getMarkProps` | `(mark: Mark) => T['element']` |
| `getTooltipProps` | `() => T['element']` |
| `getTooltipHeaderProps` | `() => T['element']` |
| `getTooltipRowProps` | `(row: RadarTooltipRow) => T['element']` |
| `getTooltipSwatchProps` | `(row: RadarTooltipRow) => T['element']` |
| `getTooltipValueProps` | `(row: RadarTooltipRow) => T['element']` |
| `getTooltipNameProps` | `(row: RadarTooltipRow) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getSummaryProps` | `() => T['element']` |
| `getTableRegionProps` | `() => T['element']` |
| `getTableProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `radar-chart.kbd.tab` |
| `ArrowRight` | `radar-chart.kbd.next` |
| `ArrowLeft` | `radar-chart.kbd.prev` |
| `ArrowUp` | `radar-chart.kbd.series-next` |
| `ArrowDown` | `radar-chart.kbd.series-prev` |
| `Home` / `PageUp` | `radar-chart.kbd.first` |
| `End` / `PageDown` | `radar-chart.kbd.last` |
| `Enter` / `Space` | `radar-chart.kbd.press` |
| `Escape` | `radar-chart.kbd.dismiss` |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | `radar-chart.kbd.legend-move` |
| `Enter` / `Space` | `radar-chart.kbd.legend-toggle` |

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
| `mark` | `aria-label` | undefined \| s?.name |
| `mark` | `aria-roledescription` | undefined \| translations.seriesRoleDescription |
| `mark` | `role` | undefined \| 'graphics-object' |

## Style reference

### Skin

`@xihan-ui/styles/radar-chart.css` is written against `[data-scope="radar-chart"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-radar-chart` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

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
| `defs` | `data-xh-chart-part` | 'defs' |
| `pattern` | `data-xh-chart-part` | 'pattern' |
| `pattern` | `data-xh-chart-slot` | undefined \| String(pattern.slot) |
| `pattern-line` | `data-xh-chart-part` | 'pattern-line' |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-current` | '' (present only while the condition holds) |
| `tooltip-row` | `data-series-id` | row.seriesId |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-row` | `data-xh-chart-pattern` | String(row.slot) |
| `tooltip-row` | `data-xh-chart-slot` | String(row.slot) |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-loading` | '' (present only while the condition holds) |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |
| `mark` | `data-dimmed` | '' (present only while the condition holds) |
| `mark` | `data-series-id` | mark.key.slice('series:'.length) |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |
| `mark` | `data-xh-chart-slot` | String(s.slot) \| undefined \| String(mark.paint.slot) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-radar-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` |
| `--xh-radar-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` |
| `--xh-radar-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` |
| `--xh-radar-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-1` |
| `--xh-radar-chart-legend-swatch-radius` | `legend-swatch` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-radar-chart-line-width` | `legend-swatch`<br>`line`<br>`root`<br>`tooltip-swatch` | `background`<br>`block-size`<br>`stroke-dasharray`<br>`stroke-width` | `@media (forced-colors: active)`<br>`@media print`<br>`default`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-line-width` |
| `--xh-radar-chart-point-size` | `legend-swatch`<br>`root`<br>`tooltip-swatch` | `background` | `@media (forced-colors: active)`<br>`@media print`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-point-size` |
| `--xh-radar-chart-ring-label-fg` | `ring-label` | `fill` | `default` | `--xh-chart-label` |
| `--xh-radar-chart-ring-label-opacity` | `ring-label` | `opacity` | `default` | `0.8` |
| `--xh-radar-chart-series-color` | `area-fill`<br>`legend-swatch`<br>`line`<br>`pattern-line`<br>`point`<br>`tooltip-swatch` | `background`<br>`border`<br>`fill`<br>`stroke` | `@media (forced-colors: active)`<br>`@media print`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` |
| `--xh-radar-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` |
| `--xh-radar-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` |
| `--xh-radar-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` |
| `--xh-radar-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-radar-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` |
| `--xh-radar-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` |
| `--xh-radar-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` |
