# Rating

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/rating).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/rating" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/rating.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/rating" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/rating" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/rating.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="rating"`: **`root`** · `label` · **`control`** · `value-text` · **`item`** · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-rating>` |
| Vue components | `XhRatingControl` `XhRatingHiddenInput` `XhRatingItem` `XhRatingLabel` `XhRatingRoot` `XhRatingValueText` |
| Composable | `useRating` |
| State machine | `ratingMachine` |
| Skin | `@xihan-ui/styles/rating.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `number` |  |
| `defaultValue` | `number` |  |
| `count` | `number` |  |
| `allowHalf` | `boolean` |  |
| `allowClear` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `invalid` | `boolean` |  |
| `name` | `string` |  |
| `dir` | `Direction` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<RatingTranslations>` |  |
| `onValueChange` | `(details: RatingValueChangeDetails) => void` |  |
| `onHoverChange` | `(details: RatingHoverChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `RatingValueChangeDetails` |
| `hover-change` | `RatingHoverChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhRatingItem` | `default` | `RatingItemSlotProps` |
| `XhRatingRoot` | `default` | `RatingRootSlotProps` |
| `XhRatingRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhRatingItem` | `value` | `number \| string` | Yes |
| `XhRatingItem` | `children` | `SlotChildren<RatingItemSlotProps>` |  |
| `XhRatingRoot` | `label` | `ReactNode` |  |
| `XhRatingRoot` | `children` | `SlotChildren<RatingRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `VALUE.STEP` · `VALUE.TO_MIN` · `VALUE.TO_MAX` · `ITEM.SELECT` · `ITEM.FOCUS` · `ITEM.HOVER` · `HOVER.CLEAR` · `CONTROL.BLUR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `canInteract`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `number` |
| `hoveredValue` | `number \| null` |
| `highlightedValue` | `number` |
| `valueText` | `string` |
| `count` | `number` |
| `empty` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `items` | `readonly number[]` |
| `getItemState` | `(props: RatingItemProps) => RatingItemState` |
| `setValue` | `(next: number) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getControlProps` | `() => T['element']` |
| `getValueTextProps` | `() => T['element']` |
| `getItemProps` | `(props: RatingItemProps) => T['element']` |
| `getHiddenInputProps` | `() => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `rating.kbd.tab` |
| `ArrowRight` / `ArrowUp` | `rating.kbd.increment` |
| `ArrowLeft` / `ArrowDown` | `rating.kbd.decrement` |
| `Home` | `rating.kbd.min` |
| `End` | `rating.kbd.max` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-invalid` | 'true' \| 'false' |
| `control` | `aria-label` | props.ariaLabel |
| `control` | `aria-labelledby` | id of the `label` part \| undefined |
| `control` | `aria-orientation` | 'horizontal' |
| `control` | `aria-readonly` | 'true' \| 'false' |
| `control` | `aria-required` | 'true' \| 'false' |
| `control` | `role` | 'radiogroup' |
| `value-text` | `aria-hidden` | 'true' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-label` | undefined \| itemLabel(item.value, count) |
| `item` | `aria-posinset` | item.value |
| `item` | `aria-setsize` | ratingMax(prop('count')) |
| `item` | `role` | 'radio' |
| `hidden-input` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/rating.css` is written against `[data-scope="rating"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-rating` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `value-text` | `data-disabled` | '' (present only while the condition holds) |
| `value-text` | `data-empty` | '' (present only while the condition holds) |
| `value-text` | `data-invalid` | '' (present only while the condition holds) |
| `value-text` | `data-readonly` | '' (present only while the condition holds) |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-half` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-invalid` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-readonly` | '' (present only while the condition holds) |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'icon' |
| `item` | `data-xh-action-size` | 'xs' |
| `item` | `data-xh-action-variant` | 'ghost' |
| `hidden-input` | `data-disabled` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-rating-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-rating-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-rating-item-fg` | `item` | `background-color`<br>`background-image`<br>`color` | `default`<br>`disabled`<br>`empty`<br>`focus-visible`<br>`half`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not(:empty)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-subtle` |
| `--xh-rating-item-fg-highlighted` | `item` | `background-color`<br>`background-image`<br>`color` | `@media print`<br>`disabled`<br>`empty`<br>`focus-visible`<br>`half`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not(:empty)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_rating-accent` |
| `--xh-rating-item-fg-invalid` | `item` | `background-color`<br>`color` | `disabled`<br>`empty`<br>`focus-visible`<br>`hover`<br>`invalid`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-invalid` |
| `--xh-rating-item-font-size` | `item`<br>`root` | `--xh-icon-size`<br>`font-size` | `default` | `--xh-_rating-item-size` |
| `--xh-rating-item-gap` | `control` | `gap` | `default` | `--xh-_rating-item-gap` |
| `--xh-rating-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-rating-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-rating-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-rating-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-rating-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-rating-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-rating-value-text-fg` | `value-text` | `color` | `default` | `--xh-fg-muted` |
| `--xh-rating-value-text-fg-disabled` | `value-text` | `color` | `disabled` | `--xh-fg-subtle` |
| `--xh-rating-value-text-font-size` | `value-text` | `font-size` | `default` | `--xh-_rating-font-size` |
