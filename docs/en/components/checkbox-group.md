# CheckboxGroup

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/checkbox-group).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/checkbox-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/checkbox-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/checkbox-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/checkbox-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/checkbox-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="checkbox-group"`: **`root`** · `label` · `item` · `indicator` · `item-text` · `item-description` · `hidden-input` · `select-all-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-checkbox-group>` |
| Vue components | `XhCheckboxGroupIndicator` `XhCheckboxGroupItem` `XhCheckboxGroupItemDescription` `XhCheckboxGroupItemText` `XhCheckboxGroupLabel` `XhCheckboxGroupRoot` `XhCheckboxGroupSelectAllTrigger` |
| Composable | `useCheckboxGroup` |
| State machine | `checkboxGroupMachine` |
| Skin | `@xihan-ui/styles/checkbox-group.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `CheckboxGroupNode<V>[]` |  |
| `valueKey` | `SelectionValueKey<V>` |  |
| `value` | `V[]` |  |
| `defaultValue` | `V[]` |  |
| `itemValues` | `V[]` |  |
| `min` | `number` |  |
| `max` | `number` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `name` | `string` |  |
| `orientation` | `Orientation` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `variant` | `CheckboxGroupVariant` |  |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `onValueChange` | `(details: CheckboxGroupValueChangeDetails<V>) => void` |  |

### CheckboxGroupNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `V` | Yes |
| `label` | `string` |  |
| `description` | `string` |  |
| `disabled` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `CheckboxGroupValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhCheckboxGroupRoot` | `default` | `CheckboxGroupRootSlotProps<V>` |
| `XhCheckboxGroupRoot` | `label` | — |
| `XhCheckboxGroupRoot` | `item` | `CheckboxGroupNodeMeta<V>` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhCheckboxGroupItem` | `value` | `unknown` | Yes |
| `XhCheckboxGroupItem` | `disabled` | `boolean` |  |
| `XhCheckboxGroupRoot` | `label` | `ReactNode` |  |
| `XhCheckboxGroupRoot` | `renderItem` | `(node: CheckboxGroupNodeMeta<V>) => ReactNode` |  |
| `XhCheckboxGroupRoot` | `children` | `SlotChildren<CheckboxGroupRootSlotProps<V>>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `indicator` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `hidden-input` | 'checked' \| 'unchecked' |
| `select-all-trigger` | resolveCheckedState(value, prop('itemValues') ?? []) |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `ITEM.TOGGLE` · `ALL.TOGGLE` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `editable` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `V[]` |
| `collection` | `readonly CheckboxGroupNodeMeta<V>[]` |
| `checkedState` | `CheckboxGroupCheckedState` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `required` | `boolean` |
| `atMax` | `boolean` |
| `atMin` | `boolean` |
| `isChecked` | `(value: V) => boolean` |
| `setValue` | `(next: V[]) => void` |
| `toggleValue` | `(value: V) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getItemProps` | `(props: CheckboxGroupItemProps<V>) => T['element']` |
| `getIndicatorProps` | `(props: CheckboxGroupItemProps<V>) => T['element']` |
| `getItemTextProps` | `(props: CheckboxGroupItemProps<V>) => T['element']` |
| `getItemDescriptionProps` | `(props: CheckboxGroupItemProps<V>) => T['element']` |
| `getHiddenInputProps` | `(props: CheckboxGroupItemProps<V>) => T['input']` |
| `getSelectAllTriggerProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `checkbox-group.kbd.tab` |
| `Space` | `checkbox-group.kbd.toggle` |
| `Space` | `checkbox-group.kbd.toggle-all` |
| `Space` | `checkbox-group.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `aria-labelledby` | id of the `label` part \| undefined |
| `root` | `role` | 'group' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-invalid` | 'true' \| 'false' |
| `item` | `aria-readonly` | 'true' \| 'false' |
| `item` | `role` | 'checkbox' |
| `indicator` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-hidden` | 'true' |
| `select-all-trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `select-all-trigger` | `aria-disabled` | 'false' \| 'true' |
| `select-all-trigger` | `aria-labelledby` | id of the `label` part id of the `select-all-trigger` part \| id of the `select-all-trigger` part |
| `select-all-trigger` | `aria-readonly` | 'true' \| 'false' |
| `select-all-trigger` | `role` | 'checkbox' |

## Style reference

### Skin

`@xihan-ui/styles/checkbox-group.css` is written against `[data-scope="checkbox-group"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-checkbox-group` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-required` | '' (present only while the condition holds) |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-readonly` | '' (present only while the condition holds) |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'row' |
| `item` | `data-xh-action-size` | 'xs' |
| `item` | `data-xh-action-variant` | 'outline' \| 'ghost' |
| `item` | `data-xh-choice-card` | '' (present only while the condition holds) |
| `indicator` | `data-disabled` | '' (present only while the condition holds) |
| `indicator` | `data-state` | 'checked' \| 'unchecked' |
| `indicator` | `data-xh-check-mark` | 'checked' \| 'unchecked' |
| `indicator` | `data-xh-check-mark-profile` | 'box' |
| `item-text` | `data-disabled` | '' (present only while the condition holds) |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-disabled` | '' (present only while the condition holds) |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `hidden-input` | `data-disabled` | '' (present only while the condition holds) |
| `hidden-input` | `data-state` | 'checked' \| 'unchecked' |
| `select-all-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `select-all-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `select-all-trigger` | `data-readonly` | '' (present only while the condition holds) |
| `select-all-trigger` | `data-state` | resolveCheckedState(value, prop('itemValues') ?? []) |
| `select-all-trigger` | `data-xh-action-control` | '' |
| `select-all-trigger` | `data-xh-action-display` | 'always' |
| `select-all-trigger` | `data-xh-action-profile` | 'row' |
| `select-all-trigger` | `data-xh-action-size` | 'xs' |
| `select-all-trigger` | `data-xh-action-variant` | 'ghost' |
| `select-all-trigger` | `data-xh-check-mark` | resolveCheckedState(value, prop('itemValues') ?? []) |
| `select-all-trigger` | `data-xh-check-mark-profile` | 'row' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-checkbox-group-card-title-font-weight` | `item`<br>`item-text` | `font-weight` | `xh-choice-card` | `--xh-text-label-weight` |
| `--xh-checkbox-group-gap` | `root` | `gap` | `default` | `--xh-space-2` |
| `--xh-checkbox-group-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_checkbox-group-glyph` |
| `--xh-checkbox-group-indicator-bg` | `indicator`<br>`root`<br>`select-all-trigger` | `background-color` | `default` | `transparent` |
| `--xh-checkbox-group-indicator-bg-checked` | `indicator`<br>`select-all-trigger` | `background-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-accent` |
| `--xh-checkbox-group-indicator-bg-checked-pressed` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`is([data-state='checked'], [data-state='indeterminate'])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`state=indeterminate` | `--xh-_tone-active` |
| `--xh-checkbox-group-indicator-bg-disabled` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `background-color` | `disabled` | `--xh-bg-subtle` |
| `--xh-checkbox-group-indicator-bg-pressed` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly` | `--xh-_checkbox-group-host-bg-pressed` |
| `--xh-checkbox-group-indicator-border` | `indicator`<br>`select-all-trigger` | `border` | `default` | `--xh-border-strong` |
| `--xh-checkbox-group-indicator-border-checked` | `indicator`<br>`select-all-trigger` | `border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-accent` |
| `--xh-checkbox-group-indicator-border-disabled` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `border-color` | `disabled` | `--xh-border-default` |
| `--xh-checkbox-group-indicator-border-hover` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `border-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`not([data-state='indeterminate'])`<br>`readonly`<br>`state=checked`<br>`state=indeterminate` | `--xh-border-control-hover` |
| `--xh-checkbox-group-indicator-border-invalid` | `indicator`<br>`root` | `border-color` | `invalid` | `--xh-border-invalid` |
| `--xh-checkbox-group-indicator-fg` | `indicator`<br>`select-all-trigger` | `--xh-check-mark-fg`<br>`color` | `default` | `--xh-_checkbox-group-on-accent` |
| `--xh-checkbox-group-indicator-fg-disabled` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `--xh-check-mark-fg`<br>`color` | `disabled` | `--xh-fg-disabled` |
| `--xh-checkbox-group-indicator-font-size` | `indicator`<br>`select-all-trigger` | `font-size` | `default` | `--xh-_checkbox-group-glyph` |
| `--xh-checkbox-group-indicator-radius` | `indicator`<br>`select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-checkbox-group-indicator-shadow` | `indicator`<br>`select-all-trigger` | `box-shadow` | `default` | `none` |
| `--xh-checkbox-group-indicator-size` | `indicator`<br>`select-all-trigger` | `--xh-check-mark-box-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-_checkbox-group-box` |
| `--xh-checkbox-group-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` |
| `--xh-checkbox-group-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-checkbox-group-item-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-checkbox-group-item-description-fg-disabled` | `item`<br>`item-description` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-checkbox-group-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-checkbox-group-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-checkbox-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-checkbox-group-item-font-size` | `item` | `font-size` | `default` | `--xh-_checkbox-group-font-size` |
| `--xh-checkbox-group-item-gap` | `item` | `gap` | `default` | `--xh-_checkbox-group-gap` |
| `--xh-checkbox-group-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-checkbox-group-item-row-gap` | `item` | `row-gap` | `has(> [data-scope='checkbox-group'][data-part='item-description'])`<br>`not([data-xh-choice-card])`<br>`xh-choice-card` | `--xh-space-1` |
| `--xh-checkbox-group-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-checkbox-group-label-fg-disabled` | `label`<br>`root` | `color` | `disabled` | `--xh-fg-subtle` |
| `--xh-checkbox-group-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-checkbox-group-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-checkbox-group-select-all-trigger-bg-hover` | `select-all-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` |
| `--xh-checkbox-group-select-all-trigger-bg-pressed` | `select-all-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-checkbox-group-select-all-trigger-fg` | `select-all-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-checkbox-group-select-all-trigger-fg-disabled` | `select-all-trigger` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-checkbox-group-select-all-trigger-font-size` | `select-all-trigger` | `font-size` | `default` | `--xh-_checkbox-group-font-size` |
| `--xh-checkbox-group-select-all-trigger-font-weight` | `select-all-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-checkbox-group-select-all-trigger-gap` | `select-all-trigger` | `gap` | `default` | `--xh-_checkbox-group-gap` |
| `--xh-checkbox-group-select-all-trigger-radius` | `select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
