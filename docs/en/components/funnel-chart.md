# FunnelChart <Badge type="tip" text="new" />

Charts component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/funnel-chart).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/funnel-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/funnel-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/funnel-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/funnel-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/funnel-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="funnel-chart"`: **`root`** · `caption` · **`viewport`** · **`plot`** · `stage` · `stage-label` · `conversion` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table-region` · `table`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-funnel-chart>` |
| Vue components | `XhFunnelChartCaption` `XhFunnelChartEmpty` `XhFunnelChartPlot` `XhFunnelChartRoot` `XhFunnelChartTooltip` `XhFunnelChartViewport` |
| Composable | `useFunnelChart` |
| State machine | `funnelChartMachine` |
| Skin | `@xihan-ui/styles/funnel-chart.css` |

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
| `XhFunnelChartRoot` | `default` | `FunnelChartRootSlotProps` |
| `XhFunnelChartRoot` | `caption` | — |
| `XhFunnelChartRoot` | `tooltip` | `FunnelChartTooltipSlotProps` |
| `XhFunnelChartRoot` | `empty` | — |
| `XhFunnelChartTooltip` | `default` | `FunnelChartTooltipSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhFunnelChartRoot` | `data` | `readonly ChartRow[]` |  |
| `XhFunnelChartRoot` | `nameField` | `string` |  |
| `XhFunnelChartRoot` | `valueField` | `string` |  |
| `XhFunnelChartRoot` | `shape` | `FunnelShape` |  |
| `XhFunnelChartRoot` | `align` | `FunnelAlign` |  |
| `XhFunnelChartRoot` | `direction` | `FunnelDirection` |  |
| `XhFunnelChartRoot` | `conversion` | `FunnelConversion` |  |
| `XhFunnelChartRoot` | `labels` | `FunnelLabels` |  |
| `XhFunnelChartRoot` | `palette` | `ChartPalette` |  |
| `XhFunnelChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  |
| `XhFunnelChartRoot` | `hiddenSeries` | `string[]` |  |
| `XhFunnelChartRoot` | `defaultHiddenSeries` | `string[]` |  |
| `XhFunnelChartRoot` | `activeKey` | `ChartKey \| null` |  |
| `XhFunnelChartRoot` | `pending` | `boolean` |  |
| `XhFunnelChartRoot` | `animated` | `boolean` |  |
| `XhFunnelChartRoot` | `locale` | `string` |  |
| `XhFunnelChartRoot` | `translations` | `Partial<FunnelChartTranslations>` |  |
| `XhFunnelChartRoot` | `onHiddenSeriesChange` | `FunnelChartProps['onHiddenSeriesChange']` |  |
| `XhFunnelChartRoot` | `onActiveKeyChange` | `FunnelChartProps['onActiveKeyChange']` |  |
| `XhFunnelChartRoot` | `onDatumActive` | `FunnelChartProps['onDatumActive']` |  |
| `XhFunnelChartRoot` | `onDatumPress` | `FunnelChartProps['onDatumPress']` |  |
| `XhFunnelChartRoot` | `caption` | `ReactNode` |  |
| `XhFunnelChartRoot` | `renderTooltip` | `(props: FunnelChartTooltipSlotProps) => ReactNode` |  |
| `XhFunnelChartRoot` | `empty` | `ReactNode` |  |
| `XhFunnelChartRoot` | `children` | `SlotChildren<FunnelChartRootSlotProps>` |  |
| `XhFunnelChartTooltip` | `children` | `SlotChildren<FunnelChartTooltipSlotProps>` |  |

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
| `model` | `FunnelModel` |
| `scene` | `Scene` |
| `overlay` | `FunnelOverlay` |
| `measured` | `boolean` |
| `empty` | `boolean` |
| `active` | `ChartDatumDetails \| null` |
| `tooltip` | `FunnelTooltipModel \| null` |
| `summary` | `string` |
| `table` | `TableModel` |
| `emptyText` | `string` |
| `tableCaption` | `string` |
| `activeKey` | `ChartKey \| null` |
| `hiddenSeries` | `string[]` |
| `toggleSeries` | `(id: string) => void` |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` |
| `markTag` | `(mark: Mark) => FunnelMarkTag` |
| `getRootProps` | `() => T['element']` |
| `getCaptionProps` | `() => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getPlotProps` | `() => T['element']` |
| `getMarkProps` | `(mark: Mark) => T['element']` |
| `getTooltipProps` | `() => T['element']` |
| `getTooltipHeaderProps` | `() => T['element']` |
| `getTooltipRowProps` | `(row: FunnelTooltipRow) => T['element']` |
| `getTooltipSwatchProps` | `(row: FunnelTooltipRow) => T['element']` |
| `getTooltipValueProps` | `(row: FunnelTooltipRow) => T['element']` |
| `getTooltipNameProps` | `(row: FunnelTooltipRow) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getSummaryProps` | `() => T['element']` |
| `getTableRegionProps` | `() => T['element']` |
| `getTableProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `funnel-chart.kbd.tab` |
| `ArrowDown` / `ArrowRight` | `funnel-chart.kbd.next` |
| `ArrowUp` / `ArrowLeft` | `funnel-chart.kbd.prev` |
| `Home` | `funnel-chart.kbd.first` |
| `End` | `funnel-chart.kbd.last` |
| `PageUp` / `PageDown` | `funnel-chart.kbd.page` |
| `Enter` / `Space` | `funnel-chart.kbd.press` |
| `Escape` | `funnel-chart.kbd.dismiss` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `plot` | `aria-describedby` | id of the `summary` part |
| `plot` | `aria-roledescription` | translations.chartRoleDescription |
| `plot` | `role` | 'graphics-document' |
| `tooltip` | `aria-hidden` | 'true' |
| `mark` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/funnel-chart.css` is written against `[data-scope="funnel-chart"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-funnel-chart` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-palette` | props.palette |
| `root` | `data-state` | 'error' \| undefined |
| `root` | `data-xh-chart-part` | 'root' |
| `caption` | `data-xh-chart-part` | 'caption' |
| `viewport` | `data-xh-chart-part` | 'viewport' |
| `plot` | `data-xh-chart-part` | 'plot' |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-swatch` | `data-seg` | stop?.seg |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-loading` | '' (present only while the condition holds) |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |
| `mark` | `data-dimmed` | '' (present only while the condition holds) |
| `mark` | `data-placement` | 'inside' \| 'outside' \| undefined |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-funnel-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` |
| `--xh-funnel-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` |
| `--xh-funnel-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` |
| `--xh-funnel-chart-stage-gap` | `root` | `--xh-_chart-metric-gap` | `default` | `--xh-chart-gap` |
| `--xh-funnel-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` |
| `--xh-funnel-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` |
| `--xh-funnel-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` |
| `--xh-funnel-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-funnel-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` |
| `--xh-funnel-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` |
| `--xh-funnel-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` |
