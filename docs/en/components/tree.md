# Tree

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/tree).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tree" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tree.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tree" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tree" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tree.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="tree"`: `root` · `label` · **`tree`** · `item` · `item-indicator` · `item-text` · `item-description` · `item-suffix` · `branch` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-description` · `branch-content` · `branch-loading` · `branch-error` · `branch-retry-trigger` · `branch-empty` · `node-drag-trigger` · `empty` · `loading` · `live-region`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-tree>` |
| Vue components | `XhTreeBranch` `XhTreeBranchContent` `XhTreeBranchControl` `XhTreeBranchDescription` `XhTreeBranchEmpty` `XhTreeBranchError` `XhTreeBranchIndicator` `XhTreeBranchLoading` `XhTreeBranchRetryTrigger` `XhTreeBranchText` `XhTreeBranchTrigger` `XhTreeEmpty` `XhTreeItem` `XhTreeItemDescription` `XhTreeItemIndicator` `XhTreeItemSuffix` `XhTreeItemText` `XhTreeLabel` `XhTreeLiveRegion` `XhTreeLoading` `XhTreeNodeDragTrigger` `XhTreeRoot` `XhTreeTree` |
| Composable | `useTree` |
| State machine | `treeMachine` |
| Skin | `@xihan-ui/styles/tree.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `collection` | `TreeNode[]` |  |
| `virtualizer` | `CollectionVirtualizer` |  |
| `variant` | `ControlVariant` |  |
| `size` | `Size` |  |
| `leafOrientation` | `Orientation` |  |
| `expandedValue` | `string[]` |  |
| `defaultExpandedValue` | `string[]` |  |
| `selection` | `string[]` |  |
| `defaultSelection` | `string[]` |  |
| `selectionMode` | `TreeSelectionMode` |  |
| `cascade` | `boolean` |  |
| `checkedStrategy` | `CascadeStrategy` |  |
| `expandOnClick` | `boolean` |  |
| `disabled` | `boolean` |  |
| `loading` | `boolean` |  |
| `loadingValue` | `string[]` |  |
| `loadChildren` | `BranchLoadChildren<TreeNode>` |  |
| `lines` | `boolean` |  |
| `loop` | `boolean` |  |
| `typeahead` | `boolean` |  |
| `dir` | `Direction` |  |
| `translations` | `Partial<TreeTranslations>` |  |
| `nodeDraggable` | `boolean` |  |
| `allowDrop` | `(move: TreeMove) => boolean` |  |
| `onNodeMove` | `(move: TreeMove) => void` |  |
| `onExpandedValueChange` | `(details: TreeExpandedValueChangeDetails) => void` |  |
| `onSelectionChange` | `(details: TreeSelectionChangeDetails) => void` |  |
| `onBranchLoadStart` | `(details: TreeBranchLoadStartDetails) => void` |  |
| `onBranchLoad` | `(details: TreeBranchLoadDetails) => void` |  |
| `onBranchLoadError` | `(details: TreeBranchLoadErrorDetails) => void` |  |

### TreeNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `disabled` | `boolean` |  |
| `draggable` | `boolean` |  |
| `tone` | `Tone` |  |
| `description` | `string` |  |
| `children` | `TreeNode[]` |  |
| `hasChildren` | `boolean` |  |
| `childrenOrientation` | `Orientation` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `expanded-value-change` | `TreeExpandedValueChangeDetails` |
| `selection-change` | `TreeSelectionChangeDetails` |
| `node-move` | `TreeNodeMoveDetails` |
| `branch-load-start` | `TreeBranchLoadStartDetails` |
| `branch-load` | `TreeBranchLoadDetails` |
| `branch-load-error` | `TreeBranchLoadErrorDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTreeRoot` | `default` | `TreeRootSlotProps` |
| `XhTreeRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTreeBranch` | `value` | `string` | Yes |
| `XhTreeItem` | `value` | `string` | Yes |
| `XhTreeRoot` | `label` | `ReactNode` |  |
| `XhTreeRoot` | `children` | `SlotChildren<TreeRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `branch` | 'open' \| 'closed' |
| `branch-control` | 'open' \| 'closed' |
| `branch-trigger` | 'open' \| 'closed' |
| `branch-indicator` | 'open' \| 'closed' |
| `branch-text` | 'open' \| 'closed' |
| `branch-description` | 'open' \| 'closed' |
| `branch-content` | 'open' \| 'closed' |
| `branch-loading` | 'open' \| 'closed' |
| `branch-error` | 'open' \| 'closed' |
| `branch-retry-trigger` | 'open' \| 'closed' |
| `branch-empty` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `BRANCH.RETRY` · `SELECTION.SET` · `NODE.SELECT` · `NODE.FOCUS` · `TREE.BLUR` · `NODE_DRAG.START` · `NODE_DRAG.MOVE` · `NODE_DRAG.END` · `NODE_DRAG.CANCEL` · `NODE.MOVE_BY` · `PRESS.START` · `PRESS.END`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `collection` | `readonly TreeNode[]` |
| `visibleNodes` | `readonly TreeVisibleNode[]` |
| `dropTarget` | `DropTarget \| null` |
| `announcement` | `string` |
| `expandedValue` | `string[]` |
| `selection` | `string[]` |
| `focusedValue` | `string \| null` |
| `selectionMode` | `TreeSelectionMode` |
| `disabled` | `boolean` |
| `translations` | `TreeTranslations` |
| `isExpanded` | `(value: string) => boolean` |
| `isSelected` | `(value: string) => boolean` |
| `isIndeterminate` | `(value: string) => boolean` |
| `branchLoadState` | `(value: string) => TreeBranchLoadSnapshot \| null` |
| `setExpandedValue` | `(next: string[]) => void` |
| `setSelection` | `(next: string[]) => void` |
| `expand` | `(value: string) => void` |
| `collapse` | `(value: string) => void` |
| `retryBranch` | `(value: string) => void` |
| `select` | `(value: string, options?: { extend?: boolean, additive?: boolean }) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getTreeProps` | `() => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getLoadingProps` | `() => T['element']` |
| `getNodeDragTriggerProps` | `(props: TreeNodeProps) => T['element']` |
| `getLiveRegionProps` | `() => T['element']` |
| `getItemProps` | `(props: TreeNodeProps) => T['element']` |
| `getItemTextProps` | `(props: TreeNodeProps) => T['element']` |
| `getItemDescriptionProps` | `(props: TreeNodeProps) => T['element']` |
| `getItemSuffixProps` | `(props: TreeNodeProps) => T['element']` |
| `getItemIndicatorProps` | `(props: TreeNodeProps) => T['element']` |
| `getBranchProps` | `(props: TreeNodeProps) => T['element']` |
| `getBranchControlProps` | `(props: TreeNodeProps) => T['element']` |
| `getBranchTriggerProps` | `(props: TreeNodeProps) => T['element']` |
| `getBranchIndicatorProps` | `(props: TreeNodeProps) => T['element']` |
| `getBranchTextProps` | `(props: TreeNodeProps) => T['element']` |
| `getBranchDescriptionProps` | `(props: TreeNodeProps) => T['element']` |
| `getBranchContentProps` | `(props: TreeNodeProps) => T['element']` |
| `getBranchLoadingProps` | `(props: TreeNodeProps) => T['element']` |
| `getBranchErrorProps` | `(props: TreeNodeProps) => T['element']` |
| `getBranchRetryTriggerProps` | `(props: TreeNodeProps) => T['button']` |
| `getBranchEmptyProps` | `(props: TreeNodeProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `tree.kbd.tab` |
| `ArrowDown` | `tree.kbd.next` |
| `ArrowUp` | `tree.kbd.prev` |
| `Home` | `tree.kbd.first` |
| `End` | `tree.kbd.last` |
| `ArrowRight` | `tree.kbd.expand` |
| `ArrowLeft` | `tree.kbd.collapse` |
| `Enter` / `Space` | `tree.kbd.select` |
| `Enter` / `Space` | `tree.kbd.retry` |
| `Ctrl+Space` / `Cmd+Space` | `tree.kbd.toggle` |
| `Enter` / `Space` | `tree.kbd.press` |
| `*` | `tree.kbd.expand-siblings` |
| any single printable character | `tree.kbd.typeahead` |
| `Alt+ArrowUp` / `Alt+ArrowDown` | `tree.kbd.node-move` |
| `Alt+ArrowLeft` / `Alt+ArrowRight` | `tree.kbd.node-move-level` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `tree` | `aria-busy` | 'true' \| undefined |
| `tree` | `aria-disabled` | 'true' \| 'false' |
| `tree` | `aria-labelledby` | id of the `label` part \| undefined |
| `tree` | `aria-multiselectable` | 'true' \| 'false' |
| `tree` | `aria-orientation` | 'vertical' |
| `tree` | `role` | 'tree' |
| `item` | `aria-checked` | 'true' \| 'mixed' \| 'false' \| undefined |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-level` | meta?.level |
| `item` | `aria-posinset` | meta?.posInSet |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `aria-setsize` | meta?.setSize |
| `item` | `role` | 'treeitem' |
| `item-indicator` | `aria-hidden` | 'true' |
| `branch` | `aria-busy` | 'true' \| undefined |
| `branch` | `aria-checked` | 'true' \| 'mixed' \| 'false' \| undefined |
| `branch` | `aria-disabled` | 'true' \| 'false' |
| `branch` | `aria-expanded` | 'true' \| 'false' |
| `branch` | `aria-level` | meta?.level |
| `branch` | `aria-posinset` | meta?.posInSet |
| `branch` | `aria-selected` | 'true' \| 'false' |
| `branch` | `aria-setsize` | meta?.setSize |
| `branch` | `role` | 'treeitem' |
| `branch-trigger` | `aria-hidden` | 'true' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `role` | 'group' |
| `branch-loading` | `role` | 'status' |
| `branch-error` | `role` | 'alert' |
| `branch-retry-trigger` | `aria-label` | translations.retry |
| `branch-empty` | `role` | 'status' |
| `node-drag-trigger` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/tree.css` is written against `[data-scope="tree"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-tree` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-orientation` | 'vertical' |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `tree` | `data-disabled` | '' (present only while the condition holds) |
| `tree` | `data-lines` | '' (present only while the condition holds) |
| `tree` | `data-loading` | '' (present only while the condition holds) |
| `tree` | `data-orientation` | 'vertical' |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-draggable` | '' (present only while the condition holds) |
| `item` | `data-dragging` | '' (present only while the condition holds) |
| `item` | `data-drop` | 'before' \| 'after' \| 'inside' |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-indeterminate` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-selected` | '' (present only while the condition holds) |
| `item` | `data-tone` | metaOf(value)?.tone |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-indicator` | `data-disabled` | '' (present only while the condition holds) |
| `item-indicator` | `data-highlighted` | '' (present only while the condition holds) |
| `item-indicator` | `data-indeterminate` | '' (present only while the condition holds) |
| `item-indicator` | `data-selected` | '' (present only while the condition holds) |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `item-text` | `data-disabled` | '' (present only while the condition holds) |
| `item-text` | `data-highlighted` | '' (present only while the condition holds) |
| `item-text` | `data-indeterminate` | '' (present only while the condition holds) |
| `item-text` | `data-selected` | '' (present only while the condition holds) |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-description` | `data-disabled` | '' (present only while the condition holds) |
| `item-description` | `data-highlighted` | '' (present only while the condition holds) |
| `item-description` | `data-indeterminate` | '' (present only while the condition holds) |
| `item-description` | `data-selected` | '' (present only while the condition holds) |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-suffix` | `data-disabled` | '' (present only while the condition holds) |
| `item-suffix` | `data-highlighted` | '' (present only while the condition holds) |
| `item-suffix` | `data-indeterminate` | '' (present only while the condition holds) |
| `item-suffix` | `data-selected` | '' (present only while the condition holds) |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `branch` | `data-disabled` | '' (present only while the condition holds) |
| `branch` | `data-empty` | '' (present only while the condition holds) |
| `branch` | `data-error` | '' (present only while the condition holds) |
| `branch` | `data-highlighted` | '' (present only while the condition holds) |
| `branch` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch` | `data-load-state` | branchLoadState(value)?.status |
| `branch` | `data-loading` | '' (present only while the condition holds) |
| `branch` | `data-selected` | '' (present only while the condition holds) |
| `branch` | `data-state` | 'open' \| 'closed' |
| `branch-control` | `data-disabled` | '' (present only while the condition holds) |
| `branch-control` | `data-draggable` | '' (present only while the condition holds) |
| `branch-control` | `data-dragging` | '' (present only while the condition holds) |
| `branch-control` | `data-drop` | 'before' \| 'after' \| 'inside' |
| `branch-control` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-control` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-control` | `data-pressed` | '' (present only while the condition holds) |
| `branch-control` | `data-selected` | '' (present only while the condition holds) |
| `branch-control` | `data-state` | 'open' \| 'closed' |
| `branch-control` | `data-tone` | metaOf(value)?.tone |
| `branch-control` | `data-xh-collection-context` | 'overlay' |
| `branch-control` | `data-xh-collection-item` | '' |
| `branch-control` | `data-xh-collection-size` | props.size |
| `branch-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `branch-trigger` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-trigger` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-trigger` | `data-selected` | '' (present only while the condition holds) |
| `branch-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-xh-collection-slot` | 'prefix' |
| `branch-indicator` | `data-disabled` | '' (present only while the condition holds) |
| `branch-indicator` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-indicator` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-indicator` | `data-selected` | '' (present only while the condition holds) |
| `branch-indicator` | `data-state` | 'open' \| 'closed' |
| `branch-indicator` | `data-xh-collection-slot` | 'prefix' |
| `branch-text` | `data-disabled` | '' (present only while the condition holds) |
| `branch-text` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-text` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-text` | `data-selected` | '' (present only while the condition holds) |
| `branch-text` | `data-state` | 'open' \| 'closed' |
| `branch-text` | `data-xh-collection-slot` | 'text' |
| `branch-description` | `data-disabled` | '' (present only while the condition holds) |
| `branch-description` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-description` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-description` | `data-selected` | '' (present only while the condition holds) |
| `branch-description` | `data-state` | 'open' \| 'closed' |
| `branch-description` | `data-xh-collection-slot` | 'description' |
| `branch-content` | `data-disabled` | '' (present only while the condition holds) |
| `branch-content` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-content` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-content` | `data-orientation` | 'horizontal' \| 'vertical' |
| `branch-content` | `data-selected` | '' (present only while the condition holds) |
| `branch-content` | `data-state` | 'open' \| 'closed' |
| `branch-loading` | `data-disabled` | '' (present only while the condition holds) |
| `branch-loading` | `data-empty` | '' (present only while the condition holds) |
| `branch-loading` | `data-error` | '' (present only while the condition holds) |
| `branch-loading` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-loading` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-loading` | `data-load-state` | branchLoadState(value)?.status |
| `branch-loading` | `data-loading` | '' (present only while the condition holds) |
| `branch-loading` | `data-selected` | '' (present only while the condition holds) |
| `branch-loading` | `data-state` | 'open' \| 'closed' |
| `branch-loading` | `data-xh-loading-ring` | '' |
| `branch-error` | `data-disabled` | '' (present only while the condition holds) |
| `branch-error` | `data-empty` | '' (present only while the condition holds) |
| `branch-error` | `data-error` | '' (present only while the condition holds) |
| `branch-error` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-error` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-error` | `data-load-state` | branchLoadState(value)?.status |
| `branch-error` | `data-selected` | '' (present only while the condition holds) |
| `branch-error` | `data-state` | 'open' \| 'closed' |
| `branch-retry-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-empty` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-error` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-load-state` | branchLoadState(value)?.status |
| `branch-retry-trigger` | `data-selected` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-empty` | `data-disabled` | '' (present only while the condition holds) |
| `branch-empty` | `data-empty` | '' (present only while the condition holds) |
| `branch-empty` | `data-error` | '' (present only while the condition holds) |
| `branch-empty` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-empty` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-empty` | `data-load-state` | branchLoadState(value)?.status |
| `branch-empty` | `data-selected` | '' (present only while the condition holds) |
| `branch-empty` | `data-state` | 'open' \| 'closed' |
| `node-drag-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `node-drag-trigger` | `data-dragging` | '' (present only while the condition holds) |
| `node-drag-trigger` | `data-xh-collection-slot` | 'prefix' |
| `empty` | `data-disabled` | '' (present only while the condition holds) |
| `loading` | `data-disabled` | '' (present only while the condition holds) |
| `loading` | `data-loading` | '' (present only while the condition holds) |
| `loading` | `data-xh-loading-ring` | '' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-tree-bg` | `root`<br>`tree` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-tree-border` | `tree` | `border` | `default` | `--xh-border-default` |
| `--xh-tree-branch-content-gap` | `branch`<br>`branch-content`<br>`branch-control`<br>`item`<br>`tree` | `background`<br>`gap`<br>`inset-block`<br>`row-gap` | `default`<br>`lines`<br>`not(:last-child)`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-space-0` |
| `--xh-tree-branch-error-fg` | `branch-error` | `background-color` | `default` | `--xh-fg-danger` |
| `--xh-tree-branch-gap` | `branch`<br>`branch-content`<br>`branch-control`<br>`item`<br>`tree` | `background`<br>`gap`<br>`inset-block` | `default`<br>`first-child`<br>`lines`<br>`orientation=vertical`<br>`state=open` | `--xh-space-0` |
| `--xh-tree-branch-indicator-fg` | `branch-indicator`<br>`branch-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tree-branch-loading-fg` | `branch`<br>`branch-control`<br>`branch-indicator`<br>`branch-trigger` | `color` | `loading` | `--xh-fg-brand` |
| `--xh-tree-branch-retry-fg` | `branch-retry-trigger` | `color` | `default` | `--xh-fg-brand` |
| `--xh-tree-branch-status-fg` | `branch-empty`<br>`branch-error`<br>`branch-loading` | `color` | `is([data-part='branch-loading'], [data-part='branch-empty'], [data-part='branch-error'])` | `--xh-fg-muted` |
| `--xh-tree-branch-status-font-size` | `branch-empty`<br>`branch-error`<br>`branch-loading`<br>`branch-retry-trigger` | `font-size` | `default`<br>`is([data-part='branch-loading'], [data-part='branch-empty'], [data-part='branch-error'])` | `--xh-_tree-font-size` |
| `--xh-tree-branch-status-py` | `branch-empty`<br>`branch-error`<br>`branch-loading` | `padding-block` | `is([data-part='branch-loading'], [data-part='branch-empty'], [data-part='branch-error'])` | `--xh-_tree-row-py` |
| `--xh-tree-drag-fg` | `node-drag-trigger` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-tree-drag-fg-active` | `node-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` |
| `--xh-tree-drag-fg-disabled` | `node-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-tree-drag-grip-long` | `node-drag-trigger` | `inline-size` | `empty` | `--xh-space-2` |
| `--xh-tree-drag-grip-short` | `node-drag-trigger` | `block-size` | `empty` | `--xh-space-1` |
| `--xh-tree-drag-radius` | `node-drag-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-tree-drag-size` | `node-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-_tree-indicator` |
| `--xh-tree-dragging-opacity` | `branch-control`<br>`item` | `opacity` | `dragging` | `--xh-state-dragging-opacity` |
| `--xh-tree-drop-fg` | `branch-control`<br>`item` | `background`<br>`box-shadow` | `disabled`<br>`drop=after`<br>`drop=before`<br>`drop=inside`<br>`is([data-drop='before'], [data-drop='after'])`<br>`not([data-disabled])` | `--xh-bg-brand` |
| `--xh-tree-drop-inside-bg` | `branch-control`<br>`item` | `background` | `disabled`<br>`drop=inside`<br>`not([data-disabled])` | `--xh-bg-subtle-hover` |
| `--xh-tree-drop-line` | `branch-control`<br>`item` | `block-size`<br>`box-shadow` | `disabled`<br>`drop=after`<br>`drop=before`<br>`drop=inside`<br>`is([data-drop='before'], [data-drop='after'])`<br>`not([data-disabled])` | `--xh-stroke-thick` |
| `--xh-tree-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tree-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_tree-font-size` |
| `--xh-tree-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_tree-row-px` |
| `--xh-tree-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-tree-fg` | `tree` | `color` | `default` | `--xh-fg-default` |
| `--xh-tree-gap` | `root` | `gap` | `default` | `--xh-space-2` |
| `--xh-tree-icon-size` | `branch-control`<br>`item`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-_collection-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-tree-indent` | `branch`<br>`branch-content`<br>`branch-control`<br>`branch-empty`<br>`branch-error`<br>`branch-loading`<br>`branch-retry-trigger`<br>`item`<br>`tree` | `inline-size`<br>`inset-inline-start`<br>`margin-inline-start`<br>`padding-inline`<br>`padding-inline-start` | `default`<br>`is([data-part='branch-loading'], [data-part='branch-empty'], [data-part='branch-error'])`<br>`lines`<br>`not(:last-child)`<br>`orientation=vertical` | `--xh-_tree-indent` |
| `--xh-tree-indicator-size` | `branch`<br>`branch-content`<br>`branch-control`<br>`branch-description`<br>`branch-indicator`<br>`branch-trigger`<br>`item`<br>`item-indicator`<br>`tree` | `--xh-icon-size`<br>`inline-size`<br>`inset-inline-start`<br>`padding-inline-start` | `default`<br>`has(> [data-scope='tree'][data-part='branch-trigger']:first-child)`<br>`lines`<br>`not(:last-child)`<br>`orientation=vertical` | `--xh-_tree-indicator` |
| `--xh-tree-item-check-fg` | `branch-control`<br>`item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-tree-item-indicator-fg` |
| `--xh-tree-item-indicator-fg` | `branch-control`<br>`item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-fg-brand` |
| `--xh-tree-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tree-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-tree-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-tree-leaf-row-gap` | `branch-content` | `column-gap` | `orientation=horizontal` | `--xh-space-3` |
| `--xh-tree-line-color` | `branch`<br>`branch-content`<br>`branch-control`<br>`item`<br>`tree` | `background`<br>`border-block-end`<br>`border-inline-start` | `last-child`<br>`lines`<br>`not(:last-child)`<br>`orientation=vertical` | `--xh-border-default` |
| `--xh-tree-loading-fg` | `loading` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tree-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_tree-font-size` |
| `--xh-tree-loading-gap` | `loading` | `gap` | `default` | `--xh-_tree-row-gap` |
| `--xh-tree-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_tree-row-px` |
| `--xh-tree-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-tree-max-h` | `tree` | `max-block-size` | `default` | `--xh-viewport-h-lg` |
| `--xh-tree-px` | `tree` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-tree-py` | `tree` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-tree-radius` | `tree` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-tree-row-bg-hover` | `branch-control`<br>`item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-tree-row-bg-pressed` | `branch-control`<br>`item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-tree-row-fg` | `branch-control`<br>`item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-default` |
| `--xh-tree-row-fg-selected` | `branch-control`<br>`item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-tree-row-fg` |
| `--xh-tree-row-font-size` | `branch-control`<br>`item` | `font-size` | `default` | `--xh-_tree-font-size` |
| `--xh-tree-row-gap` | `branch-control`<br>`branch-description`<br>`item` | `gap`<br>`padding-inline-start` | `default`<br>`has(> [data-scope='tree'][data-part='branch-trigger']:first-child)`<br>`orientation=vertical` | `--xh-_tree-row-gap` |
| `--xh-tree-row-leading` | `branch-control`<br>`item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-tree-row-loading-opacity` | `branch-control`<br>`item`<br>`tree` | `opacity` | `is([data-scope='tree'][data-part='item'], [data-scope='tree'][data-part='branch-control'])`<br>`loading` | `--xh-state-disabled-opacity` |
| `--xh-tree-row-px` | `branch`<br>`branch-content`<br>`branch-control`<br>`item`<br>`tree` | `inline-size`<br>`inset-inline-start`<br>`padding-inline`<br>`padding-inline-start` | `default`<br>`lines`<br>`not(:last-child)`<br>`orientation=vertical` | `--xh-_tree-row-px` |
| `--xh-tree-row-py` | `branch-control`<br>`item` | `padding-block` | `default` | `--xh-_tree-row-py` |
| `--xh-tree-row-radius` | `branch-control`<br>`item` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-tree-row-selected-font-weight` | `branch-control`<br>`item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-regular` |
| `--xh-tree-tree-gap` | `tree` | `gap` | `default` | `--xh-space-0` |
