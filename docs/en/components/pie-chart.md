# PieChart <Badge type="tip" text="new" />

Charts component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/pie-chart).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/pie-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/pie-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/pie-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/pie-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/pie-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="pie-chart"`: **`root`** · `caption` · `legend` · `legend-item` · `legend-swatch` · `legend-label` · **`viewport`** · **`plot`** · `defs` · `pattern` · `pattern-line` · `slice` · `leader-line` · `slice-label` · `focus-ring` · `center` · `center-value` · `center-label` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table-region` · `table`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-pie-chart>` |
| Vue components | `XhPieChartCaption` `XhPieChartCenter` `XhPieChartEmpty` `XhPieChartLegend` `XhPieChartPlot` `XhPieChartRoot` `XhPieChartTooltip` `XhPieChartViewport` |
| Composable | `usePieChart` |
| State machine | `pieChartMachine` |
| Skin | `@xihan-ui/styles/pie-chart.css` |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `hidden-series-change` | `PieLabelDetails` |
| `active-key-change` | `ChartActiveKeyChangeDetails` |
| `datum-active` | `ChartDatumDetails` |
| `datum-press` | `ChartDatumDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhPieChartCenter` | `default` | `PieChartCenterSlotProps` |
| `XhPieChartRoot` | `default` | `PieChartRootSlotProps` |
| `XhPieChartRoot` | `caption` | — |
| `XhPieChartRoot` | `center` | `PieChartCenterSlotProps` |
| `XhPieChartRoot` | `tooltip` | `PieChartTooltipSlotProps` |
| `XhPieChartRoot` | `empty` | — |
| `XhPieChartTooltip` | `default` | `PieChartTooltipSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhPieChartCenter` | `children` | `SlotChildren<PieChartCenterSlotProps>` |  |
| `XhPieChartRoot` | `data` | `readonly ChartRow[]` |  |
| `XhPieChartRoot` | `nameField` | `string` |  |
| `XhPieChartRoot` | `valueField` | `string` |  |
| `XhPieChartRoot` | `variant` | `PieVariant` |  |
| `XhPieChartRoot` | `rose` | `boolean` |  |
| `XhPieChartRoot` | `sweep` | `PieSweep` |  |
| `XhPieChartRoot` | `sort` | `PieSort` |  |
| `XhPieChartRoot` | `maxSlices` | `number` |  |
| `XhPieChartRoot` | `labels` | `PieLabels` |  |
| `XhPieChartRoot` | `labelContent` | `PieLabelContent \| ((details: PieLabelDetails) => string)` |  |
| `XhPieChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  |
| `XhPieChartRoot` | `hiddenSeries` | `string[]` |  |
| `XhPieChartRoot` | `defaultHiddenSeries` | `string[]` |  |
| `XhPieChartRoot` | `activeKey` | `ChartKey \| null` |  |
| `XhPieChartRoot` | `pending` | `boolean` |  |
| `XhPieChartRoot` | `animated` | `boolean` |  |
| `XhPieChartRoot` | `locale` | `string` |  |
| `XhPieChartRoot` | `translations` | `Partial<PieChartTranslations>` |  |
| `XhPieChartRoot` | `onHiddenSeriesChange` | `PieChartProps['onHiddenSeriesChange']` |  |
| `XhPieChartRoot` | `onActiveKeyChange` | `PieChartProps['onActiveKeyChange']` |  |
| `XhPieChartRoot` | `onDatumActive` | `PieChartProps['onDatumActive']` |  |
| `XhPieChartRoot` | `onDatumPress` | `PieChartProps['onDatumPress']` |  |
| `XhPieChartRoot` | `caption` | `ReactNode` |  |
| `XhPieChartRoot` | `renderCenter` | `(props: PieChartCenterSlotProps) => ReactNode` |  |
| `XhPieChartRoot` | `renderTooltip` | `(props: PieChartTooltipSlotProps) => ReactNode` |  |
| `XhPieChartRoot` | `empty` | `ReactNode` |  |
| `XhPieChartRoot` | `children` | `SlotChildren<PieChartRootSlotProps>` |  |
| `XhPieChartTooltip` | `children` | `SlotChildren<PieChartTooltipSlotProps>` |  |

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
| `model` | `PieModel` |
| `scene` | `Scene` |
| `overlay` | `PieOverlay` |
| `measured` | `boolean` |
| `empty` | `boolean` |
| `legendItems` | `readonly PieLegendItem[]` |
| `patterns` | `readonly ChartPattern[]` |
| `active` | `ChartDatumDetails \| null` |
| `tooltip` | `PieTooltipModel \| null` |
| `center` | `{ readonly value: string, readonly label: string }` |
| `summary` | `string` |
| `table` | `TableModel` |
| `emptyText` | `string` |
| `tableCaption` | `string` |
| `activeKey` | `ChartKey \| null` |
| `hiddenSeries` | `string[]` |
| `toggleSeries` | `(id: string) => void` |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` |
| `markTag` | `(mark: Mark) => PieMarkTag` |
| `getRootProps` | `() => T['element']` |
| `getCaptionProps` | `() => T['element']` |
| `getLegendProps` | `() => T['element']` |
| `getLegendItemProps` | `(item: PieLegendItem) => T['button']` |
| `getLegendSwatchProps` | `(item: PieLegendItem) => T['element']` |
| `getLegendLabelProps` | `(item: PieLegendItem) => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getPlotProps` | `() => T['element']` |
| `getDefsProps` | `() => T['element']` |
| `getPatternProps` | `(pattern: ChartPattern) => T['element']` |
| `getPatternLineProps` | `(pattern: ChartPattern) => T['element']` |
| `getMarkProps` | `(mark: Mark) => T['element']` |
| `getCenterProps` | `() => T['element']` |
| `getCenterValueProps` | `() => T['element']` |
| `getCenterLabelProps` | `() => T['element']` |
| `getTooltipProps` | `() => T['element']` |
| `getTooltipHeaderProps` | `() => T['element']` |
| `getTooltipRowProps` | `(row: PieTooltipRow) => T['element']` |
| `getTooltipSwatchProps` | `(row: PieTooltipRow) => T['element']` |
| `getTooltipValueProps` | `(row: PieTooltipRow) => T['element']` |
| `getTooltipNameProps` | `(row: PieTooltipRow) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getSummaryProps` | `() => T['element']` |
| `getTableRegionProps` | `() => T['element']` |
| `getTableProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `pie-chart.kbd.tab` |
| `ArrowRight` / `ArrowDown` | `pie-chart.kbd.next` |
| `ArrowLeft` / `ArrowUp` | `pie-chart.kbd.prev` |
| `Home` | `pie-chart.kbd.first` |
| `End` | `pie-chart.kbd.last` |
| `Enter` / `Space` | `pie-chart.kbd.press` |
| `Escape` | `pie-chart.kbd.dismiss` |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | `pie-chart.kbd.legend-move` |
| `Enter` / `Space` | `pie-chart.kbd.legend-toggle` |

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

