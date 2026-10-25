# TagsInput

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/tags-input).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tags-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tags-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tags-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tags-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tags-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="tags-input"`: **`root`** · `label` · **`control`** · **`input`** · `item` · `item-input` · `clear-trigger` · `count` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-tags-input>` |
| Vue components | `XhTagsInputClearTrigger` `XhTagsInputControl` `XhTagsInputCount` `XhTagsInputHiddenInput` `XhTagsInputInput` `XhTagsInputItem` `XhTagsInputItemDeleteTrigger` `XhTagsInputItemInput` `XhTagsInputItemPreview` `XhTagsInputItemText` `XhTagsInputLabel` `XhTagsInputRoot` |
| Composable | `useTagsInput` |
| State machine | `tagsInputMachine` |
| Skin | `@xihan-ui/styles/tags-input.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string[]` |  |
| `defaultValue` | `string[]` |  |
| `inputValue` | `string` |  |
| `defaultInputValue` | `string` |  |
| `max` | `number` |  |
| `allowOverflow` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `invalid` | `boolean` |  |
| `showCount` | `boolean` |  |
| `name` | `string` |  |
| `placeholder` | `string` |  |
| `delimiter` | `string \| string[]` |  |
| `validate` | `(tag: string, context: TagsInputValidateContext) => string \| string[] \| null \| undefined` |  |
| `addOnPaste` | `boolean` |  |
| `editable` | `boolean` |  |
| `blurBehavior` | `TagsInputBlurBehavior \| null` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<TagsInputTranslations>` |  |
| `onValueChange` | `(details: TagsInputValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |
| `onInputValueChange` | `(details: TagsInputInputValueChangeDetails) => void` |  |
| `onTagReject` | `(details: TagsInputTagRejectDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `TagsInputValueChangeDetails` |
| `clear` | `` |
| `input-value-change` | `TagsInputInputValueChangeDetails` |
| `tag-reject` | `TagsInputTagRejectDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTagsInputCount` | `default` | `TagsInputCountSlotProps` |
| `XhTagsInputRoot` | `default` | `TagsInputRootSlotProps` |
| `XhTagsInputRoot` | `label` | — |
| `XhTagsInputRoot` | `item` | `{ value: string }` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTagsInputCount` | `children` | `SlotChildren<TagsInputCountSlotProps>` |  |
| `XhTagsInputItem` | `value` | `string` | Yes |
| `XhTagsInputRoot` | `label` | `ReactNode` |  |
| `XhTagsInputRoot` | `renderItem` | `(value: string) => ReactNode` |  |
| `XhTagsInputRoot` | `children` | `SlotChildren<TagsInputRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle` · `navigating` · `editing`

**Events**: `VALUE.SET` · `TAG.ADD` · `VALUE.CLEAR` · `INPUT.CHANGE` · `INPUT.COMMIT` · `INPUT.BLUR` · `TAG.HIGHLIGHT` · `TAG.DELETE` · `TAG.EDIT` · `EDIT.CHANGE` · `EDIT.SUBMIT` · `EDIT.CANCEL` · `ITEM.FOCUS_LOST` · `FORM.RESET` · `PRESS.START` · `PRESS.END` · `LIST.TRACKED`

**Guards**: `canEdit` · `canEditTag` · `canDeleteWithPrev` · `hasHighlightTarget` · `canPress` · `isEditRejected` · `isBlurEditRejected`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string[]` |
| `count` | `number` |
| `inputValue` | `string` |
| `empty` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `required` | `boolean` |
| `invalid` | `boolean` |
| `max` | `number \| undefined` |
| `showCount` | `boolean` |
| `atMax` | `boolean` |
| `overflow` | `boolean` |
| `highlightedValue` | `string \| null` |
| `editedValue` | `string \| null` |
| `canClear` | `boolean` |
| `setValue` | `(next: string[]) => void` |
| `addValue` | `(next: string) => void` |
| `deleteValue` | `(value: string) => void` |
| `clear` | `() => void` |
| `setInputValue` | `(next: string) => void` |
| `highlight` | `(value: string \| null) => void` |
| `edit` | `(value: string) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getInputProps` | `() => T['input']` |
| `getItemProps` | `(item: TagsInputItemProps) => T['element']` |
| `getItemPreviewProps` | `(item: TagsInputItemProps) => T['element']` |
| `getItemTextProps` | `(item: TagsInputItemProps) => T['element']` |
| `getItemDeleteTriggerProps` | `(item: TagsInputItemProps) => T['button']` |
| `getItemInputProps` | `(item: TagsInputItemProps) => T['input']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getCountProps` | `() => T['element']` |
| `getHiddenInputProps` | `() => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` | `tags-input.kbd.commit` |
| delimiter (default `,`; may be a set) | `tags-input.kbd.delimiter` |
| `Backspace` | `tags-input.kbd.backspace-highlight` |
| `Backspace` | `tags-input.kbd.backspace-delete` |
| `Delete` | `tags-input.kbd.delete` |
| `ArrowLeft` | `tags-input.kbd.prev` |
| `ArrowRight` | `tags-input.kbd.next` |
| `Home` | `tags-input.kbd.first` |
| `End` | `tags-input.kbd.last` |
| `Escape` | `tags-input.kbd.escape-navigating` |
| `Enter` | `tags-input.kbd.edit` |
| `Enter` | `tags-input.kbd.edit-submit` |
| `Escape` | `tags-input.kbd.edit-cancel` |
| `Enter` / `Space` | `tags-input.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-label` | props.ariaLabel |
| `control` | `aria-labelledby` | id of the `label` part \| undefined |
| `control` | `role` | 'group' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.ariaLabel |
| `input` | `aria-labelledby` | id of the `label` part \| undefined |
| `input` | `aria-required` | 'true' \| 'false' |
| `item-input` | `aria-label` | label.editTagInput(item.value) |
| `clear-trigger` | `aria-label` | label.clearTrigger |
| `count` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/tags-input.css` is written against `[data-scope="tags-input"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-tags-input` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-at-max` | '' (present only while the condition holds) |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-overflowing` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-at-max` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-empty` | '' (present only while the condition holds) |
| `control` | `data-instant` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-overflowing` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-layout` | 'multi-tag' |
| `control` | `data-xh-field-size` | props.size |
| `input` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-invalid` | '' (present only while the condition holds) |
| `input` | `data-readonly` | '' (present only while the condition holds) |
| `input` | `data-xh-field-input` | '' |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-editing` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-readonly` | '' (present only while the condition holds) |
| `item-input` | `data-disabled` | '' (present only while the condition holds) |
| `item-input` | `data-editing` | '' (present only while the condition holds) |
| `item-input` | `data-highlighted` | '' (present only while the condition holds) |
| `item-input` | `data-readonly` | '' (present only while the condition holds) |
| `clear-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
| `count` | `data-at-max` | '' (present only while the condition holds) |
| `count` | `data-disabled` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-tags-input-action-bg` | `clear-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-tags-input-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-tags-input-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-tags-input-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tags-input-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-tags-input-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-tags-input-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-tags-input-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
| `--xh-tags-input-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-tags-input-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-tags-input-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-tags-input-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-tags-input-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-tags-input-control-border-at-max` | `control` | `border-color` | `at-max`<br>`invalid`<br>`not([data-invalid])` | `--xh-border-at-limit` |
| `--xh-tags-input-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-tags-input-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-tags-input-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-tags-input-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-tags-input-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_tags-input-control-gap` |
| `--xh-tags-input-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_tags-input-control-h` |
| `--xh-tags-input-control-max-h` | `control` | `max-block-size` | `default` | `--xh-viewport-h-sm` |
| `--xh-tags-input-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-tags-input-control-ps` | `control` | `padding-inline-start` | `has(> [data-scope='tags-input'][data-part='item'])` | `--xh-space-1` |
| `--xh-tags-input-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_tags-input-control-px` |
| `--xh-tags-input-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-tags-input-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-tags-input-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-tags-input-count-fg` | `count` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tags-input-count-fg-at-max` | `count` | `color` | `at-max` | `--xh-fg-warning` |
| `--xh-tags-input-count-fg-disabled` | `count` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-tags-input-count-font-size` | `count` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-tags-input-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-tags-input-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-tags-input-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` |
| `--xh-tags-input-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` |
| `--xh-tags-input-input-basis` | `input` | `flex-basis` | `default` | `6rem` |
| `--xh-tags-input-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` |
| `--xh-tags-input-input-font-size` | `input` | `font-size` | `xh-field-input` | `--xh-_tags-input-input-font-size` |
| `--xh-tags-input-input-min-w` | `input` | `min-inline-size` | `default` | `--xh-control-input-min-w` |
| `--xh-tags-input-item-bg-highlight` | `item`<br>`root` | `background` | `disabled`<br>`highlighted`<br>`not([data-disabled])` | `--xh-_tags-input-accent` |
| `--xh-tags-input-item-fg-highlight` | `item`<br>`root` | `color` | `disabled`<br>`highlighted`<br>`not([data-disabled])` | `--xh-_tags-input-accent-fg` |
| `--xh-tags-input-item-font-size` | `item-input` | `font-size` | `default` | `--xh-_tags-input-item-font-size` |
| `--xh-tags-input-item-h` | `item-input` | `min-block-size` | `default` | `--xh-_tags-input-item-h` |
| `--xh-tags-input-item-input-bg` | `item-input` | `background` | `default` | `--xh-bg-field` |
| `--xh-tags-input-item-input-bg-focus` | `item-input` | `background` | `focus-within` | `--xh-bg-surface` |
| `--xh-tags-input-item-input-border` | `item-input` | `border` | `default` | `--xh-border-control` |
| `--xh-tags-input-item-input-border-focus` | `item-input` | `border-color` | `focus-within` | `--xh-border-control-focus` |
| `--xh-tags-input-item-input-border-invalid` | `control`<br>`item-input` | `border-color` | `invalid` | `--xh-border-invalid` |
| `--xh-tags-input-item-input-fg` | `item-input` | `color` | `default` | `--xh-fg-default` |
| `--xh-tags-input-item-px` | `item-input` | `padding-inline` | `default` | `--xh-_tags-input-item-px` |
| `--xh-tags-input-item-py` | `item-input` | `padding-block` | `default` | `--xh-_tags-input-item-py` |
| `--xh-tags-input-item-radius` | `item-input` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-tags-input-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tags-input-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-tags-input-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-tags-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-tags-input-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-tags-input-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
