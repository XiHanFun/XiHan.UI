# Heatmap

Charts component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/heatmap).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/heatmap" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/heatmap.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/heatmap" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/heatmap" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/heatmap.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="heatmap"`: **`root`** · **`grid`** · `month-block` · `row` · `week-day` · `month-label` · `row-label` · `column-label` · `cell` · `tooltip` · `legend` · `legend-label` · `legend-item` · `empty`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-heatmap>` |
| Vue components | `XhHeatmapCell` `XhHeatmapColumnLabel` `XhHeatmapEmpty` `XhHeatmapGrid` `XhHeatmapLegend` `XhHeatmapLegendItem` `XhHeatmapLegendLabel` `XhHeatmapMonthBlock` `XhHeatmapMonthLabel` `XhHeatmapRoot` `XhHeatmapRow` `XhHeatmapRowLabel` `XhHeatmapTooltip` `XhHeatmapWeekDay` |
| Composable | `useHeatmap` |
| State machine | `heatmapMachine` |
| Skin | `@xihan-ui/styles/heatmap.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `variant` | `HeatmapVariant` |  |
| `value` | `HeatmapValue[]` |  |
| `rows` | `HeatmapAxisInput[]` |  |
| `columns` | `HeatmapAxisInput[]` |  |
| `startDate` | `string` |  |
| `endDate` | `string` |  |
| `levels` | `number` |  |
| `thresholds` | `number[]` |  |
| `scale` | `HeatmapScaleMode` |  |
| `midpoint` | `number` |  |
| `continuous` | `boolean` |  |
| `firstDayOfWeek` | `number` |  |
| `locale` | `string` |  |
| `dir` | `Direction` |  |
| `tone` | `Tone` |  |
| `palette` | `HeatmapPalette` |  |
| `size` | `Size` |  |
| `animated` | `boolean` |  |
| `format` | `NumberFormatSpec \| ((value: number) => string)` |  |
| `pending` | `boolean` |  |
| `activeKey` | `string \| null` |  |
| `onActiveKeyChange` | `(details: HeatmapActiveKeyChangeDetails) => void` |  |
| `translations` | `Partial<HeatmapTranslations>` |  |
| `onDatumActive` | `(details: HeatmapDatumDetails \| null) => void` |  |
| `onDatumPress` | `(details: HeatmapDatumDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `datum-active` | `HeatmapDatumDetails` |
| `datum-press` | `HeatmapDatumDetails` |
| `active-key-change` | `HeatmapActiveKeyChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhHeatmapRoot` | `default` | `HeatmapRootSlotProps` |
| `XhHeatmapRoot` | `cell` | `HeatmapCellSlotProps` |
| `XhHeatmapRoot` | `tooltip` | `HeatmapDatumDetails \| null` |
| `XhHeatmapRoot` | `empty` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhHeatmapCell` | `value` | `string` | Yes |
| `XhHeatmapCell` | `row` | `string` |  |
| `XhHeatmapColumnLabel` | `value` | `string` | Yes |
| `XhHeatmapLegendItem` | `value` | `number \| string` | Yes |
| `XhHeatmapLegendItem` | `polarity` | `HeatmapPolarity` |  |
| `XhHeatmapLegendLabel` | `value` | `HeatmapLegendBound` | Yes |
| `XhHeatmapMonthBlock` | `value` | `string` | Yes |
| `XhHeatmapMonthLabel` | `value` | `string` | Yes |
| `XhHeatmapRoot` | `renderCell` | `(cell: HeatmapCellSlotProps) => ReactNode` |  |
| `XhHeatmapRoot` | `renderTooltip` | `(details: HeatmapDatumDetails \| null) => ReactNode` |  |
| `XhHeatmapRoot` | `renderEmpty` | `() => ReactNode` |  |
| `XhHeatmapRoot` | `children` | `SlotChildren<HeatmapRootSlotProps>` |  |
| `XhHeatmapRow` | `value` | `number \| string` |  |
| `XhHeatmapRow` | `month` | `string` |  |
| `XhHeatmapRowLabel` | `value` | `string` |  |
| `XhHeatmapWeekDay` | `value` | `number \| string` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `tooltip` | 'hidden' \| 'visible' |
| `empty` | 'loading' \| undefined |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `CELL.FOCUS` · `CELL.BLUR` · `CELL.ENTER` · `CELL.LEAVE` · `DETAIL.DISMISS` · `FOCUS.SET` · `TRANSITION.END`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `variant` | `HeatmapVariant` |
| `scaleMode` | `HeatmapScaleMode` |
| `legendItems` | `readonly HeatmapLegendEntry[]` |
| `grid` | `HeatmapGrid` |
| `monthGrid` | `HeatmapMonthGrid \| null` |
| `matrixGrid` | `HeatmapMatrixGrid \| null` |
| `focusedCell` | `HeatmapCellRef \| null` |
| `focusedDate` | `string \| null` |
| `anchorCell` | `HeatmapCellRef \| null` |
| `anchorDate` | `string \| null` |
| `activeCell` | `HeatmapDatumDetails \| null` |
| `activeKey` | `string \| null` |
| `empty` | `boolean` |
| `emptyText` | `string` |
| `detailOpen` | `boolean` |
| `legendText` | `{ low: string, high: string }` |
| `cellAt` | `(date: string) => HeatmapCellMeta \| null` |
| `setFocusedCell` | `(cell: HeatmapCellRef \| null) => void` |
| `setFocusedDate` | `(date: string \| null) => void` |
| `getRootProps` | `() => T['element']` |
| `getGridProps` | `() => T['element']` |
| `getMonthBlockProps` | `(props: HeatmapMonthBlockProps) => T['element']` |
| `getRowProps` | `(props: HeatmapRowProps) => T['element']` |
| `getWeekDayProps` | `(props: HeatmapWeekDayProps) => T['element']` |
| `getMonthLabelProps` | `(props: HeatmapMonthLabelProps) => T['element']` |
| `getRowLabelProps` | `(props: HeatmapRowLabelProps) => T['element']` |
| `getColumnLabelProps` | `(props: HeatmapColumnLabelProps) => T['element']` |
| `getCellProps` | `(props: HeatmapCellProps) => T['element']` |
| `getTooltipProps` | `() => T['element']` |
| `getLegendProps` | `() => T['element']` |
| `getLegendLabelProps` | `(props: HeatmapLegendLabelProps) => T['element']` |
| `getLegendItemProps` | `(props: HeatmapLegendItemProps) => T['element']` |
| `getEmptyProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `heatmap.kbd.tab` |
| `ArrowLeft` | `heatmap.kbd.prev-week` |
| `ArrowRight` | `heatmap.kbd.next-week` |
| `ArrowUp` | `heatmap.kbd.prev-day` |
| `ArrowDown` | `heatmap.kbd.next-day` |
| `Home` | `heatmap.kbd.row-start` |
| `End` | `heatmap.kbd.row-end` |
| `Ctrl+Home` | `heatmap.kbd.grid-start` |
| `Ctrl+End` | `heatmap.kbd.grid-end` |
| `Escape` | `heatmap.kbd.dismiss` |
| `Enter` | `heatmap.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `grid` | `aria-colcount` | counts.columns \| undefined |
| `grid` | `aria-label` | gridLabel |
| `grid` | `aria-readonly` | 'true' |
| `grid` | `aria-rowcount` | counts.rows \| undefined |
| `grid` | `role` | 'grid' |
| `month-block` | `aria-label` | monthBlockOf.get(block.value)?.long |
| `month-block` | `role` | 'rowgroup' |
| `row` | `aria-hidden` | 'true' |
| `row` | `aria-label` | undefined \| grid.weekDays[row.weekDay]?.long |
| `row` | `aria-rowindex` | 1 |
| `row` | `role` | 'row' |
| `week-day` | `aria-hidden` | 'true' |
| `month-label` | `aria-hidden` | 'true' |
| `row-label` | `aria-colindex` | 1 |
| `row-label` | `aria-hidden` | 'true' |
| `row-label` | `role` | 'rowheader' |
| `column-label` | `aria-colindex` | meta.index + 2 \| undefined |
| `column-label` | `role` | 'columnheader' |
| `cell` | `aria-colindex` | meta.columnIndex + 2 \| undefined |
| `cell` | `aria-label` | matrixCellLabel(heatmapDatumDetails({ row, column }, … |
| `cell` | `role` | 'gridcell' |
| `tooltip` | `aria-hidden` | 'true' |
| `legend` | `aria-label` | legendLabel |
| `legend` | `role` | 'group' |
| `legend-item` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/heatmap.css` is written against `[data-scope="heatmap"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-heatmap` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-animating` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-palette` | props.palette |
| `root` | `data-scale` | 'diverging' \| undefined |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `row` | `data-week` | String(row.week) |
| `row` | `data-week-day` | undefined \| String(row.weekDay) |
| `week-day` | `data-week-day` | undefined \| String(label.weekDay) |
| `cell` | `data-drawing` | '' (present only while the condition holds) |
| `cell` | `data-highlighted` | '' (present only while the condition holds) |
| `cell` | `data-level` | String(place.level) |
| `cell` | `data-polarity` | place.polarity |
| `tooltip` | `data-inline-anchor` | undefined \| tip.inlineAnchor |
| `tooltip` | `data-placement` | undefined \| ((): 'block-start' \| 'block-end' =&gt; { if (activeRef =… |
| `tooltip` | `data-state` | 'hidden' \| 'visible' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `legend` | `data-xh-chart-part` | 'legend' |
| `legend-label` | `data-bound` | label.bound |
| `legend-item` | `data-level` | String(item.level) |
| `legend-item` | `data-polarity` | item.polarity |
| `empty` | `data-loading` | '' (present only while the condition holds) |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-heatmap-bg` | `root`<br>`row-label`<br>`week-day` | `background` | `default` | `--xh-bg-surface` |
| `--xh-heatmap-block-gap` | `grid`<br>`root` | `gap` | `variant=month` | `--xh-_heatmap-gutter` |
| `--xh-heatmap-block-inner-gap` | `month-block` | `gap` | `default` | `--xh-_heatmap-gap` |
| `--xh-heatmap-cell-bg` | `cell`<br>`legend-item` | `background` | `default` | `--xh-_heatmap-ink` |
| `--xh-heatmap-cell-border` | `cell`<br>`legend-item` | `box-shadow` | `default` | `--xh-border-default` |
| `--xh-heatmap-cell-border-highlighted` | `cell` | `box-shadow` | `highlighted` | `--xh-fg-default` |
| `--xh-heatmap-cell-radius` | `cell`<br>`legend-item` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-heatmap-cell-size` | `cell`<br>`legend-item`<br>`month-label`<br>`root`<br>`row`<br>`week-day` | `block-size`<br>`border`<br>`inline-size`<br>`margin-inline-start` | `@media print`<br>`default`<br>`first-child`<br>`level=1`<br>`level=2`<br>`level=3`<br>`size=lg`<br>`size=sm`<br>`variant=month`<br>`week`<br>`week-day` | `--xh-space-2`<br>`--xh-space-2_5`<br>`--xh-space-3` |
| `--xh-heatmap-column-w` | `cell`<br>`column-label`<br>`root` | `inline-size` | `default`<br>`variant=matrix` | `--xh-_heatmap-row-h` |
| `--xh-heatmap-diverging-center` | `cell`<br>`legend-item`<br>`root` | `background`<br>`background-color` | `@keyframes xh-heatmap-fill`<br>`scale=diverging` | `--xh-chart-diverging-center` |
| `--xh-heatmap-diverging-negative` | `cell`<br>`legend-item`<br>`root` | `background` | `is([data-scope='heatmap'][data-part='cell'], [data-scope='heatmap'][data-part='legend-item'])`<br>`polarity=negative`<br>`scale=diverging` | `--xh-chart-diverging-negative` |
| `--xh-heatmap-diverging-positive` | `cell`<br>`legend-item`<br>`root` | `background` | `is([data-scope='heatmap'][data-part='cell'], [data-scope='heatmap'][data-part='legend-item'])`<br>`polarity=positive`<br>`scale=diverging` | `--xh-chart-diverging-positive` |
| `--xh-heatmap-empty` | `cell`<br>`legend-item`<br>`root` | `background`<br>`background-color` | `@keyframes xh-heatmap-fill`<br>`default` | `--xh-bg-subtle-opaque` |
| `--xh-heatmap-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` |
| `--xh-heatmap-fg` | `root` | `color` | `default` | `--xh-fg-muted` |
| `--xh-heatmap-font-size` | `root` | `font-size` | `default` | `--xh-_heatmap-font-size` |
| `--xh-heatmap-gap` | `root` | `gap` | `default` | `--xh-space-2` |
| `--xh-heatmap-grid-gap` | `grid` | `gap` | `default` | `--xh-_heatmap-gap` |
| `--xh-heatmap-gutter` | `grid`<br>`root`<br>`row-label`<br>`week-day` | `gap`<br>`inline-size`<br>`scroll-padding-inline-start` | `default`<br>`size=sm`<br>`variant=month` | `--xh-space-6`<br>`--xh-space-8` |
| `--xh-heatmap-ink` | `cell`<br>`legend-item`<br>`root` | `background` | `default`<br>`is([data-theme='dark'] *, [data-theme='dark'])`<br>`palette=amber`<br>`palette=blue`<br>`palette=cyan`<br>`palette=gray`<br>`palette=green`<br>`palette=indigo`<br>`palette=lime`<br>`palette=orange`<br>`palette=pink`<br>`palette=purple`<br>`palette=red`<br>`palette=teal`<br>`palette=yellow`<br>`theme=dark`<br>`tone` | `--xh-_tone`<br>`--xh-bg-brand`<br>`--xh-color-amber-600`<br>`--xh-color-blue-600`<br>`--xh-color-cyan-600`<br>`--xh-color-green-600`<br>`--xh-color-indigo-600`<br>`--xh-color-lime-600`<br>`--xh-color-neutral-450`<br>`--xh-color-neutral-600`<br>`--xh-color-orange-600`<br>`--xh-color-pink-600`<br>`--xh-color-purple-600`<br>`--xh-color-red-600`<br>`--xh-color-teal-600`<br>`--xh-color-yellow-600` |
| `--xh-heatmap-label-fg` | `column-label`<br>`legend`<br>`month-label`<br>`root`<br>`row-label`<br>`week-day` | `color` | `default`<br>`variant=month`<br>`week-day=0`<br>`week-day=2`<br>`week-day=4`<br>`week-day=6` | `--xh-fg-subtle` |
| `--xh-heatmap-legend-gap` | `legend` | `gap` | `default` | `--xh-_heatmap-gap` |
| `--xh-heatmap-py` | `root` | `padding-block` | `default` | `--xh-_heatmap-gap` |
| `--xh-heatmap-row-gap` | `row` | `gap` | `default` | `--xh-_heatmap-gap` |
| `--xh-heatmap-row-h` | `cell`<br>`column-label`<br>`root` | `block-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm`<br>`variant=matrix` | `--xh-space-4`<br>`--xh-space-5`<br>`--xh-space-6` |
| `--xh-heatmap-sticky-layer` | `row-label`<br>`week-day` | `z-index` | `default` | `1` |
| `--xh-heatmap-title-fg` | `month-label`<br>`root` | `color` | `variant=month` | `--xh-fg-default` |
| `--xh-heatmap-tooltip-bg` | `tooltip` | `background-color` | `default` | `--xh-material-frosted-bg` |
| `--xh-heatmap-tooltip-border` | `tooltip` | `border-color` | `default` | `--xh-material-frosted-border` |
| `--xh-heatmap-tooltip-fg` | `tooltip` | `color` | `default` | `--xh-material-frosted-fg` |
| `--xh-heatmap-tooltip-font-size` | `tooltip` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-heatmap-tooltip-layer` | `tooltip` | `z-index` | `default` | `2` |
| `--xh-heatmap-tooltip-max-w` | `tooltip` | `max-inline-size` | `default` | `--xh-overlay-max-w` |
| `--xh-heatmap-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` |
| `--xh-heatmap-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` |
| `--xh-heatmap-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-heatmap-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` |
| `--xh-heatmap-week-day-skip` | `root`<br>`week-day` | `color` | `week-day=0`<br>`week-day=2`<br>`week-day=4`<br>`week-day=6` | `transparent` |
