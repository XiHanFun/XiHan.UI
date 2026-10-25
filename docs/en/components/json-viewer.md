# JsonViewer

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/json-viewer).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/json-viewer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/json-viewer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/json-viewer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/json-viewer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/json-viewer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="json-viewer"`: **`root`** · `tree` · `item` · `item-key` · `item-value` · `branch` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-summary` · `branch-content` · `preview` · `text` · `token` · `empty` · `mark` · `toolbar` · `expand-trigger` · `wrap-trigger` · `copy-trigger` · `view-trigger` · `status`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-json-viewer>` |
| Vue components | `XhJsonViewerRoot` |
| Composable | `useJsonViewer` |
| State machine | `jsonViewerMachine` |
| Skin | `@xihan-ui/styles/json-viewer.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `value` | `unknown` |  |
| `view` | `JsonViewerView` |  |
| `defaultView` | `JsonViewerView` |  |
| `source` | `string` |  |
| `wrap` | `boolean` |  |
| `defaultWrap` | `boolean` |  |
| `tools` | `boolean \| readonly JsonViewerTool[]` |  |
| `variant` | `ControlVariant` |  |
| `expandedValue` | `string[]` |  |
| `defaultExpandedValue` | `string[]` |  |
| `defaultExpandedDepth` | `number` |  |
| `maxStringLength` | `number` |  |
| `maxItems` | `number` |  |
| `sortKeys` | `boolean` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `size` | `Size` |  |
| `search` | `string` |  |
| `translations` | `Partial<JsonViewerTranslations>` |  |
| `onExpandedValueChange` | `(details: JsonViewerExpandedValueChangeDetails) => void` |  |
| `onViewChange` | `(details: JsonViewerViewChangeDetails) => void` |  |
| `onWrapChange` | `(details: JsonViewerWrapChangeDetails) => void` |  |
| `onCopyError` | `(details: JsonViewerCopyErrorDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `expanded-value-change` | `JsonViewerExpandedValueChangeDetails` |
| `view-change` | `JsonViewerViewChangeDetails` |
| `wrap-change` | `JsonViewerWrapChangeDetails` |
| `copy-error` | `JsonViewerCopyErrorDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhJsonViewerRoot` | `empty` | — |
| `XhJsonViewerRoot` | `toolbar` | `JsonViewerToolbarSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhJsonViewerRoot` | `empty` | `ReactNode` |  |
| `XhJsonViewerRoot` | `toolbar` | `SlotChildren<JsonViewerToolbarSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `branch` | 'open' \| 'closed' |
| `branch-control` | 'open' \| 'closed' |
| `branch-trigger` | 'open' \| 'closed' |
| `branch-indicator` | 'open' \| 'closed' |
| `branch-text` | 'open' \| 'closed' |
| `branch-summary` | 'open' \| 'closed' |
| `branch-content` | 'open' \| 'closed' |
| `preview` | 'open' \| 'closed' |
| `expand-trigger` | 'open' \| 'closed' |
| `wrap-trigger` | 'on' \| 'off' |
| `copy-trigger` | 'idle' \| 'copying' \| 'copied' |
| `status` | 'idle' \| 'copying' \| 'copied' |

The following names are internal to the state machine.

**States**: `idle` · `copying` · `copied`

