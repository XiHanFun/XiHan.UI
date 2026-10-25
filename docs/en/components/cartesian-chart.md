# CartesianChart <Badge type="tip" text="new" />

Charts component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/cartesian-chart).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/cartesian-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/cartesian-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/cartesian-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/cartesian-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/cartesian-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="cartesian-chart"`: **`root`** · `caption` · `legend` · `legend-item` · `legend-swatch` · `legend-label` · `legend-scale` · `legend-scale-name` · `legend-scale-bar` · `legend-scale-value` · **`viewport`** · `underlay` · `canvas` · **`plot`** · `defs` · `pattern` · `pattern-line` · `clip-path` · `clip-rect` · `grid` · `grid-line` · `axis` · `axis-line` · `tick` · `tick-label` · `axis-title` · `series` · `bar` · `stem` · `connector` · `candle` · `wick` · `box` · `whisker` · `median` · `outlier` · `line` · `area-fill` · `dot` · `point` · `data-label` · `total-label` · `end-label` · `leader-line` · `annotation` · `annotation-label` · `brush` · `crosshair` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `zoom-slider` · `zoom-track` · `zoom-window` · `zoom-handle` · `zoom-preview` · `zoom-preview-line` · `summary` · `table-region` · `table`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-cartesian-chart>` |
| Vue components | `XhCartesianChartCaption` `XhCartesianChartEmpty` `XhCartesianChartLegend` `XhCartesianChartPlot` `XhCartesianChartRoot` `XhCartesianChartTooltip` `XhCartesianChartViewport` `XhCartesianChartZoomSlider` |
| Composable | `useCartesianChart` |
| State machine | `cartesianChartMachine` |
| Skin | `@xihan-ui/styles/cartesian-chart.css` |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `hidden-series-change` | `ChartHiddenSeriesChangeDetails` |
| `active-key-change` | `ChartActiveKeyChangeDetails` |
| `window-change` | `CartesianWindowChangeDetails` |
| `follow-change` | `CartesianFollowChangeDetails` |
| `brush-selection-change` | `CartesianBrushSelectionChangeDetails` |
| `datum-active` | `ChartDatumDetails` |
| `datum-press` | `ChartDatumDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhCartesianChartRoot` | `default` | `CartesianChartRootSlotProps` |
| `XhCartesianChartRoot` | `caption` | — |
| `XhCartesianChartRoot` | `tooltip` | `CartesianChartTooltipSlotProps` |
| `XhCartesianChartRoot` | `empty` | — |
| `XhCartesianChartTooltip` | `default` | `CartesianChartTooltipSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhCartesianChartRoot` | `data` | `readonly ChartRow[] \| ColumnSource` |  |
| `XhCartesianChartRoot` | `series` | `readonly CartesianSeries[]` |  |
| `XhCartesianChartRoot` | `xAxis` | `CartesianAxis` |  |
| `XhCartesianChartRoot` | `yAxis` | `CartesianAxis` |  |
| `XhCartesianChartRoot` | `orientation` | `CartesianOrientation` |  |
| `XhCartesianChartRoot` | `renderer` | `CartesianRenderer` |  |
| `XhCartesianChartRoot` | `trigger` | `CartesianTrigger` |  |
| `XhCartesianChartRoot` | `totals` | `boolean` |  |
| `XhCartesianChartRoot` | `tooltipOrder` | `CartesianTooltipOrder` |  |
| `XhCartesianChartRoot` | `palette` | `ChartPalette` |  |
| `XhCartesianChartRoot` | `annotations` | `readonly CartesianAnnotation[]` |  |
| `XhCartesianChartRoot` | `zoom` | `CartesianZoom` |  |
| `XhCartesianChartRoot` | `window` | `CartesianWindow` |  |
| `XhCartesianChartRoot` | `defaultWindow` | `CartesianWindow` |  |
| `XhCartesianChartRoot` | `onWindowChange` | `CartesianChartProps['onWindowChange']` |  |
| `XhCartesianChartRoot` | `follow` | `boolean` |  |
| `XhCartesianChartRoot` | `defaultFollow` | `boolean` |  |
| `XhCartesianChartRoot` | `onFollowChange` | `CartesianChartProps['onFollowChange']` |  |
| `XhCartesianChartRoot` | `brush` | `CartesianBrush` |  |
| `XhCartesianChartRoot` | `brushSelection` | `CartesianBrushSelection \| null` |  |
| `XhCartesianChartRoot` | `defaultBrushSelection` | `CartesianBrushSelection \| null` |  |
| `XhCartesianChartRoot` | `onBrushSelectionChange` | `CartesianChartProps['onBrushSelectionChange']` |  |
| `XhCartesianChartRoot` | `hiddenSeries` | `string[]` |  |
| `XhCartesianChartRoot` | `defaultHiddenSeries` | `string[]` |  |
| `XhCartesianChartRoot` | `activeKey` | `ChartKey \| null` |  |
| `XhCartesianChartRoot` | `pending` | `boolean` |  |
| `XhCartesianChartRoot` | `animated` | `boolean` |  |
| `XhCartesianChartRoot` | `locale` | `string` |  |
| `XhCartesianChartRoot` | `translations` | `Partial<CartesianChartTranslations>` |  |
| `XhCartesianChartRoot` | `onHiddenSeriesChange` | `CartesianChartProps['onHiddenSeriesChange']` |  |
| `XhCartesianChartRoot` | `onActiveKeyChange` | `CartesianChartProps['onActiveKeyChange']` |  |
| `XhCartesianChartRoot` | `onDatumActive` | `CartesianChartProps['onDatumActive']` |  |
| `XhCartesianChartRoot` | `onDatumPress` | `CartesianChartProps['onDatumPress']` |  |
| `XhCartesianChartRoot` | `caption` | `ReactNode` |  |
| `XhCartesianChartRoot` | `renderTooltip` | `(props: CartesianChartTooltipSlotProps) => ReactNode` |  |
| `XhCartesianChartRoot` | `empty` | `ReactNode` |  |
| `XhCartesianChartRoot` | `children` | `SlotChildren<CartesianChartRootSlotProps>` |  |
| `XhCartesianChartTooltip` | `children` | `SlotChildren<CartesianChartTooltipSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'error' \| undefined |
| `tooltip` | 'visible' \| 'hidden' |
| `empty` | 'loading' \| undefined |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `WINDOW.SET` · `DRAG.START` · `DRAG.END` · `BRUSH.START` · `BRUSH.MOVE` · `BRUSH.END` · `BRUSH.SET` · `BRUSH.ANCHOR` · `DATA.TICK`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `model` | `CartesianModel` |
| `renderer` | `'svg' \| 'canvas'` |
| `layers` | `CartesianLayers` |
| `scene` | `Scene` |
| `overlay` | `CartesianOverlay` |
| `measured` | `boolean` |
| `empty` | `boolean` |
| `legendItems` | `readonly CartesianLegendItem[]` |
| `legendScale` | `CartesianLegendScale \| null` |
| `patterns` | `readonly ChartPattern[]` |
| `active` | `ChartDatumDetails \| null` |
| `tooltip` | `CartesianTooltipModel \| null` |
| `summary` | `string` |
| `table` | `TableModel` |
| `emptyText` | `string` |
| `tableCaption` | `string` |
| `activeKey` | `ChartKey \| null` |
| `hiddenSeries` | `string[]` |
| `toggleSeries` | `(id: string) => void` |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` |
| `markTag` | `(mark: Mark) => CartesianMarkTag` |
| `zoom` | `{ readonly x: boolean, readonly y: boolean, readonly window: CartesianWindow, readonly ratio: CartesianWindowRatio }` |
| `clip` | `{ readonly id: string, readonly x: number, readonly y: number, readonly width: number, readonly height: number } \| null` |
| `setWindow` | `(window: CartesianWindow) => void` |
| `brush` | `{ readonly x: boolean readonly y: boolean readonly selection: CartesianBrushSelection \| null readonly rect: { readonly x: number, readonly y: number, readonly width: number, readonly height: number } \| null }` |
| `setBrushSelection` | `(selection: CartesianBrushSelection \| null) => void` |
| `getRootProps` | `() => T['element']` |
| `getCaptionProps` | `() => T['element']` |
| `getLegendProps` | `() => T['element']` |
| `getLegendItemProps` | `(item: CartesianLegendItem) => T['button']` |
| `getLegendSwatchProps` | `(item: CartesianLegendItem) => T['element']` |
| `getLegendLabelProps` | `(item: CartesianLegendItem) => T['element']` |
| `getLegendScaleProps` | `() => T['element']` |
| `getLegendScaleNameProps` | `() => T['element']` |
| `getLegendScaleBarProps` | `() => T['element']` |
| `getLegendScaleValueProps` | `(edge: 'min' \| 'max') => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getPlotProps` | `() => T['element']` |
| `getUnderlayProps` | `() => T['element']` |
| `getCanvasProps` | `() => T['element']` |
| `getDefsProps` | `() => T['element']` |
| `getPatternProps` | `(pattern: ChartPattern) => T['element']` |
| `getPatternLineProps` | `(pattern: ChartPattern) => T['element']` |
| `getMarkProps` | `(mark: Mark) => T['element']` |
| `getTooltipProps` | `() => T['element']` |
| `getTooltipHeaderProps` | `() => T['element']` |
| `getTooltipRowProps` | `(row: CartesianTooltipRow) => T['element']` |
| `getTooltipSwatchProps` | `(row: CartesianTooltipRow) => T['element']` |
| `getTooltipValueProps` | `(row: CartesianTooltipRow) => T['element']` |
| `getTooltipNameProps` | `(row: CartesianTooltipRow) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getClipPathProps` | `() => T['element']` |
| `getClipRectProps` | `() => T['element']` |
| `getZoomSliderProps` | `() => T['element']` |
| `getZoomTrackProps` | `() => T['element']` |
| `getZoomWindowProps` | `() => T['element']` |
| `getZoomHandleProps` | `(edge: 'start' \| 'end') => T['element']` |
| `getZoomPreviewProps` | `() => T['element']` |
| `getZoomPreviewLineProps` | `() => T['element']` |
| `getSummaryProps` | `() => T['element']` |
| `getTableRegionProps` | `() => T['element']` |
| `getTableProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `cartesian-chart.kbd.tab` |
| `ArrowRight` | `cartesian-chart.kbd.next` |
| `ArrowLeft` | `cartesian-chart.kbd.prev` |
| `ArrowUp` | `cartesian-chart.kbd.series-next` |
| `ArrowDown` | `cartesian-chart.kbd.series-prev` |
| `Home` | `cartesian-chart.kbd.first` |
| `End` | `cartesian-chart.kbd.last` |
| `PageUp` / `PageDown` | `cartesian-chart.kbd.page` |
| `Enter` / `Space` | `cartesian-chart.kbd.press` |
| `+` / `=` | `cartesian-chart.kbd.zoom-in` |
| `-` / `_` | `cartesian-chart.kbd.zoom-out` |
| `ArrowLeft` / `ArrowRight` / `ArrowDown` / `ArrowUp` / `PageUp` / `PageDown` / `Home` / `End` | `cartesian-chart.kbd.zoom-edge` |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+Home` / `Shift+End` / `Shift+PageUp` / `Shift+PageDown` | `cartesian-chart.kbd.brush` |
| `Escape` | `cartesian-chart.kbd.dismiss` |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | `cartesian-chart.kbd.legend-move` |
| `Enter` / `Space` | `cartesian-chart.kbd.legend-toggle` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `legend` | `aria-label` | translations.legendLabel |
| `legend` | `role` | 'toolbar' |
| `legend-item` | `aria-pressed` | 'false' \| 'true' |
| `legend-swatch` | `aria-hidden` | 'true' |
| `legend-scale` | `aria-hidden` | 'true' |
| `underlay` | `aria-hidden` | 'true' |
| `canvas` | `aria-hidden` | 'true' |
| `plot` | `aria-describedby` | id of the `summary` part |
| `plot` | `aria-roledescription` | translations.chartRoleDescription |
| `plot` | `role` | 'graphics-document' |
| `tooltip` | `aria-hidden` | 'true' |
| `zoom-slider` | `aria-label` | translations.zoomLabel |
| `zoom-slider` | `role` | 'group' |
| `zoom-handle` | `aria-label` | translations.zoomStartLabel \| translations.zoomEndLabel |
| `zoom-handle` | `aria-orientation` | 'horizontal' |
| `zoom-handle` | `aria-valuemax` | 100 |
| `zoom-handle` | `aria-valuemin` | 0 |
| `zoom-handle` | `aria-valuenow` | Math.round(shown.x[edge] * 100) |
| `zoom-handle` | `aria-valuetext` | edgeText(shown.x[edge], edge) |
| `zoom-handle` | `role` | 'slider' |
| `zoom-preview` | `aria-hidden` | 'true' |
| `mark` | `aria-hidden` | mark.exiting \|\| undefined |
| `mark` | `aria-label` | undefined \| spec?.name |
| `mark` | `aria-roledescription` | undefined \| translations.seriesRoleDescription |
| `mark` | `role` | undefined \| 'graphics-object' |