`@xihan-ui/styles/pie-chart.css` is written against `[data-scope="pie-chart"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-pie-chart` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

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
| `legend-item` | `data-xh-chart-pattern` | patternAttr(item.slot, item.other) |
| `legend-item` | `data-xh-chart-slot` | slotAttr(item.slot, item.other) |
| `legend-swatch` | `data-xh-chart-part` | 'legend-swatch' |
| `viewport` | `data-xh-chart-part` | 'viewport' |
| `plot` | `data-xh-chart-part` | 'plot' |
| `defs` | `data-xh-chart-part` | 'defs' |
| `pattern` | `data-xh-chart-part` | 'pattern' |
| `pattern` | `data-xh-chart-slot` | undefined \| String(pattern.slot) |
| `pattern-line` | `data-xh-chart-part` | 'pattern-line' |
| `center` | `data-drawing` | '' (present only while the condition holds) |
| `center` | `data-placement` | 'top' \| undefined |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-series-id` | row.key |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-row` | `data-xh-chart-pattern` | patternAttr(row.slot, row.other) |
| `tooltip-row` | `data-xh-chart-slot` | slotAttr(row.slot, row.other) |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-loading` | '' (present only while the condition holds) |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |
| `mark` | `data-dimmed` | '' (present only while the condition holds) |
| `mark` | `data-drawing` | '' |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |
| `mark` | `data-xh-chart-slot` | slotAttr(slice.slot, slice.other) \| undefined |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-pie-chart-center-gap` | `center` | `gap` | `default` | `--xh-space-0_5` |
| `--xh-pie-chart-center-value-font-size` | `center-value` | `font-size` | `default` | `--xh-text-heading-3-size` |
| `--xh-pie-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` |
| `--xh-pie-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` |
| `--xh-pie-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` |
| `--xh-pie-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-1` |
| `--xh-pie-chart-legend-swatch-radius` | `legend-swatch` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-pie-chart-series-color` | `legend-swatch`<br>`pattern-line`<br>`slice`<br>`tooltip-swatch` | `background`<br>`border`<br>`fill`<br>`stroke` | `@media (forced-colors: active)`<br>`@media print`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` |
| `--xh-pie-chart-slice-gap` | `root` | `--xh-_chart-metric-gap` | `default` | `--xh-chart-gap` |
| `--xh-pie-chart-slice-radius` | `root` | `--xh-_chart-metric-radius` | `default` | `--xh-shape-inset` |
| `--xh-pie-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` |
| `--xh-pie-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` |
| `--xh-pie-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` |
| `--xh-pie-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-pie-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` |
| `--xh-pie-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` |
| `--xh-pie-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` |
