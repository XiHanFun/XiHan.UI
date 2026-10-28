# TreeSelect

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/tree-select).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tree-select" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tree-select.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tree-select" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tree-select" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tree-select.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="tree-select"`: `root` · `label` · `control` · **`trigger`** · `value-text` · `tag-list` · `indicator` · `clear-trigger` · `positioner` · **`content`** · `input` · **`tree`** · `item` · `item-text` · `item-description` · `item-suffix` · `item-indicator` · `branch` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content` · `branch-loading` · `branch-error` · `branch-retry-trigger` · `branch-empty` · `empty` · `loading` · `footer` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-tree-select>` |
| Vue components | `XhTreeSelectBranch` `XhTreeSelectBranchContent` `XhTreeSelectBranchControl` `XhTreeSelectBranchEmpty` `XhTreeSelectBranchError` `XhTreeSelectBranchIndicator` `XhTreeSelectBranchLoading` `XhTreeSelectBranchRetryTrigger` `XhTreeSelectBranchText` `XhTreeSelectBranchTrigger` `XhTreeSelectClearTrigger` `XhTreeSelectContent` `XhTreeSelectControl` `XhTreeSelectEmpty` `XhTreeSelectFooter` `XhTreeSelectHiddenInput` `XhTreeSelectIndicator` `XhTreeSelectInput` `XhTreeSelectItem` `XhTreeSelectItemDeleteTrigger` `XhTreeSelectItemDescription` `XhTreeSelectItemIndicator` `XhTreeSelectItemSuffix` `XhTreeSelectItemText` `XhTreeSelectLabel` `XhTreeSelectLoading` `XhTreeSelectOverflowTag` `XhTreeSelectPositioner` `XhTreeSelectRoot` `XhTreeSelectTag` `XhTreeSelectTagLabel` `XhTreeSelectTagList` `XhTreeSelectTree` `XhTreeSelectTrigger` `XhTreeSelectValueText` |
| Composable | `useTreeSelect` |
| State machine | `treeSelectMachine` |
| Skin | `@xihan-ui/styles/tree-select.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `collection` | `TreeSelectNode[]` |  |
| `virtualizer` | `CollectionVirtualizer` |  |
| `loadChildren` | `(request: TreeSelectLoadChildrenRequest) => Promise<TreeSelectNode[] \| undefined \| void> \| TreeSelectNode[] \| undefined \| void` |  |
| `value` | `string \| string[]` |  |
| `defaultValue` | `string \| string[]` |  |
| `expandedValue` | `string[]` |  |
| `defaultExpandedValue` | `string[]` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `multiple` | `boolean` |  |
| `maxTagCount` | `number` |  |
| `searchable` | `boolean` |  |
| `filter` | `TreeSelectFilter` |  |
| `cascade` | `boolean` |  |
| `checkedStrategy` | `CascadeStrategy` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `loading` | `boolean` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `placeholder` | `string` |  |
| `translations` | `Partial<TreeSelectTranslations>` |  |
| `placement` | `Placement` |  |
| `offset` | `number` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `name` | `string` |  |
| `form` | `string` |  |
| `onValueChange` | `(details: TreeSelectValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |
| `onExpandedValueChange` | `(details: TreeSelectExpandedValueChangeDetails) => void` |  |
| `onOpenChange` | `(details: TreeSelectOpenChangeDetails) => void` |  |
| `onBranchLoadStart` | `(details: TreeSelectBranchLoadStartDetails) => void` |  |
| `onBranchLoad` | `(details: TreeSelectBranchLoadDetails) => void` |  |
| `onBranchLoadError` | `(details: TreeSelectBranchLoadErrorDetails) => void` |  |

### TreeSelectNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `children` | `TreeSelectNode[]` |  |
| `hasChildren` | `boolean` |  |
| `disabled` | `boolean` |  |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `draggable` | `boolean` |  |
| `tone` | `Tone` |  |
| `description` | `string` |  |
| `childrenOrientation` | `Orientation` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `TreeSelectValueChangeDetails` |
| `clear` | `` |
| `expanded-value-change` | `TreeSelectExpandedValueChangeDetails` |
| `open-change` | `TreeSelectOpenChangeDetails` |
| `branch-load-start` | `TreeSelectBranchLoadStartDetails` |
| `branch-load` | `TreeSelectBranchLoadDetails` |
| `branch-load-error` | `TreeSelectBranchLoadErrorDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTreeSelectRoot` | `default` | `TreeSelectRootSlotProps` |
| `XhTreeSelectRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTreeSelectBranch` | `value` | `string` | Yes |
| `XhTreeSelectItem` | `value` | `string` | Yes |
| `XhTreeSelectPositioner` | `container` | `() => Element \| null` |  |
| `XhTreeSelectRoot` | `label` | `ReactNode` |  |
| `XhTreeSelectRoot` | `clearable` | `boolean` |  |
| `XhTreeSelectRoot` | `children` | `SlotChildren<TreeSelectRootSlotProps>` |  |
| `XhTreeSelectTag` | `value` | `string` | Yes |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `tree` | 'open' \| 'closed' |
| `branch` | 'open' \| 'closed' |
| `branch-control` | 'open' \| 'closed' |
| `branch-trigger` | 'open' \| 'closed' |
| `branch-indicator` | 'open' \| 'closed' |
| `branch-text` | 'open' \| 'closed' |
| `branch-content` | 'open' \| 'closed' |
| `branch-loading` | 'open' \| 'closed' |
| `branch-error` | 'open' \| 'closed' |
| `branch-retry-trigger` | 'open' \| 'closed' |
| `branch-empty` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |
| `footer` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `NODE.FOCUS` · `NODE.LOST` · `NODE.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `BRANCH.RETRY` · `NODE.MOUNT` · `NODE.UNMOUNT` · `NODES.SYNC` · `INPUT.CHANGE` · `FORM.RESET` · `PRESS.START` · `PRESS.END` · `TAG_LIST.TRACKED`

**Guards**: `isOpenControlled` · `isMultiple` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `collection` | `readonly TreeSelectNode[]` |
| `visibleNodes` | `readonly TreeVisibleNode[]` |
| `value` | `string[]` |
| `expandedValue` | `string[]` |
| `valueText` | `string \| null` |
| `displayText` | `string` |
| `focusedValue` | `string \| null` |
| `empty` | `boolean` |
| `loading` | `boolean` |
| `searching` | `boolean` |
| `inputValue` | `string` |
| `translations` | `TreeSelectTranslations` |
| `multiple` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `required` | `boolean` |
| `canClear` | `boolean` |
| `tags` | `TreeSelectTagMeta[]` |
| `overflowCount` | `number` |
| `overflowText` | `string` |
| `isSelected` | `(value: string) => boolean` |
| `isIndeterminate` | `(value: string) => boolean` |
| `isExpanded` | `(value: string) => boolean` |
| `branchLoadState` | `(value: string) => TreeSelectBranchLoadSnapshot \| null` |
| `setOpen` | `(next: boolean) => void` |
| `setValue` | `(next: string[]) => void` |
| `setExpandedValue` | `(next: string[]) => void` |
| `setInputValue` | `(next: string) => void` |
| `expand` | `(value: string) => void` |
| `collapse` | `(value: string) => void` |
| `retryBranch` | `(value: string) => void` |
| `select` | `(value: string) => void` |
| `clear` | `() => void` |
| `deselect` | `(value: string) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getControlProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getValueTextProps` | `() => T['element']` |
| `getTagListProps` | `() => T['element']` |
| `getTagProps` | `(props: TreeSelectTagProps) => T['element']` |
| `getTagLabelProps` | `() => T['element']` |
| `getOverflowTagProps` | `() => T['element']` |
| `getItemDeleteTriggerProps` | `(props: TreeSelectTagProps) => T['button']` |
| `getIndicatorProps` | `() => T['element']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getInputProps` | `() => T['input']` |
| `getTreeProps` | `() => T['element']` |
| `getItemProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getItemTextProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getItemDescriptionProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getItemSuffixProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getItemIndicatorProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getBranchProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getBranchControlProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getBranchTriggerProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getBranchIndicatorProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getBranchTextProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getBranchContentProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getBranchLoadingProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getBranchErrorProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getBranchRetryTriggerProps` | `(props: TreeSelectNodeProps) => T['button']` |
| `getBranchEmptyProps` | `(props: TreeSelectNodeProps) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getLoadingProps` | `() => T['element']` |
| `getFooterProps` | `() => T['element']` |
| `getHiddenInputProps` | `(props?: { value: string }) => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `tree-select.kbd.open` |
| `ArrowDown` | `tree-select.kbd.open-next` |
| `ArrowUp` | `tree-select.kbd.open-prev` |
| `Delete` | `tree-select.kbd.clear` |
| `Backspace` | `tree-select.kbd.clear-last` |
| `ArrowDown` | `tree-select.kbd.next` |
| `ArrowUp` | `tree-select.kbd.prev` |
| `Home` | `tree-select.kbd.first` |
| `End` | `tree-select.kbd.last` |
| `ArrowRight` | `tree-select.kbd.expand` |
| `ArrowLeft` | `tree-select.kbd.collapse` |
| `Enter` / `Space` | `tree-select.kbd.select` |
| `Enter` / `Space` | `tree-select.kbd.press` |
| `Enter` / `Space` | `tree-select.kbd.retry` |
| `*` | `tree-select.kbd.expand-siblings` |
| any single printable character | `tree-select.kbd.typeahead` |
| any single printable character | `tree-select.kbd.type-to-search` |
| printable characters | `tree-select.kbd.search-type` |
| `ArrowDown` / `Enter` | `tree-select.kbd.search-to-tree` |
| `Escape` | `tree-select.kbd.search-escape` |
| `Escape` | `tree-select.kbd.escape` |
| `Tab` / `Shift+Tab` | `tree-select.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `tree` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'tree' |
| `trigger` | `aria-invalid` | 'true' \| 'false' |
| `trigger` | `aria-label` | props.ariaLabel |
| `trigger` | `aria-labelledby` | id of the `label` part id of the `value-text` part \| id of the `trigger` part id of the `value-text` part \| id of the `value-text` part |
| `trigger` | `aria-readonly` | 'true' \| 'false' |
| `trigger` | `aria-required` | 'true' \| 'false' |
| `trigger` | `role` | 'combobox' |
| `indicator` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | translations.clearTrigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `input` | `aria-controls` | id of the `tree` part |
| `input` | `aria-label` | translations.searchInput |
| `tree` | `aria-busy` | 'true' \| undefined |
| `tree` | `aria-disabled` | 'true' \| 'false' |
| `tree` | `aria-label` | translations.tree |
| `tree` | `aria-labelledby` | id of the `label` part id of the `value-text` part \| id of the `trigger` part id of the `value-text` part \| id of the `value-text` part |
| `tree` | `aria-multiselectable` | 'true' \| 'false' |
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
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |
| `hidden-input` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/tree-select.css` is written against `[data-scope="tree-select"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-tree-select` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `label` | `data-required` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-state` | 'open' \| 'closed' |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-action-owner` | '' |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-invalid` | '' (present only while the condition holds) |
| `trigger` | `data-placeholder` | '' (present only while the condition holds) |
| `trigger` | `data-readonly` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `value-text` | `data-disabled` | '' (present only while the condition holds) |
| `value-text` | `data-placeholder` | '' (present only while the condition holds) |
| `tag-list` | `data-disabled` | '' (present only while the condition holds) |
| `tag-list` | `data-instant` | '' (present only while the condition holds) |
| `tag-list` | `data-xh-tag-list` | '' |
| `indicator` | `data-clearable` | '' (present only while the condition holds) |
| `indicator` | `data-disabled` | '' (present only while the condition holds) |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `clear-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-placement` | actual placement computed by the positioning engine |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-xh-material` | 'frosted' |
| `input` | `data-xh-field-input` | '' |
| `tree` | `data-disabled` | '' (present only while the condition holds) |
| `tree` | `data-empty` | '' (present only while the condition holds) |
| `tree` | `data-state` | 'open' \| 'closed' |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-indeterminate` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-selected` | '' (present only while the condition holds) |
| `item` | `data-tone` | metaOf(v)?.tone |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
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
| `item-indicator` | `data-disabled` | '' (present only while the condition holds) |
| `item-indicator` | `data-highlighted` | '' (present only while the condition holds) |
| `item-indicator` | `data-indeterminate` | '' (present only while the condition holds) |
| `item-indicator` | `data-selected` | '' (present only while the condition holds) |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `branch` | `data-disabled` | '' (present only while the condition holds) |
| `branch` | `data-empty` | '' (present only while the condition holds) |
| `branch` | `data-error` | '' (present only while the condition holds) |
| `branch` | `data-highlighted` | '' (present only while the condition holds) |
| `branch` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch` | `data-load-state` | branchLoadState(v)?.status |
| `branch` | `data-loading` | '' (present only while the condition holds) |
| `branch` | `data-selected` | '' (present only while the condition holds) |
| `branch` | `data-state` | 'open' \| 'closed' |
| `branch-control` | `data-disabled` | '' (present only while the condition holds) |
| `branch-control` | `data-empty` | '' (present only while the condition holds) |
| `branch-control` | `data-error` | '' (present only while the condition holds) |
| `branch-control` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-control` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-control` | `data-load-state` | branchLoadState(v)?.status |
| `branch-control` | `data-loading` | '' (present only while the condition holds) |
| `branch-control` | `data-pressed` | '' (present only while the condition holds) |
| `branch-control` | `data-selected` | '' (present only while the condition holds) |
| `branch-control` | `data-state` | 'open' \| 'closed' |
| `branch-control` | `data-tone` | metaOf(v)?.tone |
| `branch-control` | `data-xh-collection-context` | 'overlay' |
| `branch-control` | `data-xh-collection-item` | '' |
| `branch-control` | `data-xh-collection-size` | props.size |
| `branch-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `branch-trigger` | `data-empty` | '' (present only while the condition holds) |
| `branch-trigger` | `data-error` | '' (present only while the condition holds) |
| `branch-trigger` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-trigger` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-trigger` | `data-load-state` | branchLoadState(v)?.status |
| `branch-trigger` | `data-loading` | '' (present only while the condition holds) |
| `branch-trigger` | `data-selected` | '' (present only while the condition holds) |
| `branch-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-xh-collection-slot` | 'prefix' |
| `branch-indicator` | `data-disabled` | '' (present only while the condition holds) |
| `branch-indicator` | `data-empty` | '' (present only while the condition holds) |
| `branch-indicator` | `data-error` | '' (present only while the condition holds) |
| `branch-indicator` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-indicator` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-indicator` | `data-load-state` | branchLoadState(v)?.status |
| `branch-indicator` | `data-loading` | '' (present only while the condition holds) |
| `branch-indicator` | `data-selected` | '' (present only while the condition holds) |
| `branch-indicator` | `data-state` | 'open' \| 'closed' |
| `branch-indicator` | `data-xh-collection-slot` | 'prefix' |
| `branch-text` | `data-disabled` | '' (present only while the condition holds) |
| `branch-text` | `data-empty` | '' (present only while the condition holds) |
| `branch-text` | `data-error` | '' (present only while the condition holds) |
| `branch-text` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-text` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-text` | `data-load-state` | branchLoadState(v)?.status |
| `branch-text` | `data-loading` | '' (present only while the condition holds) |
| `branch-text` | `data-selected` | '' (present only while the condition holds) |
| `branch-text` | `data-state` | 'open' \| 'closed' |
| `branch-text` | `data-xh-collection-slot` | 'text' |
| `branch-content` | `data-disabled` | '' (present only while the condition holds) |
| `branch-content` | `data-empty` | '' (present only while the condition holds) |
| `branch-content` | `data-error` | '' (present only while the condition holds) |
| `branch-content` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-content` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-content` | `data-load-state` | branchLoadState(v)?.status |
| `branch-content` | `data-loading` | '' (present only while the condition holds) |
| `branch-content` | `data-selected` | '' (present only while the condition holds) |
| `branch-content` | `data-state` | 'open' \| 'closed' |
| `branch-loading` | `data-disabled` | '' (present only while the condition holds) |
| `branch-loading` | `data-empty` | '' (present only while the condition holds) |
| `branch-loading` | `data-error` | '' (present only while the condition holds) |
| `branch-loading` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-loading` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-loading` | `data-load-state` | branchLoadState(v)?.status |
| `branch-loading` | `data-loading` | '' (present only while the condition holds) |
| `branch-loading` | `data-selected` | '' (present only while the condition holds) |
| `branch-loading` | `data-state` | 'open' \| 'closed' |
| `branch-loading` | `data-xh-loading-ring` | '' |
| `branch-error` | `data-disabled` | '' (present only while the condition holds) |
| `branch-error` | `data-empty` | '' (present only while the condition holds) |
| `branch-error` | `data-error` | '' (present only while the condition holds) |
| `branch-error` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-error` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-error` | `data-load-state` | branchLoadState(v)?.status |
| `branch-error` | `data-loading` | '' (present only while the condition holds) |
| `branch-error` | `data-selected` | '' (present only while the condition holds) |
| `branch-error` | `data-state` | 'open' \| 'closed' |
| `branch-retry-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-empty` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-error` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-load-state` | branchLoadState(v)?.status |
| `branch-retry-trigger` | `data-loading` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-selected` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-empty` | `data-disabled` | '' (present only while the condition holds) |
| `branch-empty` | `data-empty` | '' (present only while the condition holds) |
| `branch-empty` | `data-error` | '' (present only while the condition holds) |
| `branch-empty` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-empty` | `data-indeterminate` | '' (present only while the condition holds) |
| `branch-empty` | `data-load-state` | branchLoadState(v)?.status |
| `branch-empty` | `data-loading` | '' (present only while the condition holds) |
| `branch-empty` | `data-selected` | '' (present only while the condition holds) |
| `branch-empty` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-loading` | '' (present only while the condition holds) |
| `loading` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-xh-loading-ring` | '' |
| `footer` | `data-state` | 'open' \| 'closed' |
| `overflow-tag` | `data-count` | String(overflowCount) |
| `tag` | `data-value` | itemValue(el) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-tree-select-action-bg` | `clear-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-tree-select-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-tree-select-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-tree-select-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-field-clear` |
| `--xh-tree-select-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-tree-select-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-tree-select-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-tree-select-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-tree-select-branch-content-gap` | `branch-content` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-tree-select-branch-error-fg` | `branch-error` | `background-color` | `default` | `--xh-fg-danger` |
| `--xh-tree-select-branch-gap` | `branch` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-tree-select-branch-indicator-fg` | `branch-indicator`<br>`branch-trigger` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-tree-select-branch-indicator-size` | `branch-indicator`<br>`branch-trigger`<br>`item` | `--xh-icon-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-tree-select-branch-retry-fg` | `branch-retry-trigger` | `color` | `default` | `--xh-fg-brand` |
| `--xh-tree-select-branch-status-fg` | `branch-empty`<br>`branch-error`<br>`branch-loading` | `color` | `is([data-part='branch-loading'], [data-part='branch-empty'], [data-part='branch-error'])` | `--xh-material-frosted-fg-muted` |
| `--xh-tree-select-branch-status-font-size` | `branch-empty`<br>`branch-error`<br>`branch-loading`<br>`branch-retry-trigger` | `font-size` | `default`<br>`is([data-part='branch-loading'], [data-part='branch-empty'], [data-part='branch-error'])` | `--xh-_tree-select-font-size` |
| `--xh-tree-select-branch-status-py` | `branch-empty`<br>`branch-error`<br>`branch-loading` | `padding-block` | `is([data-part='branch-loading'], [data-part='branch-empty'], [data-part='branch-error'])` | `--xh-_tree-select-row-py` |
| `--xh-tree-select-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` |
| `--xh-tree-select-content-bg` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg` |
| `--xh-tree-select-content-border` | `content` | `border` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border` |
| `--xh-tree-select-content-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-tree-select-content-highlight` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-highlight` |
| `--xh-tree-select-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` |
| `--xh-tree-select-content-max-w` | `content` | `max-inline-size` | `default` | `none` |
| `--xh-tree-select-content-min-w` | `content` | `inline-size` | `default` | `--xh-overlay-menu-min-w` |
| `--xh-tree-select-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-tree-select-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-tree-select-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-tree-select-content-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-tree-select-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-tree-select-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-tree-select-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-tree-select-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-tree-select-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-tree-select-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-tree-select-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-tree-select-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-tree-select-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-tree-select-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_tree-select-gap` |
| `--xh-tree-select-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_tree-select-h` |
| `--xh-tree-select-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-tree-select-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_tree-select-px` |
| `--xh-tree-select-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-tree-select-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-tree-select-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-tree-select-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-tree-select-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_tree-select-font-size` |
| `--xh-tree-select-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_tree-select-row-px` |
| `--xh-tree-select-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-tree-select-footer-border` | `footer` | `border-block-start` | `default` | `--xh-material-frosted-separator` |
| `--xh-tree-select-footer-fg` | `footer` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-tree-select-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-tree-select-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` |
| `--xh-tree-select-footer-px` | `footer` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-tree-select-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-tree-select-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-tree-select-icon-size` | `branch-control`<br>`control`<br>`item`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_collection-glyph-size`<br>`--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-tree-select-indent` | `branch-content`<br>`branch-empty`<br>`branch-error`<br>`branch-loading`<br>`branch-retry-trigger` | `margin-inline-start`<br>`padding-inline`<br>`padding-inline-start` | `default`<br>`is([data-part='branch-loading'], [data-part='branch-empty'], [data-part='branch-error'])` | `--xh-space-4` |
| `--xh-tree-select-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tree-select-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-surface` |
| `--xh-tree-select-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` |
| `--xh-tree-select-input-font-size` | `input` | `font-size` | `default` | `--xh-_tree-select-font-size` |
| `--xh-tree-select-input-gap` | `input` | `margin-block-end` | `default` | `--xh-space-1` |
| `--xh-tree-select-input-h` | `input` | `block-size` | `default` | `--xh-_tree-select-h` |
| `--xh-tree-select-input-px` | `input` | `padding-inline` | `default` | `--xh-_tree-select-px` |
| `--xh-tree-select-item-bg-hover` | `branch`<br>`branch-control`<br>`item` | `background-color` | `disabled`<br>`error`<br>`focus-visible`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is(:hover, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`not([data-disabled])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-tree-select-item-bg-pressed` | `branch-control`<br>`item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`not([data-disabled])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-tree-select-item-check-fg` | `branch-control`<br>`item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-tree-select-item-indicator-fg` |
| `--xh-tree-select-item-fg` | `branch-control`<br>`item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` |
| `--xh-tree-select-item-fg-selected` | `branch-control`<br>`item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-tree-select-item-fg` |
| `--xh-tree-select-item-font-size` | `branch-control`<br>`item` | `font-size` | `default` | `--xh-_tree-select-font-size` |
| `--xh-tree-select-item-font-weight-selected` | `branch-control`<br>`item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-medium` |
| `--xh-tree-select-item-gap` | `branch-control`<br>`item` | `margin-inline-end`<br>`margin-inline-start` | `default`<br>`xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_tree-select-gap` |
| `--xh-tree-select-item-indicator-fg` | `branch-control`<br>`item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-_tree-select-accent` |
| `--xh-tree-select-item-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-tree-select-item-leading` | `branch-control`<br>`item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-tree-select-item-px` | `branch-control`<br>`item` | `padding-inline` | `default` | `--xh-_tree-select-row-px` |
| `--xh-tree-select-item-py` | `branch-control`<br>`item` | `padding-block` | `default` | `--xh-_tree-select-row-py` |
| `--xh-tree-select-item-radius` | `branch-control`<br>`item` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-tree-select-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tree-select-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-tree-select-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-tree-select-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-tree-select-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-tree-select-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-tree-select-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-tree-select-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_tree-select-font-size` |
| `--xh-tree-select-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_tree-select-row-px` |
| `--xh-tree-select-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-tree-select-placeholder-fg` | `input`<br>`value-text` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-tree-select-search-divider` | `input` | `border-block-end` | `default` | `--xh-material-frosted-separator` |
| `--xh-tree-select-tag-list-gap` | `tag-list` | `gap` | `xh-tag-list` | `--xh-space-1` |
| `--xh-tree-select-tree-gap` | `tree` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-tree-select-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` |
| `--xh-tree-select-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_tree-select-font-size` |
| `--xh-tree-select-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_tree-select-gap` |
| `--xh-tree-select-value-leading` | `value-text` | `line-height` | `default` | `--xh-leading-normal` |
