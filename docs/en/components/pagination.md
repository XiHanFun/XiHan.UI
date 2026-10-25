# Pagination

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/pagination).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/pagination" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/pagination.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/pagination" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/pagination" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/pagination.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="pagination"`: **`root`** · `summary` · `jumper` · `first-trigger` · `prev-trigger` · `next-trigger` · `last-trigger` · **`item`** · `ellipsis-trigger` · `page-size-select` · `positioner` · `content`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-pagination>` |
| Vue components | `XhPaginationContent` `XhPaginationEllipsisTrigger` `XhPaginationFirstTrigger` `XhPaginationItem` `XhPaginationJumper` `XhPaginationLastTrigger` `XhPaginationNextTrigger` `XhPaginationPageSizeSelect` `XhPaginationPositioner` `XhPaginationPrevTrigger` `XhPaginationRoot` `XhPaginationSummary` |
| Composable | `usePagination` |
| State machine | `paginationMachine` |
| Skin | `@xihan-ui/styles/pagination.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `count` | `number` |  |
| `pageSize` | `number` |  |
| `defaultPageSize` | `number` |  |
| `pageSizeOptions` | `number[]` |  |
| `page` | `number` |  |
| `defaultPage` | `number` |  |
| `siblingCount` | `number` |  |
| `disabled` | `boolean` |  |
| `dir` | `Direction` |  |
| `translations` | `Partial<PaginationTranslations>` |  |
| `placement` | `Placement` |  |
| `offset` | `number` |  |
| `openDelay` | `number` |  |
| `closeDelay` | `number` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onPageChange` | `(details: PaginationPageChangeDetails) => void` |  |
| `onPageSizeChange` | `(details: PaginationPageSizeChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `page-change` | `PaginationPageChangeDetails` |
| `page-size-change` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhPaginationContent` | `default` | `{ pages: number[] }` |
| `XhPaginationRoot` | `default` | `PaginationRootSlotProps` |
| `XhPaginationSummary` | `default` | `{ summaryText: string, start: number, end: number, count: number }` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhPaginationContent` | `children` | `SlotChildren<PaginationContentSlotProps>` |  |
| `XhPaginationEllipsisTrigger` | `side` | `PaginationEllipsisSide` |  |
| `XhPaginationItem` | `value` | `number \| string` | Yes |
| `XhPaginationPageSizeSelect` | `container` | `() => Element \| null` |  |
| `XhPaginationPositioner` | `container` | `() => Element \| null` |  |
| `XhPaginationRoot` | `children` | `SlotChildren<PaginationRootSlotProps>` |  |
| `XhPaginationSummary` | `children` | `SlotChildren<PaginationSummarySlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `ellipsis-trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `closed` · `opening` · `visible` · `visible.open` · `visible.closing`

**Events**: `PAGE.SET` · `PAGE_SIZE.SET` · `PAGE.PREV` · `PAGE.NEXT` · `ELLIPSIS.ENTER` · `ELLIPSIS.LEAVE` · `ELLIPSIS.TOGGLE` · `ELLIPSIS.CLOSE` · `after.openDelay` · `after.closeDelay` · `PRESS.START` · `PRESS.END`

**Guards**: `isSameEllipsis` · `canPress` · `isEnabled`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `page` | `number` |
| `pageSize` | `number` |
| `pageSizeOptions` | `number[]` |
| `count` | `number` |
| `totalPages` | `number` |
| `pages` | `PaginationPage[]` |
| `pageItems` | `PaginationPageItem[]` |
| `openEllipsis` | `PaginationEllipsisSide \| null` |
| `disabled` | `boolean` |
| `pageRange` | `PaginationEntryRange` |
| `summaryText` | `string` |
| `previousPage` | `number \| null` |
| `nextPage` | `number \| null` |
| `setPage` | `(page: number) => void` |
| `goToPrevPage` | `() => void` |
| `goToNextPage` | `() => void` |
| `setPageSize` | `(pageSize: number) => void` |
| `slice` | `<V>(data: readonly V[]) => V[]` |
| `getRootProps` | `() => T['element']` |
| `getSummaryProps` | `() => T['element']` |
| `getJumperProps` | `() => T['input']` |
| `getFirstTriggerProps` | `() => T['button']` |
| `getPrevTriggerProps` | `() => T['button']` |
| `getNextTriggerProps` | `() => T['button']` |
| `getLastTriggerProps` | `() => T['button']` |
| `getItemProps` | `(props: PaginationItemProps) => T['button']` |
| `getEllipsisTriggerProps` | `(props: PaginationEllipsisTriggerProps) => T['button']` |
| `getPageSizeSelectProps` | `() => T['element']` |
| `pageSizeSelect` | `SelectApi<T>` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `closeEllipsis` | `() => void` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `pagination.kbd.item` |
| `Enter` / `Space` | `pagination.kbd.first` |
| `Enter` / `Space` | `pagination.kbd.prev` |
| `Enter` / `Space` | `pagination.kbd.next` |
| `Enter` / `Space` | `pagination.kbd.last` |
| `Enter` / `Space` | `pagination.kbd.ellipsis` |
| `Enter` / `Space` | `pagination.kbd.press` |
| `Escape` | `pagination.kbd.ellipsis-escape` |
| `Tab` / `Shift+Tab` | `pagination.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | label.root |
| `jumper` | `aria-label` | label.jumper |
| `first-trigger` | `aria-label` | label.firstTrigger |
| `prev-trigger` | `aria-label` | label.prevTrigger |
| `next-trigger` | `aria-label` | label.nextTrigger |
| `last-trigger` | `aria-label` | label.lastTrigger |
| `item` | `aria-current` | 'page' \| undefined |
| `item` | `aria-label` | label.item(item.page) |
| `ellipsis-trigger` | `aria-controls` | id of the `content` part \| undefined |
| `ellipsis-trigger` | `aria-expanded` | 'true' \| 'false' |
| `ellipsis-trigger` | `aria-haspopup` | 'true' |
| `ellipsis-trigger` | `aria-label` | label.ellipsis( (items.find(item =&gt; item.type === 'el… |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | label.ellipsis(folded.length) |
| `content` | `role` | 'group' |

## Style reference

### Skin

`@xihan-ui/styles/pagination.css` is written against `[data-scope="pagination"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-pagination` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `summary` | `data-empty` | '' (present only while the condition holds) |
| `jumper` | `data-disabled` | '' (present only while the condition holds) |
| `jumper` | `data-empty` | '' (present only while the condition holds) |
| `jumper` | `data-variant` | 'outline' |
| `jumper` | `data-xh-field-chrome` | '' |
| `jumper` | `data-xh-field-size` | props.size |
| `first-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `first-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `first-trigger` | `data-xh-action-control` | '' |
| `first-trigger` | `data-xh-action-display` | 'always' |
| `first-trigger` | `data-xh-action-profile` | 'text' |
| `first-trigger` | `data-xh-action-size` | props.size |
| `first-trigger` | `data-xh-action-variant` | 'ghost' |
| `prev-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `prev-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `prev-trigger` | `data-xh-action-control` | '' |
| `prev-trigger` | `data-xh-action-display` | 'always' |
| `prev-trigger` | `data-xh-action-profile` | 'text' |
| `prev-trigger` | `data-xh-action-size` | props.size |
| `prev-trigger` | `data-xh-action-variant` | 'ghost' |
| `next-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `next-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `next-trigger` | `data-xh-action-control` | '' |
| `next-trigger` | `data-xh-action-display` | 'always' |
| `next-trigger` | `data-xh-action-profile` | 'text' |
| `next-trigger` | `data-xh-action-size` | props.size |
| `next-trigger` | `data-xh-action-variant` | 'ghost' |
| `last-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `last-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `last-trigger` | `data-xh-action-control` | '' |
| `last-trigger` | `data-xh-action-display` | 'always' |
| `last-trigger` | `data-xh-action-profile` | 'text' |
| `last-trigger` | `data-xh-action-size` | props.size |
| `last-trigger` | `data-xh-action-variant` | 'ghost' |
| `item` | `data-current` | '' (present only while the condition holds) |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'text' |
| `item` | `data-xh-action-size` | props.size |
| `item` | `data-xh-action-variant` | 'ghost' |
| `ellipsis-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `ellipsis-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `ellipsis-trigger` | `data-side` | props.side |
| `ellipsis-trigger` | `data-state` | 'open' \| 'closed' |
| `ellipsis-trigger` | `data-xh-action-control` | '' |
| `ellipsis-trigger` | `data-xh-action-display` | 'always' |
| `ellipsis-trigger` | `data-xh-action-profile` | 'text' |
| `ellipsis-trigger` | `data-xh-action-size` | props.size |
| `ellipsis-trigger` | `data-xh-action-variant` | 'ghost' |
| `page-size-select` | `data-empty` | '' (present only while the condition holds) |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-placement` | actual placement computed by the positioning engine |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-pagination-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` |
| `--xh-pagination-content-border` | `content` | `border` | `default` | `--xh-border-default` |
| `--xh-pagination-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` |
| `--xh-pagination-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` |
| `--xh-pagination-content-p` | `content` | `padding` | `default` | `--xh-space-1` |
| `--xh-pagination-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-pagination-content-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-floating` |
| `--xh-pagination-ellipsis-trigger-fg` | `ellipsis-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-subtle` |
| `--xh-pagination-font-size` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`jumper`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger`<br>`summary` | `font-size` | `default` | `--xh-_pagination-font-size` |
| `--xh-pagination-gap` | `content`<br>`root` | `gap` | `default` | `--xh-space-1` |
| `--xh-pagination-icon-size` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`last-trigger`<br>`next-trigger`<br>`positioner`<br>`prev-trigger`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-pagination-item-bg` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-pagination-item-bg-active` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-pagination-item-bg-hover` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-pagination-item-bg-selected` | `item` | `--xh-ink-surface`<br>`background-color` | `current`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_pagination-selected-bg` |
| `--xh-pagination-item-bg-selected-active` | `item` | `background-color` | `current`<br>`disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_pagination-selected-bg-active` |
| `--xh-pagination-item-bg-selected-hover` | `item` | `background-color` | `current`<br>`disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_pagination-selected-bg-hover` |
| `--xh-pagination-item-border` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible` | `--xh-border-default` |
| `--xh-pagination-item-border-hover` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-strong` |
| `--xh-pagination-item-border-selected` | `item` | `border`<br>`border-color` | `current`<br>`focus-visible` | `--xh-_pagination-selected-border` |
| `--xh-pagination-item-border-selected-active` | `item` | `border-color` | `current`<br>`disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_pagination-selected-border` |
| `--xh-pagination-item-border-selected-hover` | `item` | `border-color` | `current`<br>`disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_pagination-selected-border` |
| `--xh-pagination-item-fg` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`jumper`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`xh-field-chrome` | `--xh-_action-variant-fg-rest`<br>`--xh-fg-default` |
| `--xh-pagination-item-fg-selected` | `item` | `color` | `current`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_pagination-selected-fg` |
| `--xh-pagination-item-font-weight` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-pagination-item-h` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`jumper`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger`<br>`summary` | `block-size`<br>`min-block-size` | `default`<br>`has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_pagination-item-size` |
| `--xh-pagination-item-min-size` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger` | `min-inline-size` | `default` | `--xh-_pagination-item-size` |
| `--xh-pagination-item-px` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`jumper`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger` | `padding-inline` | `default`<br>`xh-field-chrome` | `--xh-_pagination-item-px`<br>`--xh-_pagination-jumper-px` |
| `--xh-pagination-item-radius` | `ellipsis-trigger`<br>`first-trigger`<br>`item`<br>`jumper`<br>`last-trigger`<br>`next-trigger`<br>`prev-trigger` | `border-radius` | `default`<br>`xh-field-chrome` | `--xh-shape-control`<br>`--xh-shape-surface` |
| `--xh-pagination-item-shadow` | `item` | `box-shadow` | `current`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` |
| `--xh-pagination-jumper-bg` | `jumper` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-pagination-jumper-bg-disabled` | `jumper` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-pagination-jumper-bg-hover` | `jumper` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-pagination-jumper-border` | `jumper` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-pagination-jumper-border-focus` | `jumper` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-pagination-jumper-border-hover` | `jumper` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-pagination-jumper-border-invalid` | `jumper` | `border-color` | `invalid`<br>`user-invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-pagination-jumper-w` | `jumper` | `inline-size` | `default` | `--xh-space-8` |
| `--xh-pagination-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-pagination-page-size-select-w` | `page-size-select` | `--xh-select-control-w` | `default` | `max-content` |
| `--xh-pagination-summary-fg` | `summary` | `color` | `default` | `--xh-fg-muted` |
