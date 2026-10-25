# DiffView

AI chat component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/diff-view).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/diff-view" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/diff-view.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/diff-view" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/diff-view" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/diff-view.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="diff-view"`: **`root`** · `header` · `summary` · **`viewport`** · **`body`** · `row` · `line-number` · `line-content` · `change-label` · `inline-change` · `token` · `gap` · `gap-cell` · `gap-trigger` · `empty` · `truncation` · `comment-trigger` · `comment-thread`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-diff-view>` |
| Vue components | `XhDiffViewBody` `XhDiffViewEmpty` `XhDiffViewHeader` `XhDiffViewRoot` `XhDiffViewSummary` `XhDiffViewTruncation` `XhDiffViewViewport` |
| Composable | `useDiffView` |
| State machine | `diffViewMachine` |
| Skin | `@xihan-ui/styles/diff-view.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `model` | `DiffModel` |  |
| `view` | `DiffViewMode` |  |
| `contextLines` | `number` |  |
| `expandedValue` | `readonly string[]` |  |
| `defaultExpandedValue` | `readonly string[]` |  |
| `wrap` | `boolean` |  |
| `labelled` | `boolean` |  |
| `commentable` | `boolean` |  |
| `commentLines` | `readonly DiffViewLineRef[]` |  |
| `size` | `Size` |  |
| `translations` | `Partial<DiffViewTranslations>` |  |
| `onExpandedValueChange` | `(details: DiffViewExpandedValueChangeDetails) => void` |  |
| `onCommentRequest` | `(details: DiffViewCommentRequestDetails) => void` |  |

### DiffViewLineRef

Elements of `commentLines`.

| Field | Type | Required |
| --- | --- | --- |
| `side` | `DiffSide` | Yes |
| `line` | `number` | Yes |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `comment-mount` | `CustomEvent` |
| `expanded-value-change` | `DiffViewExpandedValueChangeDetails` |
| `comment-request` | `DiffViewCommentRequestDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhDiffViewBody` | `default` | — |
| `XhDiffViewBody` | `comment` | `DiffViewCommentRequestDetails` |
| `XhDiffViewRoot` | `default` | `DiffViewRootSlotProps` |
| `XhDiffViewSummary` | `default` | `{ count: number }` |
| `XhDiffViewTruncation` | `default` | `{ count: number }` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhDiffViewBody` | `renderComment` | `(details: DiffViewCommentRequestDetails) => ReactNode` |  |
| `XhDiffViewRoot` | `children` | `SlotChildren<DiffViewRootSlotProps>` |  |
| `XhDiffViewSummary` | `change` | `Extract<DiffChange, 'added' \| 'removed'>` | Yes |
| `XhDiffViewSummary` | `children` | `SlotChildren<{ count: number }>` |  |
| `XhDiffViewTruncation` | `children` | `SlotChildren<{ count: number }>` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `GAP.EXPAND` · `GAP.COLLAPSE` · `CONTROLLED.EXPANDED.SET` · `PRESS.START` · `PRESS.END` · `COMMENT.FOCUS`