## Style reference

### Skin

`@xihan-ui/styles/cartesian-chart.css` is written against `[data-scope="cartesian-chart"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-cartesian-chart` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-orientation` | model.spec.orientation |
| `root` | `data-palette` | props.palette |
| `root` | `data-state` | 'error' \| undefined |
| `root` | `data-xh-chart-part` | 'root' |
| `caption` | `data-xh-chart-part` | 'caption' |
| `legend` | `data-xh-chart-part` | 'legend' |
| `legend-item` | `data-pressed` | '' (present only while the condition holds) |
| `legend-item` | `data-tone` | item.tone |
| `legend-item` | `data-value` | item.id |
| `legend-item` | `data-xh-action-control` | '' |
| `legend-item` | `data-xh-action-profile` | 'text' |
| `legend-item` | `data-xh-action-size` | 'xs' |
| `legend-item` | `data-xh-action-variant` | 'ghost' |
| `legend-item` | `data-xh-chart-part` | 'legend-item' |
| `legend-item` | `data-xh-chart-pattern` | patternOf(item.id) |
| `legend-item` | `data-xh-chart-scale` | 'sequential' \| undefined |
| `legend-item` | `data-xh-chart-slot` | undefined \| String(item.slot) |
| `legend-swatch` | `data-mark` | swatchMark(item) |
| `legend-swatch` | `data-symbol` | item.symbol |
| `legend-swatch` | `data-xh-chart-part` | 'legend-swatch' |
| `legend-scale-value` | `data-edge` | edge |
| `viewport` | `data-xh-chart-part` | 'viewport' |
| `canvas` | `data-empty` | '' (present only while the condition holds) |
| `plot` | `data-dragging` | '' (present only while the condition holds) |
| `plot` | `data-selectable` | '' (present only while the condition holds) |
| `plot` | `data-touch-axis` | 'both' \| 'horizontal' \| 'vertical' \| undefined |
| `plot` | `data-xh-chart-part` | 'plot' |
| `plot` | `data-zoomed` | '' (present only while the condition holds) |
| `defs` | `data-xh-chart-part` | 'defs' |
| `pattern` | `data-tone` | pattern.tone |
| `pattern` | `data-xh-chart-part` | 'pattern' |
| `pattern` | `data-xh-chart-slot` | undefined \| String(pattern.slot) |
| `pattern-line` | `data-xh-chart-part` | 'pattern-line' |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-current` | '' (present only while the condition holds) |
| `tooltip-row` | `data-series-id` | row.seriesId |
| `tooltip-row` | `data-tone` | row.tone |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-row` | `data-xh-chart-pattern` | patternOf(row.seriesId) |
| `tooltip-row` | `data-xh-chart-scale` | 'sequential' \| undefined |
| `tooltip-row` | `data-xh-chart-slot` | undefined \| String(row.slot) |
| `tooltip-swatch` | `data-mark` | swatchMark(row) |
| `tooltip-swatch` | `data-seg` | undefined \| sequentialStop(row.t).seg |
| `tooltip-swatch` | `data-symbol` | row.symbol |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-loading` | '' (present only while the condition holds) |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |
| `zoom-slider` | `data-dragging` | '' (present only while the condition holds) |
| `zoom-handle` | `data-placement` | edge |
| `mark` | `data-axis` | mark.key.slice('axis:'.length) \| undefined |
| `mark` | `data-dimmed` | '' (present only while the condition holds) |
| `mark` | `data-drawing` | '' (present only while the condition holds) |
| `mark` | `data-kind` | note?.kind |
| `mark` | `data-mark` | spec?.mark |
| `mark` | `data-placement` | model.scene?.placements.get(mark.key) \| undefined \| undefined |
| `mark` | `data-series-id` | mark.key.slice('series:'.length) |
| `mark` | `data-tone` | spec?.tone |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |
| `mark` | `data-xh-chart-pattern` | patternOf(id) |
| `mark` | `data-xh-chart-scale` | 'sequential' \| undefined |
| `mark` | `data-xh-chart-slot` | undefined \| String(spec.slot) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-cartesian-chart-bar-max` | `root` | `--xh-_chart-metric-bar-max` | `default` | `--xh-chart-bar-max` |
| `--xh-cartesian-chart-bar-radius` | `root` | `--xh-_chart-metric-radius` | `default` | `--xh-shape-inset` |
| `--xh-cartesian-chart-brush-bg` | `brush` | `fill` | `default` | `--xh-bg-brand-subtle` |
| `--xh-cartesian-chart-brush-border` | `brush` | `stroke` | `default` | `--xh-border-control-focus` |
| `--xh-cartesian-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` |
| `--xh-cartesian-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` |
| `--xh-cartesian-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` |
| `--xh-cartesian-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-1` |
| `--xh-cartesian-chart-legend-scale-bar-radius` | `legend-scale-bar` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-cartesian-chart-legend-scale-gap` | `legend-scale` | `gap` | `default` | `--xh-space-2` |
| `--xh-cartesian-chart-legend-scale-width` | `legend-scale-bar` | `inline-size` | `default` | `--xh-chart-legend-scale-width` |
| `--xh-cartesian-chart-legend-swatch-line-radius` | `legend-swatch` | `border-radius` | `mark=line` | `--xh-shape-pill` |
| `--xh-cartesian-chart-legend-swatch-radius` | `legend-swatch` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-cartesian-chart-line-width` | `annotation`<br>`candle`<br>`legend-swatch`<br>`line`<br>`median`<br>`root`<br>`stem`<br>`tooltip-swatch` | `background`<br>`block-size`<br>`stroke-dasharray`<br>`stroke-width` | `@media (forced-colors: active)`<br>`@media print`<br>`default`<br>`drawing`<br>`kind=trend`<br>`mark=line`<br>`method=moving-average`<br>`not([data-drawing])`<br>`style=ohlc`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-line-width` |
| `--xh-cartesian-chart-point-size` | `legend-swatch`<br>`root`<br>`tooltip-swatch` | `background` | `@media (forced-colors: active)`<br>`@media print`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-point-size` |
| `--xh-cartesian-chart-series-color` | `annotation`<br>`area-fill`<br>`bar`<br>`box`<br>`candle`<br>`dot`<br>`legend-item`<br>`legend-swatch`<br>`line`<br>`median`<br>`outlier`<br>`pattern-line`<br>`point`<br>`stem`<br>`tooltip-swatch`<br>`whisker`<br>`wick` | `background`<br>`border`<br>`fill`<br>`stroke` | `@media (forced-colors: active)`<br>`@media print`<br>`kind=average`<br>`kind=point`<br>`kind=trend`<br>`mark=line`<br>`mark=point`<br>`not([data-symbol='circle'], [data-symbol='square'])`<br>`style=ohlc`<br>`symbol=circle`<br>`symbol=square`<br>`tone`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-_tone`<br>`--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` |
| `--xh-cartesian-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` |
| `--xh-cartesian-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` |
| `--xh-cartesian-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` |
| `--xh-cartesian-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-cartesian-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` |
| `--xh-cartesian-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` |
| `--xh-cartesian-chart-tooltip-swatch-line-radius` | `tooltip-swatch` | `border-radius` | `mark=line` | `--xh-shape-pill` |
| `--xh-cartesian-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-cartesian-chart-zoom-h` | `zoom-slider` | `block-size` | `default` | `--xh-space-6` |
| `--xh-cartesian-chart-zoom-handle-bg` | `zoom-handle` | `background` | `default` | `--xh-bg-brand` |
| `--xh-cartesian-chart-zoom-handle-radius` | `zoom-handle` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-cartesian-chart-zoom-handle-w` | `zoom-handle` | `inline-size` | `default` | `--xh-space-2` |
| `--xh-cartesian-chart-zoom-preview-color` | `zoom-preview-line` | `stroke` | `default` | `--xh-chart-deemphasis` |
| `--xh-cartesian-chart-zoom-track-bg` | `zoom-track` | `background` | `default` | `--xh-bg-subtle` |
| `--xh-cartesian-chart-zoom-track-radius` | `zoom-track` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-cartesian-chart-zoom-window-bg` | `zoom-window` | `background` | `default` | `--xh-bg-brand-subtle` |
| `--xh-cartesian-chart-zoom-window-radius` | `zoom-window` | `border-radius` | `default` | `--xh-shape-inset` |
