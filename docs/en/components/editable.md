# Editable

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/editable).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/editable" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/editable.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/editable" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/editable" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/editable.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="editable"`: **`root`** · `label` · `control` · **`preview`** · **`input`** · `edit-trigger` · `submit-trigger` · `cancel-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-editable>` |
| Vue components | `XhEditableCancelTrigger` `XhEditableControl` `XhEditableEditTrigger` `XhEditableInput` `XhEditableLabel` `XhEditablePreview` `XhEditableRoot` `XhEditableSubmitTrigger` |
| Composable | `useEditable` |
| State machine | `editableMachine` |
| Skin | `@xihan-ui/styles/editable.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string` |  |
| `defaultValue` | `string` |  |
| `edit` | `boolean` |  |
| `defaultEdit` | `boolean` |  |
| `placeholder` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `maxLength` | `number` |  |
| `name` | `string` |  |
| `submitMode` | `EditableSubmitMode` |  |
| `activationMode` | `EditableActivationMode` |  |
| `selectOnFocus` | `boolean` |  |
| `autoResize` | `boolean` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onValueChange` | `(details: EditableValueChangeDetails) => void` |  |
| `onValueCommit` | `(details: EditableValueCommitDetails) => void` |  |
| `onValueRevert` | `(details: EditableValueRevertDetails) => void` |  |
| `onEditChange` | `(details: EditableEditChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `EditableValueChangeDetails` |
| `value-commit` | `EditableValueCommitDetails` |
| `value-revert` | `EditableValueRevertDetails` |
| `edit-change` | `EditableEditChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhEditableRoot` | `default` | `EditableRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhEditableRoot` | `children` | `SlotChildren<EditableRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'edit' \| 'preview' |
| `label` | 'edit' \| 'preview' |
| `control` | 'edit' \| 'preview' |
| `preview` | 'edit' \| 'preview' |
| `input` | 'edit' \| 'preview' |
| `edit-trigger` | 'edit' \| 'preview' |
| `submit-trigger` | 'edit' \| 'preview' |
| `cancel-trigger` | 'edit' \| 'preview' |

The following names are internal to the state machine.

**States**: `preview` · `edit`

**Events**: `EDIT.START` · `EDIT.SUBMIT` · `EDIT.CANCEL` · `EDIT.LEAVE` · `VALUE.SET` · `CONTROLLED.EDIT` · `CONTROLLED.PREVIEW` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `isEditControlled` · `canEdit` · `submitsOnLeave` · `canPressEditTrigger` · `canPressEditControls`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string` |
| `committedValue` | `string` |
| `editing` | `boolean` |
| `empty` | `boolean` |
| `displayValue` | `string` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `interactive` | `boolean` |
| `setValue` | `(next: string) => void` |
| `edit` | `() => void` |
| `submit` | `() => void` |
| `cancel` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getPreviewProps` | `() => T['element']` |
| `getInputProps` | `() => T['input']` |
| `getEditTriggerProps` | `() => T['button']` |
| `getSubmitTriggerProps` | `() => T['button']` |
| `getCancelTriggerProps` | `() => T['button']` |
| `getControlProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` | `editable.kbd.submit` |
| `Escape` | `editable.kbd.cancel` |
| `Tab` / `Shift+Tab` | `editable.kbd.leave` |
| `Enter` / `Space` | `editable.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `aria-labelledby` | id of the `label` part \| undefined |
| `root` | `role` | 'group' |
| `preview` | `aria-disabled` | 'true' \| 'false' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.ariaLabel |
| `input` | `aria-labelledby` | id of the `label` part \| undefined |
| `edit-trigger` | `aria-controls` | id of the `input` part |

## Style reference

### Skin

`@xihan-ui/styles/editable.css` is written against `[data-scope="editable"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-editable` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'edit' \| 'preview' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `label` | `data-state` | 'edit' \| 'preview' |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-state` | 'edit' \| 'preview' |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `preview` | `data-activation-mode` | props.activationMode |
| `preview` | `data-disabled` | '' (present only while the condition holds) |
| `preview` | `data-invalid` | '' (present only while the condition holds) |
| `preview` | `data-placeholder` | '' (present only while the condition holds) |
| `preview` | `data-readonly` | '' (present only while the condition holds) |
| `preview` | `data-state` | 'edit' \| 'preview' |
| `input` | `data-auto-resize` | '' (present only while the condition holds) |
| `input` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-invalid` | '' (present only while the condition holds) |
| `input` | `data-readonly` | '' (present only while the condition holds) |
| `input` | `data-state` | 'edit' \| 'preview' |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'single-line' |
| `edit-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `edit-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `edit-trigger` | `data-state` | 'edit' \| 'preview' |
| `edit-trigger` | `data-xh-action-control` | '' |
| `edit-trigger` | `data-xh-action-display` | 'always' |
| `edit-trigger` | `data-xh-action-profile` | 'field-inset' |
| `edit-trigger` | `data-xh-action-size` | props.size |
| `edit-trigger` | `data-xh-action-variant` | 'ghost' |
| `submit-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `submit-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `submit-trigger` | `data-state` | 'edit' \| 'preview' |
| `submit-trigger` | `data-xh-action-control` | '' |
| `submit-trigger` | `data-xh-action-display` | 'always' |
| `submit-trigger` | `data-xh-action-profile` | 'field-inset' |
| `submit-trigger` | `data-xh-action-size` | props.size |
| `submit-trigger` | `data-xh-action-variant` | 'ghost' |
| `cancel-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `cancel-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `cancel-trigger` | `data-state` | 'edit' \| 'preview' |
| `cancel-trigger` | `data-xh-action-control` | '' |
| `cancel-trigger` | `data-xh-action-display` | 'always' |
| `cancel-trigger` | `data-xh-action-profile` | 'field-inset' |
| `cancel-trigger` | `data-xh-action-size` | props.size |
| `cancel-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-editable-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-editable-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-editable-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-editable-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-editable-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-editable-control-border-disabled` | `control` | `border-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-border-disabled` |
| `--xh-editable-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-editable-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-editable-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-editable-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-editable-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_editable-control-gap` |
| `--xh-editable-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_editable-h` |
| `--xh-editable-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-editable-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `0` |
| `--xh-editable-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-editable-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-editable-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-editable-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-editable-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-editable-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` |
| `--xh-editable-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` |
| `--xh-editable-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` |
| `--xh-editable-input-font-size` | `input` | `font-size` | `xh-field-input` | `--xh-_editable-font-size` |
| `--xh-editable-input-px` | `input` | `padding-inline` | `default` | `--xh-_editable-px` |
| `--xh-editable-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-editable-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-editable-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-editable-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-editable-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-editable-placeholder-fg` | `input`<br>`preview` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-editable-preview-fg` | `preview` | `color` | `default` | `--xh-fg-default` |
| `--xh-editable-preview-font-size` | `preview` | `font-size` | `default` | `--xh-_editable-font-size` |
| `--xh-editable-preview-min-h` | `preview` | `min-block-size` | `default` | `--xh-_editable-h` |
| `--xh-editable-preview-px` | `preview` | `padding-inline` | `default` | `--xh-_editable-px` |
| `--xh-editable-trigger-bg` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-editable-trigger-bg-active` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-editable-trigger-bg-disabled` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled` |
| `--xh-editable-trigger-bg-hover` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-editable-trigger-fg` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-editable-trigger-fg-hover` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-editable-trigger-font-size` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-editable-trigger-radius` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-editable-trigger-size` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