**Guards**: `isExpandedControlled`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `view` | `DiffViewMode` |
| `rows` | `readonly DiffViewRow[]` |
| `expandedValue` | `string[]` |
| `stats` | `{ added: number, removed: number }` |
| `truncated` | `boolean` |
| `truncatedLines` | `number` |
| `truncationText` | `string` |
| `isEmpty` | `boolean` |
| `setExpandedValue` | `(next: string[]) => void` |
| `toggleGap` | `(id: string) => void` |
| `commentable` | `boolean` |
| `commentRefAt` | `(props: DiffViewCellProps) => DiffViewLineRef \| undefined` |
| `hasComment` | `(props: DiffViewCellProps) => boolean` |
| `getCommentTriggerProps` | `(props: DiffViewCellProps) => T['button']` |
| `getCommentThreadProps` | `(props: DiffViewCellProps) => T['element']` |
| `getRootProps` | `() => T['element']` |
| `getHeaderProps` | `() => T['element']` |
| `getSummaryProps` | `(props: { change: DiffChange }) => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getBodyProps` | `() => T['element']` |
| `getRowProps` | `(props: DiffViewRowProps) => T['element']` |
| `getLineNumberProps` | `(props: DiffViewCellProps) => T['element']` |
| `getLineContentProps` | `(props: DiffViewCellProps) => T['element']` |
| `getChangeLabelProps` | `(props: { change: DiffChange }) => T['element']` |
| `getInlineChangeProps` | `(props: DiffViewInlineChangeProps) => T['element']` |
| `getTokenProps` | `(token: CodeToken) => T['element']` |
| `getGapProps` | `(props: DiffViewGapProps) => T['element']` |
| `getGapCellProps` | `() => T['element']` |
| `getGapTriggerProps` | `(props: DiffViewGapProps) => T['button']` |
| `getEmptyProps` | `() => T['element']` |
| `getTruncationProps` | `() => T['element']` |
| `changeLabel` | `(change: DiffChange) => string` |
| `cellText` | `(props: DiffViewCellProps) => string \| undefined` |
| `cellNumber` | `(props: DiffViewCellProps) => number \| undefined` |
| `cellTokens` | `(props: DiffViewCellProps) => readonly CodeToken[]` |
| `cellSegments` | `(props: DiffViewCellProps) => readonly DiffViewSegment[]` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` | `diff-view.kbd.viewport-focus` |
| `Enter` / `Space` | `diff-view.kbd.expand-gap` |
| `Enter` / `Space` | `diff-view.kbd.press` |
| `Tab` | `diff-view.kbd.comment-tab` |
| `Enter` / `Space` | `diff-view.kbd.comment-request` |
| `ArrowDown` / `ArrowUp` | `diff-view.kbd.comment-move` |
| `Home` / `End` | `diff-view.kbd.comment-edge` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `body` | `aria-colcount` | 2 \| 1 |
| `body` | `aria-label` | undefined \| model.newPath |
| `body` | `aria-labelledby` | id of the `header` part \| undefined |
| `body` | `aria-rowcount` | rows.length |
| `body` | `role` | 'table' |
| `row` | `aria-rowindex` | rowIndex |
| `row` | `role` | 'row' |
| `line-number` | `aria-hidden` | 'true' |
| `line-content` | `aria-colindex` | 2 \| 1 |
| `line-content` | `role` | 'cell' |
| `gap` | `role` | 'row' |
| `gap-cell` | `aria-colindex` | 1 |
| `gap-cell` | `role` | 'cell' |
| `gap-trigger` | `aria-expanded` | 'true' \| 'false' |
| `gap-trigger` | `aria-label` | expandGapLabel(hiddenCountOf(gapId)) |
| `comment-trigger` | `aria-label` | undefined \| commentLabel(ref.line, ref.side) |

## Style reference

### Skin

`@xihan-ui/styles/diff-view.css` is written against `[data-scope="diff-view"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-diff-view` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-commentable` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-truncated` | '' (present only while the condition holds) |
| `root` | `data-view` | props.view |
| `root` | `data-wrap` | '' (present only while the condition holds) |
| `summary` | `data-change` | change |
| `row` | `data-change` | lineAt(rowIndex)?.change |
| `row` | `data-revealed` | '' (present only while the condition holds) |
| `line-number` | `data-change` | lineAt(rowIndex)?.change |
| `line-number` | `data-line-number` | cellNumber({ rowIndex, side })?.toString() |
| `line-number` | `data-side` | side |
| `line-content` | `data-change` | lineAt(rowIndex)?.change |
| `line-content` | `data-empty` | '' (present only while the condition holds) |
| `line-content` | `data-side` | side |
| `change-label` | `data-change` | change |
| `inline-change` | `data-change` | lineAt(rowIndex)?.change \| undefined |
| `token` | `data-kind` | token.kind |
| `gap` | `data-expanded` | '' (present only while the condition holds) |
| `gap` | `data-value` | hunkIndex:0 |
| `gap-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `gap-trigger` | `data-value` | hunkIndex:0 |
| `gap-trigger` | `data-xh-action-control` | '' |
| `gap-trigger` | `data-xh-action-display` | 'always' |
| `gap-trigger` | `data-xh-action-profile` | 'disclosure-trigger' |
| `gap-trigger` | `data-xh-action-size` | props.size |
| `gap-trigger` | `data-xh-action-variant` | 'ghost' |
| `comment-trigger` | `data-side` | ref?.side |
| `comment-trigger` | `data-xh-action-control` | '' |
| `comment-trigger` | `data-xh-action-display` | 'always' |
| `comment-trigger` | `data-xh-action-profile` | 'icon' |
| `comment-trigger` | `data-xh-action-size` | props.size |
| `comment-trigger` | `data-xh-action-variant` | 'ghost' |
| `comment-thread` | `data-side` | ref?.side |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-diff-view-added-bg` | `row` | `background` | `change=added` | `--xh-diff-added-bg` |
| `--xh-diff-view-added-fg` | `inline-change`<br>`line-content`<br>`line-number`<br>`row`<br>`summary` | `background`<br>`box-shadow`<br>`color` | `change=added` | `--xh-diff-added-fg` |
| `--xh-diff-view-bg` | `root` | `background` | `default` | `--xh-bg-surface` |
| `--xh-diff-view-border` | `root` | `border` | `default` | `--xh-border-default` |
| `--xh-diff-view-change-bar` | `row` | `background`<br>`box-shadow` | `change=added`<br>`change=removed` | `--xh-stroke-thick` |
| `--xh-diff-view-comment-col` | `comment-trigger`<br>`line-content`<br>`root` | `block-size`<br>`inline-size`<br>`min-block-size`<br>`min-inline-size`<br>`padding-inline-start` | `commentable`<br>`xh-action-profile=disclosure-trigger`<br>`xh-action-profile=icon` | `--xh-diff-view-line-height` |
| `--xh-diff-view-comment-fg` | `token` | `color` | `kind=comment` | `--xh-fg-muted` |
| `--xh-diff-view-comment-thread-bg` | `comment-thread` | `background` | `default` | `--xh-bg-surface` |
| `--xh-diff-view-comment-thread-border` | `comment-thread` | `border` | `default` | `--xh-border-default` |
| `--xh-diff-view-comment-thread-fg` | `comment-thread` | `color` | `default` | `--xh-fg-default` |
| `--xh-diff-view-comment-thread-max-w` | `comment-thread` | `max-inline-size` | `default` | `--xh-measure-prose` |
| `--xh-diff-view-comment-thread-my` | `comment-thread` | `margin-block` | `default` | `--xh-space-2` |
| `--xh-diff-view-comment-thread-p` | `comment-thread` | `padding` | `default` | `--xh-space-3` |
| `--xh-diff-view-comment-thread-radius` | `comment-thread` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-diff-view-comment-trigger-fg` | `comment-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-diff-view-comment-trigger-icon-size` | `comment-trigger` | `--xh-icon-size` | `default` | `--xh-glyph-size-sm` |
| `--xh-diff-view-comment-trigger-radius` | `comment-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-diff-view-divider` | `header`<br>`line-number`<br>`root` | `border-block-end`<br>`border-inline-end`<br>`border-inline-start` | `@media (min-width: 1024px)`<br>`default`<br>`side=new`<br>`view=split` | `--xh-border-subtle` |
| `--xh-diff-view-empty-bg` | `line-content` | `background` | `empty` | `--xh-bg-subtle` |
| `--xh-diff-view-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` |
| `--xh-diff-view-font` | `body`<br>`header` | `font-family` | `default` | `--xh-font-family-mono` |
| `--xh-diff-view-font-size` | `body`<br>`gap-trigger` | `font-size` | `default` | `--xh-_diff-view-font-size` |
| `--xh-diff-view-gap-bg` | `gap` | `background` | `default` | `--xh-bg-subtle` |
| `--xh-diff-view-gap-bg-hover` | `gap-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-diff-view-gap-fg` | `gap-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-diff-view-gutter` | `line-number` | `inline-size` | `default` | `4ch` |
| `--xh-diff-view-header-fg` | `header` | `color` | `default` | `--xh-fg-muted` |
| `--xh-diff-view-header-font-size` | `empty`<br>`header`<br>`truncation` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-diff-view-header-gap` | `header` | `gap` | `default` | `--xh-space-2` |
| `--xh-diff-view-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-diff-view-inline-change-radius` | `inline-change` | `border-radius` | `change` | `--xh-shape-inset` |
| `--xh-diff-view-keyword-fg` | `token` | `color` | `kind=keyword` | `--xh-syntax-keyword` |
| `--xh-diff-view-keyword-weight` | `token` | `font-weight` | `kind=keyword` | `--xh-font-weight-semibold` |
| `--xh-diff-view-line-height` | `body`<br>`comment-trigger`<br>`gap`<br>`gap-trigger`<br>`line-content`<br>`root`<br>`row` | `block-size`<br>`inline-size`<br>`line-height`<br>`min-block-size`<br>`min-inline-size`<br>`padding-inline-start` | `commentable`<br>`default`<br>`xh-action-profile=disclosure-trigger`<br>`xh-action-profile=icon` | `--xh-text-code-leading` |
| `--xh-diff-view-max-h` | `viewport` | `max-block-size` | `default` | `--xh-viewport-max-h` |
| `--xh-diff-view-number-fg` | `line-number` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-diff-view-number-token-fg` | `token` | `color` | `kind=number` | `--xh-syntax-number` |
| `--xh-diff-view-punctuation-fg` | `token` | `color` | `kind=punctuation` | `--xh-fg-subtle` |
| `--xh-diff-view-px` | `empty`<br>`gap-trigger`<br>`header`<br>`line-content`<br>`line-number`<br>`truncation` | `padding-inline`<br>`padding-inline-end` | `default` | `--xh-_diff-view-px` |
| `--xh-diff-view-py` | `empty`<br>`header`<br>`truncation` | `padding-block` | `default` | `--xh-_diff-view-py` |
| `--xh-diff-view-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-diff-view-removed-bg` | `row` | `background` | `change=removed` | `--xh-diff-removed-bg` |
| `--xh-diff-view-removed-fg` | `inline-change`<br>`line-content`<br>`line-number`<br>`row`<br>`summary` | `background`<br>`color` | `change=removed` | `--xh-diff-removed-fg` |
| `--xh-diff-view-shadow` | `root` | `box-shadow` | `default` | `none` |
| `--xh-diff-view-string-fg` | `token` | `color` | `kind=string` | `--xh-syntax-string` |
| `--xh-diff-view-truncation-bg` | `truncation` | `background` | `default` | `--xh-fg-warning` |
| `--xh-diff-view-truncation-border` | `truncation` | `border-block-start` | `default` | `--xh-border-subtle` |
| `--xh-diff-view-truncation-fg` | `truncation` | `color` | `default` | `--xh-fg-warning` |
| `--xh-diff-view-truncation-gap` | `truncation` | `gap` | `default` | `--xh-space-2` |
