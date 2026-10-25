# FilterBuilder

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/filter-builder).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/filter-builder" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/filter-builder.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/filter-builder" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/filter-builder" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/filter-builder.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="filter-builder"`: **`root`** · `label` · **`group`** · `group-header` · `logic` · `group-delete-trigger` · `group-items` · `group-footer` · **`add-condition-trigger`** · `add-group-trigger` · `condition` · `condition-field` · `condition-operator` · `condition-source` · `condition-operand` · `range-separator` · `condition-ignore-case` · `condition-extra` · `condition-delete-trigger` · `condition-error` · `empty` · `live-region`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-filter-builder>` |
| Vue components | `XhFilterBuilderAddConditionTrigger` `XhFilterBuilderAddGroupTrigger` `XhFilterBuilderCondition` `XhFilterBuilderConditionDeleteTrigger` `XhFilterBuilderConditionError` `XhFilterBuilderConditionExtra` `XhFilterBuilderConditionField` `XhFilterBuilderConditionIgnoreCase` `XhFilterBuilderConditionOperand` `XhFilterBuilderConditionOperator` `XhFilterBuilderConditionSource` `XhFilterBuilderEmpty` `XhFilterBuilderGroup` `XhFilterBuilderGroupDeleteTrigger` `XhFilterBuilderGroupFooter` `XhFilterBuilderGroupHeader` `XhFilterBuilderGroupItems` `XhFilterBuilderLabel` `XhFilterBuilderLiveRegion` `XhFilterBuilderLogic` `XhFilterBuilderRangeSeparator` `XhFilterBuilderRoot` |
| Composable | `useFilterBuilder` |
| State machine | `filterBuilderMachine` |
| Skin | `@xihan-ui/styles/filter-builder.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `value` | `FilterGroup` |  |
| `defaultValue` | `FilterGroup` |  |
| `fields` | `readonly FilterField[]` |  |
| `parameters` | `readonly FilterParameter[]` |  |
| `createId` | `FilterBuilderCreateId` |  |
| `maxDepth` | `number` |  |
| `ignoreCase` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `labelled` | `boolean` |  |
| `variant` | `ControlVariant` |  |
| `size` | `Size` |  |
| `translations` | `Partial<FilterBuilderTranslations>` |  |
| `onValueChange` | `(details: FilterBuilderValueChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `FilterBuilderValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhFilterBuilderRoot` | `default` | `FilterBuilderRootSlotProps` |
| `XhFilterBuilderRoot` | `condition-extra` | `FilterBuilderConditionExtraSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhFilterBuilderCondition` | `value` | `string` | Yes |
| `XhFilterBuilderGroup` | `value` | `string` | Yes |
| `XhFilterBuilderRoot` | `renderConditionExtra` | `(props: FilterBuilderConditionExtraSlotProps) => ReactNode` |  |
| `XhFilterBuilderRoot` | `children` | `SlotChildren<FilterBuilderRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `LOGIC.SET` · `CONDITION.ADD` · `GROUP.ADD` · `NODE.REMOVE` · `NODE.MOVE` · `FIELD.SET` · `OPERATOR.SET` · `OPERAND.SET` · `NUMBER.INPUT` · `SOURCE.SET` · `IGNORE_CASE.SET` · `FOCUS.DONE`

**Guards**: `isEditable`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `FilterGroup` |
| `tree` | `FilterBuilderGroupView` |
| `conditions` | `readonly FilterBuilderConditionView[]` |
| `hasIssues` | `boolean` |
| `hasParameters` | `boolean` |
| `announcement` | `string` |
| `nodePath` | `(key: string) => FilterPath \| undefined` |
| `setLogic` | `(path: FilterPath, logic: FilterGroup['logic']) => void` |
| `addCondition` | `(groupPath: FilterPath) => void` |
| `addGroup` | `(groupPath: FilterPath) => void` |
| `remove` | `(path: FilterPath) => void` |
| `move` | `(path: FilterPath, delta: number) => void` |
| `setField` | `(path: FilterPath, field: string) => void` |
| `setOperator` | `(path: FilterPath, operator: FilterOperator) => void` |
| `setOperand` | `(path: FilterPath, value: unknown) => void` |
| `setSource` | `(path: FilterPath, source: FilterOperandSource) => void` |
| `setIgnoreCase` | `(path: FilterPath, value: boolean) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getGroupProps` | `(path: FilterPath) => T['element']` |
| `getGroupHeaderProps` | `(path: FilterPath) => T['element']` |
| `getLogicProps` | `(path: FilterPath) => T['element']` |
| `getGroupDeleteTriggerProps` | `(path: FilterPath) => T['button']` |
| `getGroupItemsProps` | `(path: FilterPath) => T['element']` |
| `getGroupFooterProps` | `(path: FilterPath) => T['element']` |
| `getAddConditionTriggerProps` | `(path: FilterPath) => T['button']` |
| `getAddGroupTriggerProps` | `(path: FilterPath) => T['button']` |
| `getConditionProps` | `(path: FilterPath) => T['element']` |
| `getConditionFieldProps` | `(path: FilterPath) => T['element']` |
| `getConditionOperatorProps` | `(path: FilterPath) => T['element']` |
| `getConditionSourceProps` | `(path: FilterPath) => T['element']` |
| `getConditionOperandProps` | `(path: FilterPath) => T['element']` |
| `getRangeSeparatorProps` | `() => T['element']` |
| `getConditionIgnoreCaseProps` | `(path: FilterPath) => T['element']` |
| `getConditionExtraProps` | `(path: FilterPath) => T['element']` |
| `getConditionDeleteTriggerProps` | `(path: FilterPath) => T['button']` |
| `getConditionErrorProps` | `(path: FilterPath) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getLiveRegionProps` | `() => T['element']` |
| `getLogicControlProps` | `(path: FilterPath) => Partial<StructureInstanceProps['toggle-group']>` |
| `getFieldControlProps` | `(path: FilterPath) => Partial<StructureInstanceProps['select']>` |
| `getOperatorControlProps` | `(path: FilterPath) => Partial<StructureInstanceProps['select']>` |
| `getSourceControlProps` | `(path: FilterPath) => Partial<StructureInstanceProps['toggle-group']>` |
| `getOperandControls` | `(path: FilterPath) => readonly FilterOperandControl[]` |
| `getIgnoreCaseControlProps` | `(path: FilterPath) => Partial<StructureInstanceProps['switch']>` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `filter-builder.kbd.tab` |
| `Alt+Shift+ArrowUp` / `Alt+Shift+ArrowDown` | `filter-builder.kbd.move` |
| `Ctrl+Delete` | `filter-builder.kbd.remove` |
| `ArrowUp` / `ArrowDown` / `Enter` / `Space` | `filter-builder.kbd.controls` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-invalid` | 'true' \| undefined |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `aria-labelledby` | id of the `label` part \| undefined |
| `root` | `role` | 'group' |
| `group` | `aria-label` | t.group(group.group.logic) \| undefined |
| `group` | `role` | 'group' |
| `group-delete-trigger` | `aria-label` | t.removeGroup |
| `condition` | `aria-describedby` | id of the `error` part \| undefined |
| `condition` | `aria-invalid` | 'true' \| undefined |
| `condition` | `aria-label` | t.condition(view.number) \| undefined |
| `condition` | `role` | 'group' |
| `range-separator` | `aria-hidden` | 'true' |
| `condition-delete-trigger` | `aria-label` | t.removeCondition(view.number) \| undefined |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/filter-builder.css` is written against `[data-scope="filter-builder"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-filter-builder` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `group` | `data-depth` | group?.depth |
| `group` | `data-logic` | group?.group.logic |
| `group-delete-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `add-condition-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `add-group-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `condition` | `data-invalid` | '' (present only while the condition holds) |
| `condition-operand` | `data-shape` | conditionAt(path)?.shape |
| `condition-delete-trigger` | `data-disabled` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-filter-builder-add-bg` | `add-condition-trigger`<br>`add-group-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-filter-builder-add-bg-active` | `add-condition-trigger`<br>`add-group-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-filter-builder-add-bg-hover` | `add-condition-trigger`<br>`add-group-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-filter-builder-add-border` | `add-condition-trigger`<br>`add-group-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` |
| `--xh-filter-builder-add-border-disabled` | `add-condition-trigger`<br>`add-group-trigger` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` |
| `--xh-filter-builder-add-border-hover` | `add-condition-trigger`<br>`add-group-trigger` | `border-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-border-hover` |
| `--xh-filter-builder-add-fg` | `add-condition-trigger`<br>`add-group-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-brand` |
| `--xh-filter-builder-add-font-size` | `add-condition-trigger`<br>`add-group-trigger` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-filter-builder-add-height` | `add-condition-trigger`<br>`add-group-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-filter-builder-add-px` | `add-condition-trigger`<br>`add-group-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-filter-builder-add-radius` | `add-condition-trigger`<br>`add-group-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-filter-builder-condition-gap` | `condition` | `gap` | `default` | `--xh-space-2` |
| `--xh-filter-builder-delete-bg` | `condition-delete-trigger`<br>`group-delete-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-filter-builder-delete-bg-active` | `condition-delete-trigger`<br>`group-delete-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-filter-builder-delete-bg-hover` | `condition-delete-trigger`<br>`group-delete-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-filter-builder-delete-fg` | `condition-delete-trigger`<br>`group-delete-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-filter-builder-delete-fg-hover` | `condition-delete-trigger`<br>`group-delete-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-danger-hover` |
| `--xh-filter-builder-delete-radius` | `condition-delete-trigger`<br>`group-delete-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-filter-builder-delete-size` | `condition-delete-trigger`<br>`group-delete-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-filter-builder-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` |
| `--xh-filter-builder-empty-font-size` | `empty` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-filter-builder-error-fg` | `condition-error` | `color` | `default` | `--xh-fg-danger` |
| `--xh-filter-builder-error-font-size` | `condition-error` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-filter-builder-footer-gap` | `group-footer` | `gap` | `default` | `--xh-space-2` |
| `--xh-filter-builder-gap` | `root` | `gap` | `default` | `--xh-space-2` |
| `--xh-filter-builder-group-gap` | `group` | `gap` | `default` | `--xh-space-2` |
| `--xh-filter-builder-guide-color` | `group` | `border-inline-start` | `depth=0`<br>`not([data-depth='0'])` | `--xh-border-subtle` |
| `--xh-filter-builder-header-gap` | `group-header` | `gap` | `default` | `--xh-space-2` |
| `--xh-filter-builder-icon-size` | `condition-delete-trigger`<br>`group-delete-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-filter-builder-indent` | `group` | `padding-inline-start` | `depth=0`<br>`not([data-depth='0'])` | `--xh-space-4` |
| `--xh-filter-builder-items-gap` | `group-items` | `gap` | `default` | `--xh-space-2` |
| `--xh-filter-builder-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-filter-builder-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-filter-builder-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-filter-builder-operand-gap` | `condition-operand` | `gap` | `default` | `--xh-space-2` |
| `--xh-filter-builder-operand-w` | `condition-operand` | `flex` | `default` | `--xh-layout-col-min-sm` |
| `--xh-filter-builder-select-w` | `condition-field`<br>`condition-operator` | `flex` | `default` | `--xh-layout-col-min-xs` |
| `--xh-filter-builder-separator-fg` | `range-separator` | `color` | `default` | `--xh-fg-muted` |
| `--xh-filter-builder-separator-font-size` | `range-separator` | `font-size` | `default` | `--xh-text-label-size` |
