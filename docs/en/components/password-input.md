# PasswordInput

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/password-input).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/password-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/password-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/password-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/password-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/password-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="password-input"`: **`root`** · `label` · `control` · **`input`** · **`visibility-trigger`** · `caps-lock-indicator` · `strength-meter`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-password-input>` |
| Vue components | `XhPasswordInputCapsLockIndicator` `XhPasswordInputControl` `XhPasswordInputInput` `XhPasswordInputLabel` `XhPasswordInputRoot` `XhPasswordInputStrengthMeter` `XhPasswordInputVisibilityTrigger` |
| Composable | `usePasswordInput` |
| State machine | `passwordInputMachine` |
| Skin | `@xihan-ui/styles/password-input.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `value` | `string` |  |
| `defaultValue` | `string` |  |
| `revealed` | `boolean` |  |
| `defaultRevealed` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `invalid` | `boolean` |  |
| `name` | `string` |  |
| `placeholder` | `string` |  |
| `autoComplete` | `string` |  |
| `strength` | `number` |  |
| `translations` | `Partial<PasswordInputTranslations>` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onValueChange` | `(details: PasswordInputValueChangeDetails) => void` |  |
| `onRevealedChange` | `(details: PasswordInputRevealedChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `PasswordInputValueChangeDetails` |
| `revealed-change` | `PasswordInputRevealedChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhPasswordInputRoot` | `default` | `PasswordInputRootSlotProps` |
| `XhPasswordInputRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhPasswordInputRoot` | `label` | `ReactNode` |  |
| `XhPasswordInputRoot` | `children` | `SlotChildren<PasswordInputRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `visibility-trigger` | 'visible' \| 'hidden' |
| `caps-lock-indicator` | 'visible' \| 'hidden' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `REVEALED.SET` · `REVEALED.TOGGLE` · `CAPS_LOCK.SET` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `canEdit` · `canReveal`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string` |
| `empty` | `boolean` |
| `revealed` | `boolean` |
| `capsLock` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `inputType` | `PasswordInputType` |
| `capsLockMessage` | `string` |
| `strength` | `number \| undefined` |
| `setValue` | `(next: string) => void` |
| `setRevealed` | `(next: boolean) => void` |
| `toggleRevealed` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getInputProps` | `() => T['input']` |
| `getVisibilityTriggerProps` | `() => T['button']` |
| `getCapsLockIndicatorProps` | `() => T['element']` |
| `getStrengthMeterProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `password-input.kbd.toggle` |
| `CapsLock` | `password-input.kbd.caps-lock` |
| `Enter` / `Space` | `password-input.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `input` | `aria-describedby` | id of the `capsLock` part \| undefined |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.ariaLabel |
| `input` | `aria-labelledby` | id of the `label` part \| undefined |
| `visibility-trigger` | `aria-controls` | id of the `password-input-input` part |
| `visibility-trigger` | `aria-label` | label.visibilityTriggerHide \| label.visibilityTriggerShow |
| `caps-lock-indicator` | `aria-atomic` | 'true' |
| `caps-lock-indicator` | `aria-live` | 'polite' |
| `caps-lock-indicator` | `role` | 'status' |
| `strength-meter` | `aria-label` | label.strengthMeter |
| `strength-meter` | `aria-valuemax` | 4 |
| `strength-meter` | `aria-valuemin` | 0 |
| `strength-meter` | `aria-valuenow` | undefined \| Math.min(Math.max(Math.trunc(rawStrength), 0), STRENG… |
| `strength-meter` | `role` | 'meter' |

## Style reference

### Skin

`@xihan-ui/styles/password-input.css` is written against `[data-scope="password-input"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-password-input` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

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
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `input` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-invalid` | '' (present only while the condition holds) |
| `input` | `data-readonly` | '' (present only while the condition holds) |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'single-line' |
| `visibility-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `visibility-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `visibility-trigger` | `data-state` | 'visible' \| 'hidden' |
| `visibility-trigger` | `data-xh-action-control` | '' |
| `visibility-trigger` | `data-xh-action-display` | 'always' |
| `visibility-trigger` | `data-xh-action-profile` | 'field-inset' |
| `visibility-trigger` | `data-xh-action-size` | props.size |
| `visibility-trigger` | `data-xh-action-variant` | 'ghost' |
| `caps-lock-indicator` | `data-state` | 'visible' \| 'hidden' |
| `strength-meter` | `data-disabled` | '' (present only while the condition holds) |
| `strength-meter` | `data-level` | undefined \| String(strength) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-password-input-caps-lock-fg` | `caps-lock-indicator` | `color` | `default` | `--xh-fg-muted` |
| `--xh-password-input-caps-lock-fg-disabled` | `caps-lock-indicator`<br>`control` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-password-input-caps-lock-font-size` | `caps-lock-indicator` | `font-size` | `default` | `--xh-_password-input-caps-lock-font-size` |
| `--xh-password-input-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-password-input-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-password-input-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-password-input-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-password-input-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-password-input-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-password-input-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-password-input-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-password-input-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-password-input-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_password-input-gap` |
| `--xh-password-input-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_password-input-h` |
| `--xh-password-input-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-password-input-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_password-input-px` |
| `--xh-password-input-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-password-input-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-password-input-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-password-input-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-password-input-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-password-input-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` |
| `--xh-password-input-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` |
| `--xh-password-input-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` |
| `--xh-password-input-input-font-size` | `input` | `font-size` | `xh-field-input` | `--xh-_password-input-font-size` |
| `--xh-password-input-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-password-input-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-password-input-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-password-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-password-input-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-password-input-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-password-input-strength-fg` | `strength-meter` | `background` | `empty` | `--xh-_password-input-strength-fg` |
| `--xh-password-input-strength-radius` | `strength-meter` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-password-input-strength-thickness` | `strength-meter` | `block-size` | `default` | `--xh-track-thickness` |
| `--xh-password-input-strength-track` | `strength-meter` | `background` | `default` | `--xh-bg-subtle-active` |
| `--xh-password-input-trigger-bg` | `visibility-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-password-input-trigger-bg-active` | `visibility-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-password-input-trigger-bg-hover` | `visibility-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-password-input-trigger-fg` | `visibility-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-password-input-trigger-fg-hover` | `visibility-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` |
| `--xh-password-input-trigger-font-size` | `visibility-trigger` | `font-size` | `default` | `--xh-_password-input-trigger-font-size` |
| `--xh-password-input-trigger-radius` | `visibility-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-password-input-trigger-size` | `visibility-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` |
