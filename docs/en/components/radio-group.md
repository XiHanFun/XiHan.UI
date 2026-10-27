# RadioGroup

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/radio-group).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/radio-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/radio-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/radio-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/radio-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/radio-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="radio-group"`: `root` · `label` · `thumb` · `item` · `item-icon` · `item-text` · `item-description` · `indicator` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-radio-group>` |
| Vue components | `XhRadioGroupItem` `XhRadioGroupItemDescription` `XhRadioGroupItemIcon` `XhRadioGroupItemText` `XhRadioGroupLabel` `XhRadioGroupRoot` `XhRadioGroupThumb` |
| Composable | `useRadioGroup` |
| State machine | `radioGroupMachine` |
| Skin | `@xihan-ui/styles/radio-group.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `RadioGroupNode<V>[]` |  |
| `valueKey` | `SelectionValueKey<V>` |  |
| `value` | `V \| null` |  |
| `defaultValue` | `V \| null` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `orientation` | `Orientation` |  |
| `dir` | `Direction` |  |
| `name` | `string` |  |
| `loop` | `boolean` |  |
| `block` | `boolean` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `variant` | `RadioGroupVariant` |  |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `onValueChange` | `(details: RadioGroupValueChangeDetails<V>) => void` |  |

### RadioGroupNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `V` | Yes |
| `label` | `string` |  |
| `description` | `string` |  |
| `icon` | `string` |  |
| `disabled` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `RadioGroupValueChangeDetails` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhRadioGroupItem` | `value` | `unknown` | Yes |
| `XhRadioGroupItem` | `disabled` | `boolean` |  |
| `XhRadioGroupRoot` | `label` | `ReactNode` |  |
| `XhRadioGroupRoot` | `renderItem` | `(node: RadioGroupNodeMeta<V>) => ReactNode` |  |
| `XhRadioGroupRoot` | `children` | `ReactNode` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `item-icon` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `indicator` | 'checked' \| 'unchecked' |
| `hidden-input` | 'checked' \| 'unchecked' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `ITEM.SELECT` · `ITEM.FOCUS` · `GROUP.BLUR` · `FORM.RESET` · `THUMB.MEASURE` · `PRESS.START` · `PRESS.END`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `V \| null` |
| `collection` | `readonly RadioGroupNodeMeta<V>[]` |
| `focusedValue` | `V \| null` |
| `variant` | `RadioGroupVariant` |
| `setValue` | `(next: V) => void` |
| `measure` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getItemProps` | `(props: RadioGroupItemProps<V>) => T['element']` |
| `getItemIconProps` | `(props: RadioGroupItemProps<V>) => T['element']` |
| `getItemTextProps` | `(props: RadioGroupItemProps<V>) => T['element']` |
| `getItemDescriptionProps` | `(props: RadioGroupItemProps<V>) => T['element']` |
| `getIndicatorProps` | `(props: RadioGroupItemProps<V>) => T['element']` |
| `getThumbProps` | `() => T['element']` |
| `getHiddenInputProps` | `(props: RadioGroupItemProps<V>) => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `radio-group.kbd.tab` |
| `ArrowDown` / `ArrowRight` | `radio-group.kbd.next` |
| `ArrowUp` / `ArrowLeft` | `radio-group.kbd.prev` |
| `Space` | `radio-group.kbd.select` |
| `Space` | `radio-group.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `aria-labelledby` | id of the `label` part \| undefined |
| `root` | `aria-orientation` | 'horizontal' \| 'vertical' |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'radiogroup' |
| `thumb` | `aria-hidden` | 'true' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'radio' |
| `item-icon` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/radio-group.css` is written against `[data-scope="radio-group"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-radio-group` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-block` | '' (present only while the condition holds) |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-orientation` | 'horizontal' \| 'vertical' |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `thumb` | `data-instant` | '' (present only while the condition holds) |
| `thumb` | `data-value` | context.get('value') |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-invalid` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-readonly` | '' (present only while the condition holds) |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-action-control` | undefined \| '' |
| `item` | `data-xh-action-display` | undefined \| 'always' |
| `item` | `data-xh-action-profile` | undefined \| 'row' |
| `item` | `data-xh-action-size` | undefined \| 'xs' |
| `item` | `data-xh-action-variant` | undefined \| 'outline' \| 'ghost' |
| `item` | `data-xh-choice-card` | '' (present only while the condition holds) |
| `item-icon` | `data-disabled` | '' (present only while the condition holds) |
| `item-icon` | `data-invalid` | '' (present only while the condition holds) |
| `item-icon` | `data-readonly` | '' (present only while the condition holds) |
| `item-icon` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-disabled` | '' (present only while the condition holds) |
| `item-text` | `data-invalid` | '' (present only while the condition holds) |
| `item-text` | `data-readonly` | '' (present only while the condition holds) |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-disabled` | '' (present only while the condition holds) |
| `item-description` | `data-invalid` | '' (present only while the condition holds) |
| `item-description` | `data-readonly` | '' (present only while the condition holds) |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `indicator` | `data-disabled` | '' (present only while the condition holds) |
| `indicator` | `data-invalid` | '' (present only while the condition holds) |
| `indicator` | `data-readonly` | '' (present only while the condition holds) |
| `indicator` | `data-state` | 'checked' \| 'unchecked' |
| `hidden-input` | `data-disabled` | '' (present only while the condition holds) |
| `hidden-input` | `data-invalid` | '' (present only while the condition holds) |
| `hidden-input` | `data-readonly` | '' (present only while the condition holds) |
| `hidden-input` | `data-state` | 'checked' \| 'unchecked' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-radio-group-card-title-font-weight` | `item`<br>`item-text` | `font-weight` | `xh-choice-card` | `--xh-text-label-weight` |
| `--xh-radio-group-gap` | `root` | `gap` | `default` | `--xh-space-2` |
| `--xh-radio-group-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-radio-group-indicator-bg` | `indicator` | `background` | `default` | `transparent` |
| `--xh-radio-group-indicator-bg-disabled` | `indicator`<br>`item` | `background` | `disabled` | `--xh-bg-subtle` |
| `--xh-radio-group-indicator-bg-pressed` | `indicator`<br>`item` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly` | `--xh-_radio-group-host-bg-pressed` |
| `--xh-radio-group-indicator-border` | `indicator` | `border` | `default` | `--xh-border-strong` |
| `--xh-radio-group-indicator-border-checked` | `indicator` | `border-color` | `state=checked` | `--xh-_radio-group-accent` |
| `--xh-radio-group-indicator-border-disabled` | `indicator`<br>`item` | `border-color` | `disabled` | `--xh-border-default` |
| `--xh-radio-group-indicator-border-hover` | `indicator`<br>`item` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`readonly`<br>`state=checked` | `--xh-border-control-hover` |
| `--xh-radio-group-indicator-border-invalid` | `indicator` | `border-color` | `invalid`<br>`state=checked` | `--xh-border-invalid` |
| `--xh-radio-group-indicator-dot` | `indicator` | `background` | `default` | `--xh-_radio-group-accent` |
| `--xh-radio-group-indicator-dot-disabled` | `indicator`<br>`item` | `background` | `disabled` | `--xh-fg-disabled` |
| `--xh-radio-group-indicator-dot-pressed` | `indicator`<br>`item` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked` | `--xh-_tone-active` |
| `--xh-radio-group-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-radio-group-indicator-size` | `indicator` | `block-size`<br>`inline-size` | `default` | `--xh-_radio-group-indicator` |
| `--xh-radio-group-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` |
| `--xh-radio-group-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-radio-group-item-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-radio-group-item-description-fg-disabled` | `item`<br>`item-description` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-radio-group-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-radio-group-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-radio-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-radio-group-item-font-size` | `item`<br>`root` | `font-size` | `default`<br>`variant=segmented` | `--xh-_radio-group-font-size` |
| `--xh-radio-group-item-gap` | `item`<br>`root` | `gap` | `default`<br>`variant=segmented` | `--xh-_radio-group-item-gap` |
| `--xh-radio-group-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-radio-group-item-row-gap` | `item` | `row-gap` | `has(> [data-scope='radio-group'][data-part='item-description'])`<br>`not([data-xh-choice-card])`<br>`xh-choice-card` | `--xh-space-1` |
| `--xh-radio-group-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-radio-group-label-fg-disabled` | `label`<br>`root` | `color` | `disabled` | `--xh-fg-subtle` |
| `--xh-radio-group-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-radio-group-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-radio-group-segment-bg-hover` | `item`<br>`root` | `background-color` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`readonly`<br>`state=checked`<br>`variant=segmented` | `--xh-bg-subtle` |
| `--xh-radio-group-segment-bg-pressed` | `item`<br>`root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`variant=segmented` | `--xh-bg-subtle-hover` |
| `--xh-radio-group-segment-fg` | `item`<br>`root` | `color` | `variant=segmented` | `--xh-fg-muted` |
| `--xh-radio-group-segment-fg-checked` | `item`<br>`root` | `color` | `state=checked`<br>`variant=segmented` | `--xh-_radio-group-segment-fg-checked` |
| `--xh-radio-group-segment-fg-checked-disabled` | `item`<br>`root` | `color` | `disabled`<br>`state=checked`<br>`variant=segmented` | `--xh-_radio-group-segment-fg-checked-disabled` |
| `--xh-radio-group-segment-fg-hover` | `item`<br>`root` | `color` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`readonly`<br>`state=checked`<br>`variant=segmented` | `--xh-fg-default` |
| `--xh-radio-group-segment-font-weight` | `item`<br>`root` | `font-weight` | `variant=segmented` | `--xh-text-label-weight` |
| `--xh-radio-group-segment-font-weight-checked` | `item`<br>`root` | `font-weight` | `state=checked`<br>`variant=segmented` | `--xh-font-weight-medium` |
| `--xh-radio-group-segment-h` | `item`<br>`root` | `block-size`<br>`min-block-size` | `orientation=horizontal`<br>`variant=segmented` | `--xh-_radio-group-segment-h` |
| `--xh-radio-group-segment-px` | `item`<br>`root` | `padding-inline` | `variant=segmented` | `--xh-_radio-group-segment-px` |
| `--xh-radio-group-segment-radius` | `item`<br>`root` | `border-radius` | `variant=segmented` | `--xh-shape-inset` |
| `--xh-radio-group-segment-separator` | `item`<br>`root` | `background-color` | `orientation=horizontal`<br>`variant=segmented` | `--xh-border-default` |
| `--xh-radio-group-thumb-bg` | `thumb` | `background` | `default` | `--xh-_radio-group-thumb-bg` |
| `--xh-radio-group-thumb-bg-disabled` | `root`<br>`thumb` | `background` | `disabled`<br>`has(> [data-scope='radio-group'][data-part='item'][data-state='checked'][data-disabled])`<br>`state=checked`<br>`variant=segmented` | `--xh-_radio-group-thumb-bg-disabled` |
| `--xh-radio-group-thumb-bg-hover` | `root`<br>`thumb` | `background` | `disabled`<br>`has(> [data-scope='radio-group'][data-part='item'][data-state='checked']:not([data-disabled])`<br>`hover`<br>`not([data-readonly])`<br>`readonly`<br>`state=checked`<br>`variant=segmented` | `--xh-_radio-group-thumb-bg-hover` |
| `--xh-radio-group-thumb-border` | `thumb` | `border` | `default` | `transparent` |
| `--xh-radio-group-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-radio-group-thumb-shadow` | `thumb` | `box-shadow` | `default` | `none` |
| `--xh-radio-group-track-bg` | `root` | `background` | `variant=segmented` | `--xh-bg-field` |
| `--xh-radio-group-track-bg-disabled` | `root` | `background` | `disabled`<br>`variant=segmented` | `--xh-bg-muted` |
| `--xh-radio-group-track-border` | `root` | `border` | `variant=segmented` | `--xh-border-control` |
| `--xh-radio-group-track-border-invalid` | `root` | `border-color` | `invalid`<br>`variant=segmented` | `--xh-border-invalid` |
| `--xh-radio-group-track-padding` | `item`<br>`root` | `inset-block-start`<br>`min-block-size`<br>`padding` | `@media (pointer: coarse)`<br>`orientation=horizontal`<br>`variant=segmented` | `--xh-space-0_5` |
| `--xh-radio-group-track-radius` | `root` | `border-radius` | `variant=segmented` | `--xh-shape-control` |
