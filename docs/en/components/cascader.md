# Cascader

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/cascader).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/cascader" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/cascader.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/cascader" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/cascader" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/cascader.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="cascader"`: `root` · `hidden-input` · `label` · `control` · **`trigger`** · `value-text` · `tag-list` · `indicator` · `clear-trigger` · `positioner` · **`content`** · `input` · `search-list` · `search-item` · `column` · `group` · `group-label` · `item` · `item-text` · `item-description` · `item-suffix` · `item-indicator` · `empty` · `loading` · `branch-loading` · `branch-error` · `branch-retry-trigger` · `footer`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-cascader>` |
| Vue components | `XhCascaderClearTrigger` `XhCascaderColumn` `XhCascaderContent` `XhCascaderControl` `XhCascaderFooter` `XhCascaderGroup` `XhCascaderGroupLabel` `XhCascaderIndicator` `XhCascaderInput` `XhCascaderItem` `XhCascaderItemDeleteTrigger` `XhCascaderItemDescription` `XhCascaderItemIndicator` `XhCascaderItemSuffix` `XhCascaderItemText` `XhCascaderLabel` `XhCascaderLoading` `XhCascaderOverflowTag` `XhCascaderPositioner` `XhCascaderRoot` `XhCascaderSearchList` `XhCascaderTag` `XhCascaderTagLabel` `XhCascaderTagList` `XhCascaderTrigger` `XhCascaderValueText` |
| Composable | `useCascader` |
| State machine | `cascaderMachine` |
| Skin | `@xihan-ui/styles/cascader.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `collection` | `CascaderNode[]` |  |
| `loadChildren` | `(request: CascaderLoadChildrenRequest) => Promise<CascaderNode[] \| undefined \| void> \| CascaderNode[] \| undefined \| void` |  |
| `value` | `CascaderValue` |  |
| `defaultValue` | `CascaderValue` |  |
| `name` | `string` |  |
| `form` | `string` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `expandTrigger` | `CascaderExpandTrigger` |  |
| `changeOnSelect` | `boolean` |  |
| `multiple` | `boolean` |  |
| `maxTagCount` | `number` |  |
| `searchable` | `boolean` |  |
| `filter` | `CascaderFilter` |  |
| `cascade` | `boolean` |  |
| `checkedStrategy` | `CascadeStrategy` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `loading` | `boolean` |  |
| `translations` | `Partial<CascaderTranslations>` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `placeholder` | `string` |  |
| `separator` | `string` |  |
| `placement` | `Placement` |  |
| `offset` | `number` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `onValueChange` | `(details: CascaderValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |
| `onOpenChange` | `(details: CascaderOpenChangeDetails) => void` |  |
| `onBranchLoadStart` | `(details: CascaderBranchLoadStartDetails) => void` |  |
| `onBranchLoad` | `(details: CascaderBranchLoadDetails) => void` |  |
| `onBranchLoadError` | `(details: CascaderBranchLoadErrorDetails) => void` |  |

### CascaderNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `disabled` | `boolean` |  |
| `tone` | `Tone` |  |
| `description` | `string` |  |
| `children` | `CascaderNode[]` |  |
| `hasChildren` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `CascaderValueChangeDetails` |
| `clear` | `` |
| `open-change` | `CascaderOpenChangeDetails` |
| `branch-load-start` | `CascaderBranchLoadStartDetails` |
| `branch-load` | `CascaderBranchLoadDetails` |
| `branch-load-error` | `CascaderBranchLoadErrorDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhCascaderRoot` | `default` | `CascaderRootSlotProps` |
| `XhCascaderRoot` | `label` | — |
| `XhCascaderSearchList` | `item` | `CascaderSearchListItemSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhCascaderColumn` | `level` | `number \| string` | Yes |
| `XhCascaderContent` | `empty` | `ReactNode` |  |
| `XhCascaderGroup` | `value` | `string` | Yes |
| `XhCascaderItem` | `value` | `string` | Yes |
| `XhCascaderPositioner` | `container` | `() => Element \| null` |  |
| `XhCascaderRoot` | `label` | `ReactNode` |  |
| `XhCascaderRoot` | `clearable` | `boolean` |  |
| `XhCascaderRoot` | `children` | `SlotChildren<CascaderRootSlotProps>` |  |
| `XhCascaderSearchList` | `renderItem` | `(result: CascaderSearchResult) => ReactNode` |  |
| `XhCascaderTag` | `value` | `string` | Yes |

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
| `search-item` | 'checked' \| 'indeterminate' \| 'unchecked' |
| `column` | 'open' \| 'closed' |
| `item` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `item-text` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `item-description` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `item-suffix` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `item-indicator` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `footer` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `FORM.RESET` · `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `ITEM.EXPAND` · `ITEM.LOST` · `ITEM.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `PATH.SET` · `INPUT.CHANGE` · `SEARCH.HIGHLIGHT` · `PRESS.START` · `PRESS.END` · `TAG_LIST.TRACKED` · `BRANCH.RETRY`

**Guards**: `isOpenControlled` · `isMultiple` · `staysOpenOnSelect` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `collection` | `readonly CascaderNode[]` |
| `columns` | `readonly CascaderColumn[]` |
| `levels` | `readonly CascaderLevel[]` |
| `value` | `string[][]` |
| `valuePath` | `string[] \| null` |
| `valueText` | `string \| null` |
| `displayText` | `string` |
| `activePath` | `string[]` |
| `focusedPath` | `string[] \| null` |
| `multiple` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `required` | `boolean` |
| `canClear` | `boolean` |
| `tags` | `CascaderTagMeta[]` |
| `overflowCount` | `number` |
| `overflowText` | `string` |
| `isSelected` | `(value: string) => boolean` |
| `isIndeterminate` | `(value: string) => boolean` |
| `isActive` | `(value: string) => boolean` |
| `isVisible` | `(value: string) => boolean` |
| `branchLoadState` | `(value: string) => CascaderBranchLoadSnapshot \| null` |
| `columnLoadState` | `(level: number) => CascaderBranchLoadSnapshot \| null` |
| `searching` | `boolean` |
| `inputValue` | `string` |
| `searchResults` | `readonly CascaderSearchResult[]` |
| `searchHighlightIndex` | `number` |
| `translations` | `CascaderTranslations` |
| `setInputValue` | `(next: string) => void` |
| `setOpen` | `(next: boolean) => void` |
| `setValue` | `(next: string[][]) => void` |
| `setActivePath` | `(next: string[]) => void` |
| `select` | `(path: string[]) => void` |
| `clear` | `() => void` |
| `retryBranch` | `(value: string) => void` |
| `deselect` | `(path: readonly string[]) => void` |
| `getRootProps` | `() => T['element']` |
| `getHiddenInputProps` | `(props?: { path: readonly string[] }) => T['input']` |
| `getLabelProps` | `() => T['element']` |
| `getControlProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getValueTextProps` | `() => T['element']` |
| `getTagListProps` | `() => T['element']` |
| `getTagProps` | `(props: CascaderTagProps) => T['element']` |
| `getTagLabelProps` | `() => T['element']` |
| `getOverflowTagProps` | `() => T['element']` |
| `getItemDeleteTriggerProps` | `(props: CascaderTagProps) => T['button']` |
| `getIndicatorProps` | `() => T['element']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getInputProps` | `() => T['input']` |
| `getSearchListProps` | `() => T['element']` |
| `getSearchItemProps` | `(props: CascaderSearchItemProps) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getLoadingProps` | `() => T['element']` |
| `getFooterProps` | `() => T['element']` |
| `getGroupProps` | `(props: CascaderGroupProps) => T['element']` |
| `getGroupLabelProps` | `(props: CascaderGroupProps) => T['element']` |
| `getColumnProps` | `(props: CascaderColumnProps) => T['element']` |
| `getBranchLoadingProps` | `(props: CascaderColumnProps) => T['element']` |
| `getBranchErrorProps` | `(props: CascaderColumnProps) => T['element']` |
| `getBranchRetryTriggerProps` | `(props: CascaderColumnProps) => T['button']` |
| `getItemProps` | `(props: CascaderItemProps) => T['element']` |
| `getItemTextProps` | `(props: CascaderItemProps) => T['element']` |
| `getItemDescriptionProps` | `(props: CascaderItemProps) => T['element']` |
| `getItemSuffixProps` | `(props: CascaderItemProps) => T['element']` |
| `getItemIndicatorProps` | `(props: CascaderItemProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `cascader.kbd.open` |
| `ArrowDown` | `cascader.kbd.open-next` |
| `ArrowUp` | `cascader.kbd.open-prev` |
| `Delete` | `cascader.kbd.clear` |
| `Backspace` | `cascader.kbd.backspace` |
| `ArrowDown` | `cascader.kbd.next` |
| `ArrowUp` | `cascader.kbd.prev` |
| `Home` | `cascader.kbd.first` |
| `End` | `cascader.kbd.last` |
| `ArrowRight` | `cascader.kbd.into` |
| `ArrowLeft` | `cascader.kbd.back` |
| `Enter` / `Space` | `cascader.kbd.select` |
| `Enter` / `Space` | `cascader.kbd.retry` |
| `Enter` / `Space` | `cascader.kbd.press` |
| `Escape` | `cascader.kbd.escape` |
| `Tab` / `Shift+Tab` | `cascader.kbd.tab` |
| printable characters | `cascader.kbd.search.type` |
| `ArrowDown` | `cascader.kbd.search.next` |
| `ArrowUp` | `cascader.kbd.search.prev` |
| `Home` | `cascader.kbd.search.first` |
| `End` | `cascader.kbd.search.last` |
| `Enter` | `cascader.kbd.search.select` |
| `Enter` | `cascader.kbd.search.press` |
| `Escape` | `cascader.kbd.search.clear` |
| `ArrowDown` / `ArrowUp` | `cascader.kbd.search.into-columns` |
| `ArrowLeft` / `ArrowRight` | `cascader.kbd.search.caret` |
| `Tab` / `Shift+Tab` | `cascader.kbd.search.tab` |
| any key during IME composition | `cascader.kbd.search.compose` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `hidden-input` | `aria-hidden` | 'true' |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'listbox' |
| `trigger` | `aria-invalid` | 'true' \| 'false' |
| `trigger` | `aria-label` | props.ariaLabel |
| `trigger` | `aria-labelledby` | id of the `label` part id of the `value-text` part \| id of the `trigger` part id of the `value-text` part \| id of the `value-text` part |
| `trigger` | `aria-readonly` | 'true' \| 'false' |
| `trigger` | `aria-required` | 'true' \| 'false' |
| `trigger` | `role` | 'combobox' |
| `indicator` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | translations.clearTrigger |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `input` | `aria-activedescendant` | id of the `search-item` part \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | id of the `search-list` part |
| `input` | `aria-label` | translations.searchInput |
| `search-list` | `aria-label` | translations.searchList |
| `search-list` | `aria-multiselectable` | 'true' \| 'false' |
| `search-list` | `role` | 'listbox' |
| `search-item` | `aria-checked` | 'true' \| 'mixed' \| 'false' \| undefined |
| `search-item` | `aria-disabled` | 'true' \| 'false' |
| `search-item` | `aria-selected` | 'true' \| 'false' |
| `search-item` | `role` | 'option' |
| `column` | `aria-busy` | 'true' \| undefined |
| `column` | `aria-disabled` | 'true' \| 'false' \| undefined |
| `column` | `aria-label` | translations.column \| undefined |
| `column` | `aria-labelledby` | undefined \| id of the `label` part id of the `value-text` part \| id of the `trigger` part id of the `value-text` part \| id of the `value-text` part \| id of the `item` part |
| `column` | `aria-multiselectable` | 'true' \| 'false' \| undefined |
| `column` | `aria-orientation` | 'vertical' \| undefined |
| `column` | `role` | 'listbox' \| undefined |
| `group` | `aria-labelledby` | id of the `group-label` part |
| `group` | `role` | 'group' |
| `item` | `aria-checked` | 'true' \| 'mixed' \| 'false' \| undefined |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-haspopup` | 'listbox' \| undefined |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |
| `branch-loading` | `role` | 'status' |
| `branch-error` | `role` | 'alert' |
| `branch-retry-trigger` | `aria-label` | translations.retry |

## Style reference

### Skin

`@xihan-ui/styles/cascader.css` is written against `[data-scope="cascader"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-cascader` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

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
| `content` | `data-empty` | '' (present only while the condition holds) |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-placement` | actual placement computed by the positioning engine |
| `content` | `data-searching` | '' (present only while the condition holds) |
| `content` | `data-state` | 'open' \| 'closed' |
| `input` | `data-xh-field-input` | '' |
| `search-list` | `data-empty` | '' (present only while the condition holds) |
| `search-item` | `data-disabled` | '' (present only while the condition holds) |
| `search-item` | `data-highlighted` | '' (present only while the condition holds) |
| `search-item` | `data-pressed` | '' (present only while the condition holds) |
| `search-item` | `data-state` | 'checked' \| 'indeterminate' \| 'unchecked' |
| `search-item` | `data-tone` | undefined \| metaOf(v)?.tone |
| `search-item` | `data-xh-collection-context` | 'overlay' |
| `search-item` | `data-xh-collection-item` | '' |
| `search-item` | `data-xh-collection-size` | props.size |
| `column` | `data-level` | String(column.level) |
| `column` | `data-state` | 'open' \| 'closed' |
| `group` | `data-disabled` | '' (present only while the condition holds) |
| `group-label` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-branch` | '' (present only while the condition holds) |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-error` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-in-path` | '' (present only while the condition holds) |
| `item` | `data-instant` | '' (present only while the condition holds) |
| `item` | `data-level` | String(meta.level) \| undefined |
| `item` | `data-load-state` | branchLoadState(item.value)?.status |
| `item` | `data-loading` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `item` | `data-tone` | undefined \| metaOf(v)?.tone |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-disabled` | '' (present only while the condition holds) |
| `item-text` | `data-highlighted` | '' (present only while the condition holds) |
| `item-text` | `data-in-path` | '' (present only while the condition holds) |
| `item-text` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-description` | `data-disabled` | '' (present only while the condition holds) |
| `item-description` | `data-highlighted` | '' (present only while the condition holds) |
| `item-description` | `data-in-path` | '' (present only while the condition holds) |
| `item-description` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-suffix` | `data-disabled` | '' (present only while the condition holds) |
| `item-suffix` | `data-highlighted` | '' (present only while the condition holds) |
| `item-suffix` | `data-in-path` | '' (present only while the condition holds) |
| `item-suffix` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `item-indicator` | `data-disabled` | '' (present only while the condition holds) |
| `item-indicator` | `data-highlighted` | '' (present only while the condition holds) |
| `item-indicator` | `data-in-path` | '' (present only while the condition holds) |
| `item-indicator` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `loading` | `data-loading` | '' (present only while the condition holds) |
| `loading` | `data-xh-loading-ring` | '' |
| `branch-loading` | `data-level` | String(column.level) |
| `branch-error` | `data-level` | String(column.level) |
| `branch-retry-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `branch-retry-trigger` | `data-level` | String(column.level) |
| `branch-retry-trigger` | `data-xh-action-control` | '' |
| `branch-retry-trigger` | `data-xh-action-display` | 'always' |
| `branch-retry-trigger` | `data-xh-action-profile` | 'text' |
| `branch-retry-trigger` | `data-xh-action-size` | props.size |
| `branch-retry-trigger` | `data-xh-action-variant` | 'ghost' |
| `footer` | `data-state` | 'open' \| 'closed' |
| `overflow-tag` | `data-count` | String(overflowCount) |
| `tag` | `data-value` | cascaderPathKey(path) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-cascader-action-bg` | `clear-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-cascader-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-cascader-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-cascader-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-cascader-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-cascader-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-cascader-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-cascader-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-cascader-branch-arrow-fg` | `item` | `background-color` | `branch` | `--xh-fg-muted` |
| `--xh-cascader-branch-arrow-size` | `item` | `block-size`<br>`inline-size` | `branch` | `--xh-control-indicator-size` |
| `--xh-cascader-branch-status-fg` | `branch-error`<br>`branch-loading` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-cascader-branch-status-font-size` | `branch-error`<br>`branch-loading` | `font-size` | `default` | `--xh-_cascader-font-size` |
| `--xh-cascader-branch-status-px` | `branch-error`<br>`branch-loading` | `padding-inline` | `default` | `--xh-_cascader-row-px` |
| `--xh-cascader-branch-status-py` | `branch-error`<br>`branch-loading` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-cascader-column-divider` | `column` | `border-inline-start` | `default` | `--xh-material-solid-border` |
| `--xh-cascader-column-gap` | `column` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-cascader-column-h` | `column`<br>`search-list` | `block-size` | `default` | `--xh-viewport-h-sm` |
| `--xh-cascader-column-min-w` | `column` | `min-inline-size` | `default` | `--xh-overlay-cascade-min-w` |
| `--xh-cascader-column-px` | `column` | `padding-inline` | `default` | `0` |
| `--xh-cascader-column-py` | `column` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-cascader-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` |
| `--xh-cascader-content-border` | `content` | `border` | `default` | `--xh-border-default` |
| `--xh-cascader-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-cascader-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-_cascader-available-w` |
| `--xh-cascader-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-cascade-min-w` |
| `--xh-cascader-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-cascader-content-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-floating` |
| `--xh-cascader-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-cascader-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-cascader-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-cascader-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-cascader-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-cascader-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-cascader-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-cascader-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-cascader-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-cascader-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_cascader-gap` |
| `--xh-cascader-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_cascader-h` |
| `--xh-cascader-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-cascader-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_cascader-px` |
| `--xh-cascader-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-cascader-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-cascader-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-cascader-empty-fg` | `empty` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-cascader-empty-min-h` | `empty` | `min-block-size` | `default` | `--xh-viewport-h-sm` |
| `--xh-cascader-empty-p` | `empty` | `padding` | `default` | `--xh-space-3` |
| `--xh-cascader-footer-border` | `footer` | `border-block-start` | `default` | `--xh-material-solid-border` |
| `--xh-cascader-footer-fg` | `footer` | `color` | `default` | `--xh-fg-muted` |
| `--xh-cascader-footer-font-size` | `footer` | `font-size` | `default` | `--xh-_cascader-font-size` |
| `--xh-cascader-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` |
| `--xh-cascader-footer-px` | `footer` | `padding-inline` | `default` | `--xh-_cascader-row-px` |
| `--xh-cascader-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-cascader-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-cascader-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-cascader-group-label-fg` | `group-label` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-cascader-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-cascader-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-regular` |
| `--xh-cascader-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_cascader-row-px` |
| `--xh-cascader-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-cascader-group-spacing` | `group` | `margin-block-start` | `default` | `--xh-space-1_5` |
| `--xh-cascader-icon-size` | `control`<br>`item`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_collection-glyph-size`<br>`--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-cascader-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` |
| `--xh-cascader-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-surface` |
| `--xh-cascader-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` |
| `--xh-cascader-input-font-size` | `input` | `font-size` | `default` | `--xh-_cascader-font-size` |
| `--xh-cascader-input-h` | `input` | `block-size` | `default` | `--xh-_cascader-h` |
| `--xh-cascader-input-px` | `input` | `margin-inline-end`<br>`padding-inline` | `default` | `--xh-_cascader-px` |
| `--xh-cascader-item-active-font-weight` | `item` | `font-weight` | `in-path` | `--xh-font-weight-regular` |
| `--xh-cascader-item-bg-active` | `item` | `background-color` | `in-path` | `--xh-bg-subtle` |
| `--xh-cascader-item-bg-hover` | `item`<br>`search-item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:focus-visible, [data-highlighted])`<br>`is(:hover, [data-highlighted], [data-in-path])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`not([data-disabled])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-cascader-item-bg-pressed` | `item`<br>`search-item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`not([data-disabled])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-cascader-item-check-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-cascader-item-indicator-fg` |
| `--xh-cascader-item-fg` | `item`<br>`search-item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` |
| `--xh-cascader-item-fg-selected` | `item`<br>`search-item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-cascader-item-fg` |
| `--xh-cascader-item-font-size` | `empty`<br>`item`<br>`search-item` | `font-size` | `default` | `--xh-_cascader-font-size` |
| `--xh-cascader-item-font-weight-selected` | `item`<br>`search-item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-medium` |
| `--xh-cascader-item-gap` | `item`<br>`search-item` | `margin-inline-end`<br>`margin-inline-start`<br>`padding-inline-end` | `branch`<br>`default`<br>`xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_cascader-gap` |
| `--xh-cascader-item-h` | `item`<br>`search-item` | `min-block-size` | `default` | `--xh-_cascader-row-h` |
| `--xh-cascader-item-indicator-fg` | `item`<br>`search-item` | `background-color`<br>`color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-_cascader-accent` |
| `--xh-cascader-item-indicator-size` | `item-indicator`<br>`search-item` | `--xh-icon-size`<br>`block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-control-indicator-size` |
| `--xh-cascader-item-leading` | `item`<br>`search-item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-cascader-item-max-w` | `item` | `max-inline-size` | `default` | `--xh-overlay-max-w` |
| `--xh-cascader-item-px` | `item`<br>`search-item` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-_cascader-row-px` |
| `--xh-cascader-item-py` | `item`<br>`search-item` | `padding-block` | `default` | `--xh-_cascader-row-py` |
| `--xh-cascader-item-radius` | `item`<br>`search-item` | `border-radius` | `default` | `0` |
| `--xh-cascader-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-cascader-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-cascader-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-cascader-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-cascader-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-cascader-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-cascader-loading-fg` | `loading` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-cascader-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_cascader-font-size` |
| `--xh-cascader-loading-min-h` | `loading` | `min-block-size` | `default` | `--xh-viewport-h-sm` |
| `--xh-cascader-loading-p` | `loading` | `padding` | `default` | `--xh-space-3` |
| `--xh-cascader-loading-ring-fg` | `loading` | `border`<br>`border-color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`motion=reduce`<br>`where([data-motion='reduce'])`<br>`xh-loading-ring`<br>`xh-loading-ring=overlay` | `--xh-fg-brand` |
| `--xh-cascader-placeholder-fg` | `input`<br>`value-text` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-cascader-search-divider` | `input` | `border-block-end` | `default` | `--xh-material-solid-border` |
| `--xh-cascader-search-list-gap` | `search-list` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-cascader-search-p` | `search-list` | `padding` | `default` | `--xh-space-1` |
| `--xh-cascader-tag-list-gap` | `tag-list` | `gap` | `xh-tag-list` | `--xh-space-1` |
| `--xh-cascader-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` |
| `--xh-cascader-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_cascader-font-size` |
| `--xh-cascader-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_cascader-gap` |
