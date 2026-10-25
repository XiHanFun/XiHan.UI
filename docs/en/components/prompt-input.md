# PromptInput <Badge type="info" text="alpha" />

AI chat component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/prompt-input).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/prompt-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/prompt-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/prompt-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/prompt-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/prompt-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="prompt-input"`: **`root`** · `control` · **`input`** · **`submit-trigger`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-prompt-input>` |
| Vue components | `XhPromptInputControl` `XhPromptInputInput` `XhPromptInputRoot` `XhPromptInputSubmitTrigger` |
| Composable | `usePromptInput` |
| State machine | `promptInputMachine` |
| Skin | `@xihan-ui/styles/prompt-input.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `value` | `string` |  |
| `defaultValue` | `string` |  |
| `disabled` | `boolean` |  |
| `loading` | `boolean` |  |
| `submitKey` | `PromptInputSubmitKey` |  |
| `allowEmptySubmit` | `boolean` |  |
| `clearOnSubmit` | `boolean` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<PromptInputTranslations>` |  |
| `onValueChange` | `(details: PromptInputValueChangeDetails) => void` |  |
| `onSubmit` | `(details: PromptInputSubmitDetails) => void` |  |
| `onStop` | `() => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `PromptInputValueChangeDetails` |
| `submit` | `PromptInputSubmitDetails` |
| `stop` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhPromptInputRoot` | `default` | `PromptInputRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhPromptInputRoot` | `children` | `SlotChildren<PromptInputRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `input` | 'empty' \| 'editing' \| 'disabled' |

The following names are internal to the state machine.

**States**: `empty` · `editing` · `disabled`

**Events**: `VALUE.SET` · `COMPOSITION.START` · `COMPOSITION.END` · `KEY.SUBMIT` · `SUBMIT` · `STOP` · `CONTROLLED.DISABLE` · `CONTROLLED.ENABLE` · `CONTROLLED.VALUE.EMPTY` · `PRESS.START` · `PRESS.END` · `CONTROLLED.VALUE.FILLED`

**Guards**: `canSubmit` · `isLoading` · `isValueEmpty` · `isNextValueEmpty` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string` |
| `isComposing` | `boolean` |
| `canSubmit` | `boolean` |
| `loading` | `boolean` |
| `disabled` | `boolean` |
| `setValue` | `(next: string) => void` |
| `submit` | `() => void` |
| `stop` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getControlProps` | `() => T['element']` |
| `getInputProps` | `() => T['textarea']` |
| `getSubmitTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/WCAG21/Understanding/keyboard). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` | `prompt-input.kbd.enter` |
| `Shift+Enter` | `prompt-input.kbd.shift-enter` |
| `Control+Enter` / `Meta+Enter` | `prompt-input.kbd.mod-enter` |
| `Enter` / `Control+Enter` / `Meta+Enter` | `prompt-input.kbd.none` |
| `Enter` | `prompt-input.kbd.ime-enter` |
| `Enter` | `prompt-input.kbd.yield` |
| `Enter` / `Space` | `prompt-input.kbd.submit-press` |
| `Enter` / `Space` | `prompt-input.kbd.press` |
| `Escape` | `prompt-input.kbd.escape` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `input` | `aria-label` | translations.input |
| `submit-trigger` | `aria-label` | translations.stop \| translations.send |

## Style reference

### Skin

`@xihan-ui/styles/prompt-input.css` is written against `[data-scope="prompt-input"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-prompt-input` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-field-chrome` | '' |
| `root` | `data-xh-field-size` | props.size |
| `input` | `data-state` | 'empty' \| 'editing' \| 'disabled' |
| `input` | `data-xh-field-input` | '' |
| `submit-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `submit-trigger` | `data-instant` | '' (present only while the condition holds) |
| `submit-trigger` | `data-mode` | 'stop' \| 'send' |
| `submit-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `submit-trigger` | `data-xh-action-control` | '' |
| `submit-trigger` | `data-xh-action-display` | 'always' |
| `submit-trigger` | `data-xh-action-profile` | 'text' |
| `submit-trigger` | `data-xh-action-size` | props.size |
| `submit-trigger` | `data-xh-action-variant` | 'subtle' \| 'solid' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-prompt-input-bg` | `root` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-prompt-input-bg-disabled` | `root` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-prompt-input-bg-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-prompt-input-border` | `root` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-prompt-input-border-focus` | `root` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-prompt-input-border-hover` | `root` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-prompt-input-gap` | `root` | `gap` | `xh-field-chrome` | `--xh-_prompt-input-gap` |
| `--xh-prompt-input-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=md`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-prompt-input-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` |
| `--xh-prompt-input-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` |
| `--xh-prompt-input-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` |
| `--xh-prompt-input-input-font-size` | `input` | `font-size`<br>`padding-block` | `default`<br>`xh-field-input` | `--xh-_prompt-input-font-size` |
| `--xh-prompt-input-input-radius` | `input` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-prompt-input-max-h` | `input` | `max-block-size` | `default` | `--xh-leading-normal` |
| `--xh-prompt-input-p` | `root` | `--xh-prompt-input-computed-px`<br>`padding`<br>`padding-inline` | `default`<br>`xh-field-chrome` | `--xh-_prompt-input-px` |
| `--xh-prompt-input-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-prompt-input-radius` | `root` | `border-radius` | `xh-field-chrome` | `--xh-shape-surface` |
| `--xh-prompt-input-row-gap` | `control` | `gap` | `default` | `--xh-_prompt-input-gap` |
| `--xh-prompt-input-send-bg` | `submit-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-prompt-input-send-bg-active` | `submit-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-prompt-input-send-bg-hover` | `submit-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-prompt-input-send-bg-off` | `submit-trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-bg-muted` |
| `--xh-prompt-input-send-fg` | `submit-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-prompt-input-shadow` | `root` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-prompt-input-stop-bg` | `submit-trigger` | `--xh-ink-surface`<br>`background-color` | `mode=stop`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-prompt-input-stop-bg-active` | `submit-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`mode=stop`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-prompt-input-stop-bg-hover` | `submit-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`mode=stop`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-prompt-input-stop-fg` | `submit-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`mode=stop`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-prompt-input-stop-mark-radius` | `submit-trigger` | `border-radius` | `empty`<br>`mode=stop` | `--xh-shape-inset` |
| `--xh-prompt-input-stop-mark-size` | `submit-trigger` | `block-size`<br>`inline-size` | `empty`<br>`mode=stop` | `--xh-icon-size` |
| `--xh-prompt-input-submit-font-size` | `submit-trigger` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-prompt-input-submit-font-weight` | `submit-trigger` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-prompt-input-submit-px` | `submit-trigger` | `padding-inline` | `default` | `--xh-_prompt-input-submit-px` |
| `--xh-prompt-input-submit-radius` | `submit-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-prompt-input-submit-shadow` | `submit-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_highlight-tone` |