**Events**: `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `NODE.FOCUS` · `VIEWER.BLUR` · `PRESS.START` · `PRESS.END` · `MATCH.SET` · `SEARCH.SYNC` · `VIEW.SET` · `WRAP.SET` · `COPY.TRIGGER` · `COPY.SUCCESS` · `COPY.ERROR` · `after.timeout` · `TOOL.PRESS.START` · `TOOL.PRESS.END`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `visibleNodes` | `readonly JsonViewerNode[]` |
| `expandedValue` | `string[]` |
| `focusedValue` | `string \| null` |
| `isFocusWithin` | `boolean` |
| `isExpanded` | `(value: string) => boolean` |
| `previewText` | `(node: JsonViewerNode) => string` |
| `branchSummary` | `(node: JsonViewerNode) => string` |
| `valueText` | `(node: JsonViewerNode) => string` |
| `setExpandedValue` | `(next: string[]) => void` |
| `expand` | `(value: string) => void` |
| `collapse` | `(value: string) => void` |
| `toggle` | `(value: string) => void` |
| `view` | `JsonViewerView` |
| `wrap` | `boolean` |
| `tools` | `readonly JsonViewerTool[]` |
| `copyStatus` | `JsonViewerCopyStatus` |
| `copied` | `boolean` |
| `announcement` | `string` |
| `setView` | `(view: JsonViewerView) => void` |
| `setWrap` | `(wrap: boolean) => void` |
| `expandAll` | `() => void` |
| `collapseAll` | `() => void` |
| `allExpanded` | `boolean` |
| `copy` | `() => void` |
| `isEmpty` | `boolean` |
| `emptyText` | `string` |
| `text` | `string` |
| `textSegments` | `readonly JsonViewerTextSegment[]` |
| `searchMatches` | `readonly string[]` |
| `activeMatch` | `string \| null` |
| `nextMatch` | `() => void` |
| `prevMatch` | `() => void` |
| `setActiveMatch` | `(value: string \| null) => void` |
| `keySegments` | `(node: JsonViewerNode) => readonly HighlightSegment[]` |
| `valueSegments` | `(node: JsonViewerNode) => readonly HighlightSegment[]` |
| `getRootProps` | `() => T['element']` |
| `getTreeProps` | `() => T['element']` |
| `getTextProps` | `() => T['element']` |
| `getTokenProps` | `(props: JsonViewerTokenProps) => T['element']` |
| `getItemProps` | `(props: JsonViewerNodeProps) => T['element']` |
| `getItemKeyProps` | `(props: JsonViewerNodeProps) => T['element']` |
| `getItemValueProps` | `(props: JsonViewerNodeProps) => T['element']` |
| `getBranchProps` | `(props: JsonViewerNodeProps) => T['element']` |
| `getBranchControlProps` | `(props: JsonViewerNodeProps) => T['element']` |
| `getBranchTriggerProps` | `(props: JsonViewerNodeProps) => T['element']` |
| `getBranchIndicatorProps` | `(props: JsonViewerNodeProps) => T['element']` |
| `getBranchTextProps` | `(props: JsonViewerNodeProps) => T['element']` |
| `getBranchSummaryProps` | `(props: JsonViewerNodeProps) => T['element']` |
| `getBranchContentProps` | `(props: JsonViewerNodeProps) => T['element']` |
| `getPreviewProps` | `(props: JsonViewerNodeProps) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getMarkProps` | `() => T['element']` |
| `getToolbarProps` | `() => T['element']` |
| `getExpandTriggerProps` | `() => T['button']` |
| `getWrapTriggerProps` | `() => T['button']` |
| `getCopyTriggerProps` | `() => T['button']` |
| `getViewTriggerProps` | `() => T['button']` |
| `getStatusProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `json-viewer.kbd.tab` |
| `ArrowDown` | `json-viewer.kbd.next` |
| `ArrowUp` | `json-viewer.kbd.prev` |
| `Home` | `json-viewer.kbd.first` |
| `End` | `json-viewer.kbd.last` |
| `ArrowRight` | `json-viewer.kbd.expand` |
| `ArrowLeft` | `json-viewer.kbd.collapse` |
| `Enter` / `Space` | `json-viewer.kbd.toggle` |
| `Enter` / `Space` | `json-viewer.kbd.press` |
| `*` | `json-viewer.kbd.expand-siblings` |
| `Enter` / `Space` | `json-viewer.kbd.tool` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `tree` | `aria-label` | label.tree |
| `tree` | `role` | 'tree' |
| `item` | `aria-level` | node?.level |
| `item` | `aria-posinset` | node?.posInSet |
| `item` | `aria-setsize` | node?.setSize |
| `item` | `role` | 'treeitem' |
| `branch` | `aria-expanded` | 'true' \| 'false' |
| `branch` | `aria-level` | node?.level |
| `branch` | `aria-posinset` | node?.posInSet |
| `branch` | `aria-setsize` | node?.setSize |
| `branch` | `role` | 'treeitem' |
| `branch-trigger` | `aria-hidden` | 'true' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-text` | `aria-hidden` | 'true' |
| `branch-content` | `role` | 'group' |
| `preview` | `aria-hidden` | 'true' |
| `text` | `aria-label` | label.text |
| `text` | `role` | 'region' |
| `toolbar` | `aria-label` | label.toolbar |
| `toolbar` | `role` | 'group' |
| `wrap-trigger` | `aria-pressed` | 'true' \| 'false' |
| `status` | `aria-atomic` | 'true' |
| `status` | `aria-live` | 'polite' |
| `status` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/json-viewer.css` is written against `[data-scope="json-viewer"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-json-viewer` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `root` | `data-view` | context.get('view') |
| `item` | `data-circular` | '' (present only while the condition holds) |
| `item` | `data-current` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-match` | '' (present only while the condition holds) |
| `item` | `data-truncated` | '' (present only while the condition holds) |
| `item` | `data-value-type` | node?.type |
| `item-key` | `data-circular` | '' (present only while the condition holds) |
| `item-key` | `data-current` | '' (present only while the condition holds) |
| `item-key` | `data-highlighted` | '' (present only while the condition holds) |
| `item-key` | `data-match` | '' (present only while the condition holds) |
| `item-key` | `data-truncated` | '' (present only while the condition holds) |
| `item-key` | `data-value-type` | node?.type |
| `item-value` | `data-circular` | '' (present only while the condition holds) |
| `item-value` | `data-current` | '' (present only while the condition holds) |
| `item-value` | `data-highlighted` | '' (present only while the condition holds) |
| `item-value` | `data-match` | '' (present only while the condition holds) |
| `item-value` | `data-truncated` | '' (present only while the condition holds) |
| `item-value` | `data-value-type` | node?.type |
| `branch` | `data-circular` | '' (present only while the condition holds) |
| `branch` | `data-current` | '' (present only while the condition holds) |
| `branch` | `data-highlighted` | '' (present only while the condition holds) |
| `branch` | `data-match` | '' (present only while the condition holds) |
| `branch` | `data-state` | 'open' \| 'closed' |
| `branch` | `data-truncated` | '' (present only while the condition holds) |
| `branch` | `data-value-type` | node?.type |
| `branch-control` | `data-circular` | '' (present only while the condition holds) |
| `branch-control` | `data-current` | '' (present only while the condition holds) |
| `branch-control` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-control` | `data-match` | '' (present only while the condition holds) |
| `branch-control` | `data-pressed` | '' (present only while the condition holds) |
| `branch-control` | `data-state` | 'open' \| 'closed' |
| `branch-control` | `data-truncated` | '' (present only while the condition holds) |
| `branch-control` | `data-value-type` | node?.type |
| `branch-trigger` | `data-circular` | '' (present only while the condition holds) |
| `branch-trigger` | `data-current` | '' (present only while the condition holds) |
| `branch-trigger` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-trigger` | `data-match` | '' (present only while the condition holds) |
| `branch-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-truncated` | '' (present only while the condition holds) |
| `branch-trigger` | `data-value-type` | node?.type |
| `branch-indicator` | `data-circular` | '' (present only while the condition holds) |
| `branch-indicator` | `data-current` | '' (present only while the condition holds) |
| `branch-indicator` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-indicator` | `data-match` | '' (present only while the condition holds) |
| `branch-indicator` | `data-state` | 'open' \| 'closed' |
| `branch-indicator` | `data-truncated` | '' (present only while the condition holds) |
| `branch-indicator` | `data-value-type` | node?.type |
| `branch-text` | `data-circular` | '' (present only while the condition holds) |
| `branch-text` | `data-current` | '' (present only while the condition holds) |
| `branch-text` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-text` | `data-match` | '' (present only while the condition holds) |
| `branch-text` | `data-state` | 'open' \| 'closed' |
| `branch-text` | `data-truncated` | '' (present only while the condition holds) |
| `branch-text` | `data-value-type` | node?.type |
| `branch-summary` | `data-circular` | '' (present only while the condition holds) |
| `branch-summary` | `data-current` | '' (present only while the condition holds) |
| `branch-summary` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-summary` | `data-match` | '' (present only while the condition holds) |
| `branch-summary` | `data-state` | 'open' \| 'closed' |
| `branch-summary` | `data-truncated` | '' (present only while the condition holds) |
| `branch-summary` | `data-value-type` | node?.type |
| `branch-content` | `data-circular` | '' (present only while the condition holds) |
| `branch-content` | `data-current` | '' (present only while the condition holds) |
| `branch-content` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-content` | `data-match` | '' (present only while the condition holds) |
| `branch-content` | `data-state` | 'open' \| 'closed' |
| `branch-content` | `data-truncated` | '' (present only while the condition holds) |
| `branch-content` | `data-value-type` | node?.type |
| `preview` | `data-circular` | '' (present only while the condition holds) |
| `preview` | `data-current` | '' (present only while the condition holds) |
| `preview` | `data-highlighted` | '' (present only while the condition holds) |
| `preview` | `data-match` | '' (present only while the condition holds) |
| `preview` | `data-state` | 'open' \| 'closed' |
| `preview` | `data-truncated` | '' (present only while the condition holds) |
| `preview` | `data-value-type` | node?.type |
| `text` | `data-wrap` | '' (present only while the condition holds) |
| `token` | `data-kind` | props.kind |
| `toolbar` | `data-view` | context.get('view') |
| `expand-trigger` | `data-state` | 'open' \| 'closed' |
| `expand-trigger` | `data-xh-action-control` | '' |
| `expand-trigger` | `data-xh-action-display` | 'always' |
| `expand-trigger` | `data-xh-action-profile` | 'icon' |
| `expand-trigger` | `data-xh-action-size` | 'md' \| 'sm' |
| `expand-trigger` | `data-xh-action-variant` | 'ghost' |
| `wrap-trigger` | `data-state` | 'on' \| 'off' |
| `wrap-trigger` | `data-xh-action-control` | '' |
| `wrap-trigger` | `data-xh-action-display` | 'always' |
| `wrap-trigger` | `data-xh-action-profile` | 'icon' |
| `wrap-trigger` | `data-xh-action-size` | 'md' \| 'sm' |
| `wrap-trigger` | `data-xh-action-variant` | 'ghost' |
| `copy-trigger` | `data-copied` | '' (present only while the condition holds) |
| `copy-trigger` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `copy-trigger` | `data-xh-action-control` | '' |
| `copy-trigger` | `data-xh-action-display` | 'always' |
| `copy-trigger` | `data-xh-action-profile` | 'icon' |
| `copy-trigger` | `data-xh-action-size` | 'md' \| 'sm' |
| `copy-trigger` | `data-xh-action-variant` | 'ghost' |
| `view-trigger` | `data-view` | context.get('view') |
| `view-trigger` | `data-xh-action-control` | '' |
| `view-trigger` | `data-xh-action-display` | 'always' |
| `view-trigger` | `data-xh-action-profile` | 'icon' |
| `view-trigger` | `data-xh-action-size` | 'md' \| 'sm' |
| `view-trigger` | `data-xh-action-variant` | 'ghost' |
| `status` | `data-state` | 'idle' \| 'copying' \| 'copied' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-json-viewer-bg` | `empty`<br>`root`<br>`text`<br>`tree` | `background` | `default`<br>`is([data-scope='json-viewer'][data-part='tree'], [data-scope='json-viewer'][data-part='text'], [data-scope='json-viewer'][data-part='empty'])`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-json-viewer-boolean-fg` | `item-value`<br>`token` | `color` | `kind=boolean`<br>`value-type=boolean` | `--xh-syntax-keyword` |
| `--xh-json-viewer-border` | `empty`<br>`text`<br>`tree` | `border` | `default` | `--xh-border-default` |
| `--xh-json-viewer-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` |
| `--xh-json-viewer-empty-gap` | `empty` | `gap` | `default` | `--xh-space-2` |
| `--xh-json-viewer-empty-px` | `empty` | `padding-inline` | `default` | `--xh-space-4` |
| `--xh-json-viewer-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-6` |
| `--xh-json-viewer-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-json-viewer-font` | `root`<br>`text` | `font-family` | `default` | `--xh-font-family-mono` |
| `--xh-json-viewer-font-size` | `root` | `font-size` | `default` | `--xh-_json-viewer-font-size` |
| `--xh-json-viewer-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-json-viewer-indent` | `branch-content` | `padding-inline-start` | `default` | `--xh-_json-viewer-indent` |
| `--xh-json-viewer-indicator-fg` | `branch-trigger` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-json-viewer-indicator-size` | `branch-trigger` | `--xh-icon-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-json-viewer-key-fg` | `branch-text`<br>`item-key`<br>`token` | `color` | `default`<br>`kind=key` | `--xh-fg-brand-strong` |
| `--xh-json-viewer-key-font-weight` | `branch-text`<br>`item-key`<br>`token` | `font-weight` | `default`<br>`kind=key` | `--xh-font-weight-medium` |
| `--xh-json-viewer-mark-bg` | `mark` | `background` | `default` | `--xh-bg-brand-subtle` |
| `--xh-json-viewer-mark-bg-current` | `branch`<br>`branch-control`<br>`branch-text`<br>`item`<br>`item-key`<br>`item-value`<br>`mark` | `background` | `current` | `--xh-bg-brand` |
| `--xh-json-viewer-mark-fg` | `mark` | `color` | `default` | `--xh-fg-brand-strong` |
| `--xh-json-viewer-mark-fg-current` | `branch`<br>`branch-control`<br>`branch-text`<br>`item`<br>`item-key`<br>`item-value`<br>`mark` | `color` | `current` | `--xh-fg-on-brand` |
| `--xh-json-viewer-mark-radius` | `mark` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-json-viewer-max-h` | `text`<br>`tree` | `max-block-size` | `default` | `--xh-viewport-max-h` |
| `--xh-json-viewer-null-fg` | `item-value`<br>`token` | `color` | `kind=null`<br>`value-type=null` | `--xh-fg-subtle` |
| `--xh-json-viewer-number-fg` | `item-value`<br>`token` | `color` | `kind=number`<br>`value-type=number` | `--xh-syntax-number` |
| `--xh-json-viewer-preview-fg` | `preview` | `color` | `default` | `--xh-fg-muted` |
| `--xh-json-viewer-preview-font-size` | `preview` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-json-viewer-punctuation-fg` | `branch-text`<br>`item-key`<br>`item-value`<br>`token` | `color` | `default`<br>`kind=punctuation`<br>`value-type=array`<br>`value-type=object` | `--xh-fg-subtle` |
| `--xh-json-viewer-px` | `text`<br>`tree` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-json-viewer-py` | `text`<br>`tree` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-json-viewer-radius` | `empty`<br>`text`<br>`tree` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-json-viewer-row-bg-active` | `branch-control` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-json-viewer-row-bg-hover` | `branch-control`<br>`item` | `background` | `highlighted`<br>`is(:hover, [data-highlighted])` | `--xh-bg-subtle` |
| `--xh-json-viewer-row-gap` | `branch-control`<br>`item` | `gap` | `default` | `--xh-space-1` |
| `--xh-json-viewer-row-px` | `branch-control`<br>`item` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-json-viewer-row-py` | `branch-control`<br>`item` | `padding-block` | `default` | `--xh-_json-viewer-row-py` |
| `--xh-json-viewer-row-radius` | `branch-control`<br>`item` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-json-viewer-shadow` | `empty`<br>`text`<br>`tree` | `box-shadow` | `default` | `none` |
| `--xh-json-viewer-string-fg` | `item-value`<br>`token` | `color` | `kind=string`<br>`value-type=string` | `--xh-syntax-string` |
| `--xh-json-viewer-text-fg` | `text` | `color` | `default` | `--xh-fg-default` |
| `--xh-json-viewer-tool-fg` | `status`<br>`toolbar` | `color` | `where(:not([data-part='status'])` | `--xh-fg-muted` |
| `--xh-json-viewer-tool-fg-copied` | `copy-trigger` | `color` | `copied`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-success` |
| `--xh-json-viewer-tool-icon-size` | `status`<br>`toolbar` | `--xh-icon-size` | `where(:not([data-part='status'])` | `--xh-_action-profile-glyph-size` |
| `--xh-json-viewer-toolbar-gap` | `toolbar` | `gap` | `default` | `--xh-space-0_5` |
| `--xh-json-viewer-toolbar-mb` | `toolbar` | `margin-block-end` | `default` | `--xh-space-1` |
