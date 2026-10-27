# Checkbox

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/checkbox).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/checkbox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/checkbox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/checkbox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/checkbox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/checkbox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="checkbox"`: **`root`** · `indicator` · `hidden-input` · `label` · `text`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-checkbox>` |
| Vue components | `XhCheckbox` |
| Composable | `useCheckbox` |
| State machine | `checkboxMachine` |
| Skin | `@xihan-ui/styles/checkbox.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `checked` | `CheckboxCheckedState` |  |
| `defaultChecked` | `CheckboxCheckedState` |  |
| `ariaLabel` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `name` | `string` |  |
| `value` | `string` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onCheckedChange` | `(details: CheckboxCheckedChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `checked-change` | `CheckboxCheckedChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhCheckbox` | `default` | — |
| `XhCheckbox` | `indicator` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhCheckbox` | `indicator` | `ReactNode` |  |
| `XhCheckbox` | `children` | `ReactNode` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `indicator` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `label` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `text` | 'indeterminate' \| 'checked' \| 'unchecked' |

The following names are internal to the state machine.

**States**: `off` · `on` · `indeterminate`

**Events**: `TOGGLE` · `CHECK` · `UNCHECK` · `CONTROLLED.ON` · `CONTROLLED.OFF` · `CONTROLLED.INDETERMINATE` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `isCheckedControlled` · `defaultsToChecked` · `defaultsToIndeterminate` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `checked` | `CheckboxCheckedState` |
| `setChecked` | `(next: boolean) => void` |
| `getRootProps` | `() => T['button']` |
| `getIndicatorProps` | `() => T['element']` |
| `getHiddenInputProps` | `() => T['input']` |
| `getLabelProps` | `() => T['label']` |
| `getTextProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Space` / `Enter` | `checkbox.kbd.toggle` |
| `Space` / `Enter` | `checkbox.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-checked` | 'mixed' \| 'true' \| 'false' |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'checkbox' |
| `indicator` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/checkbox.css` is written against `[data-scope="checkbox"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-checkbox` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-pressed` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `root` | `data-tone` | props.tone |
| `root` | `data-xh-action-control` | '' |
| `root` | `data-xh-action-display` | 'always' |
| `root` | `data-xh-action-profile` | 'icon' |
| `root` | `data-xh-action-size` | props.size |
| `root` | `data-xh-action-variant` | 'outline' |
| `indicator` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `indicator` | `data-xh-check-mark` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `indicator` | `data-xh-check-mark-profile` | 'box' |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `label` | `data-invalid` | '' (present only while the condition holds) |
| `label` | `data-readonly` | '' (present only while the condition holds) |
| `label` | `data-size` | props.size |
| `label` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `text` | `data-disabled` | '' (present only while the condition holds) |
| `text` | `data-invalid` | '' (present only while the condition holds) |
| `text` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-checkbox-bg` | `root` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`xh-ink-surface` | `transparent` |
| `--xh-checkbox-bg-checked` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`state=indeterminate`<br>`xh-ink-surface` | `--xh-_checkbox-accent` |
| `--xh-checkbox-bg-checked-pressed` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=checked`<br>`state=indeterminate` | `--xh-_tone-active` |
| `--xh-checkbox-bg-disabled` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-bg-subtle` |
| `--xh-checkbox-bg-pressed` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-checkbox-border` | `label`<br>`root` | `border`<br>`border-color` | `@media (hover: hover)`<br>`contrast=more`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=unchecked`<br>`where([data-contrast='more'])` | `--xh-border-strong` |
| `--xh-checkbox-border-checked` | `label`<br>`root` | `border`<br>`border-color` | `@media (hover: hover)`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-accent` |
| `--xh-checkbox-border-disabled` | `root` | `border-color` | `disabled` | `--xh-border-default` |
| `--xh-checkbox-border-hover` | `label`<br>`root` | `border-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly` | `--xh-border-control-hover` |
| `--xh-checkbox-border-invalid` | `label`<br>`root` | `border`<br>`border-color` | `@media (hover: hover)`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`invalid`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`state=indeterminate` | `--xh-border-invalid` |
| `--xh-checkbox-fg` | `root` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_checkbox-on-accent` |
| `--xh-checkbox-fg-disabled` | `indicator`<br>`root` | `--xh-check-mark-fg`<br>`color` | `disabled`<br>`state=indeterminate` | `--xh-fg-disabled` |
| `--xh-checkbox-fg-invalid` | `label`<br>`text` | `color` | `invalid` | `--xh-fg-danger` |
| `--xh-checkbox-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_checkbox-glyph` |
| `--xh-checkbox-indicator-fg` | `indicator` | `--xh-check-mark-fg` | `state=indeterminate` | `--xh-_checkbox-on-accent` |
| `--xh-checkbox-label-fg` | `label` | `color` | `default` | `--xh-fg-default` |
| `--xh-checkbox-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` |
| `--xh-checkbox-label-font-size` | `label` | `font-size` | `default` | `--xh-_checkbox-label-font-size` |
| `--xh-checkbox-label-gap` | `label` | `gap` | `default` | `--xh-_checkbox-label-gap` |
| `--xh-checkbox-label-leading` | `label` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-checkbox-radius` | `root` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-checkbox-shadow` | `root` | `box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:hover, [data-loading])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` |
