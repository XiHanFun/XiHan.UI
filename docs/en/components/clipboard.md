# Clipboard

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/clipboard).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/clipboard" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/clipboard.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/clipboard" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/clipboard" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/clipboard.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="clipboard"`: **`root`** · `label` · `control` · `input` · **`copy-trigger`** · `indicator` · `status`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-clipboard>` |
| Vue components | `XhClipboardControl` `XhClipboardCopyTrigger` `XhClipboardIndicator` `XhClipboardInput` `XhClipboardLabel` `XhClipboardRoot` `XhClipboardStatus` |
| Composable | `useClipboard` |
| State machine | `clipboardMachine` |
| Skin | `@xihan-ui/styles/clipboard.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `value` | `string` |  |
| `timeout` | `number` |  |
| `disabled` | `boolean` |  |
| `variant` | `ActionVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<ClipboardTranslations>` |  |
| `onStatusChange` | `(details: ClipboardStatusChangeDetails) => void` |  |
| `onCopyError` | `(details: ClipboardCopyErrorDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `status-change` | `ClipboardStatusChangeDetails` |
| `copy-error` | `ClipboardCopyErrorDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhClipboardRoot` | `default` | `ClipboardRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhClipboardIndicator` | `copied` | `boolean` |  |
| `XhClipboardRoot` | `children` | `SlotChildren<ClipboardRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'idle' \| 'copying' \| 'copied' |
| `label` | 'idle' \| 'copying' \| 'copied' |
| `control` | 'idle' \| 'copying' \| 'copied' |
| `input` | 'idle' \| 'copying' \| 'copied' |
| `copy-trigger` | 'idle' \| 'copying' \| 'copied' |
| `indicator` | 'idle' \| 'copying' \| 'copied' |
| `status` | 'idle' \| 'copying' \| 'copied' |

The following names are internal to the state machine.

**States**: `idle` · `copying` · `copied`

**Events**: `COPY.TRIGGER` · `COPY.SUCCESS` · `COPY.ERROR` · `after.timeout` · `PRESS.START` · `PRESS.END`

**Guards**: `isDisabled` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `status` | `ClipboardStatus` |
| `disabled` | `boolean` |
| `announcement` | `string` |
| `copied` | `boolean` |
| `value` | `string` |
| `copy` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getInputProps` | `() => T['input']` |
| `getCopyTriggerProps` | `() => T['button']` |
| `getIndicatorProps` | `(props: ClipboardIndicatorProps) => T['element']` |
| `getStatusProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `clipboard.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `input` | `aria-labelledby` | id of the `label` part \| undefined |
| `copy-trigger` | `aria-busy` | 'true' \| undefined |
| `copy-trigger` | `aria-disabled` | 'true' \| undefined |
| `copy-trigger` | `aria-label` | translations.copy |
| `indicator` | `aria-hidden` | indicator.copied !== copied \|\| undefined |
| `status` | `aria-atomic` | 'true' |
| `status` | `aria-live` | 'polite' |
| `status` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/clipboard.css` is written against `[data-scope="clipboard"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-clipboard` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-copied` | '' (present only while the condition holds) |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `control` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `input` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `copy-trigger` | `data-copied` | '' (present only while the condition holds) |
| `copy-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `copy-trigger` | `data-loading` | '' (present only while the condition holds) |
| `copy-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `copy-trigger` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `copy-trigger` | `data-xh-action-control` | '' |
| `copy-trigger` | `data-xh-action-display` | 'always' |
| `copy-trigger` | `data-xh-action-profile` | 'text' |
| `copy-trigger` | `data-xh-action-size` | props.size |
| `copy-trigger` | `data-xh-action-variant` | props.variant |
| `copy-trigger` | `data-xh-ink-surface` | '' (present only while the condition holds) |
| `copy-trigger` | `data-xh-loading-ring` | 'overlay' |
| `indicator` | `data-copied` | '' (present only while the condition holds) |
| `indicator` | `data-state` | 'idle' \| 'copying' \| 'copied' |
| `status` | `data-state` | 'idle' \| 'copying' \| 'copied' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-clipboard-control-active-layer` | `control`<br>`copy-trigger`<br>`input` | `z-index` | `focus-visible`<br>`focus-within`<br>`hover` | `1` |
| `--xh-clipboard-control-gap` | `control` | `gap` | `default` | `0` |
| `--xh-clipboard-control-min-w` | `root` | `min-inline-size` | `has([data-scope='clipboard'][data-part='control'])` | `--xh-control-min-w` |
| `--xh-clipboard-control-w` | `root` | `inline-size`<br>`min-inline-size` | `has([data-scope='clipboard'][data-part='control'])` | `--xh-control-w` |
| `--xh-clipboard-copy-trigger-attached-radius` | `control`<br>`copy-trigger` | `border-end-end-radius`<br>`border-start-end-radius` | `not(:first-child)` | `--xh-clipboard-input-radius` |
| `--xh-clipboard-copy-trigger-bg` | `copy-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`loading`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-loading`<br>`--xh-_action-variant-bg-rest` |
| `--xh-clipboard-copy-trigger-bg-active` | `copy-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-clipboard-copy-trigger-bg-disabled` | `copy-trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled` |
| `--xh-clipboard-copy-trigger-bg-hover` | `copy-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-clipboard-copy-trigger-border` | `control`<br>`copy-trigger` | `border`<br>`border-color` | `default`<br>`focus-visible`<br>`not(:first-child)` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest`<br>`--xh-border-control` |
| `--xh-clipboard-copy-trigger-border-disabled` | `copy-trigger` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` |
| `--xh-clipboard-copy-trigger-border-hover` | `control`<br>`copy-trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not(:first-child)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed`<br>`--xh-border-control-hover` |
| `--xh-clipboard-copy-trigger-fg` | `copy-trigger` | `border`<br>`border-color`<br>`color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`copied`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`motion=reduce`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`where([data-motion='reduce'])`<br>`xh-action-variant=solid`<br>`xh-loading-ring`<br>`xh-loading-ring=overlay` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-loading`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-clipboard-copy-trigger-fg-copied` | `copy-trigger` | `color` | `copied`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-success` |
| `--xh-clipboard-copy-trigger-font-size` | `copy-trigger` | `font-size` | `default` | `--xh-_clipboard-font-size` |
| `--xh-clipboard-copy-trigger-font-weight` | `copy-trigger` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-clipboard-copy-trigger-gap` | `copy-trigger`<br>`indicator` | `gap` | `default` | `--xh-control-gap-sm` |
| `--xh-clipboard-copy-trigger-h` | `copy-trigger` | `block-size` | `default` | `--xh-_clipboard-h` |
| `--xh-clipboard-copy-trigger-px` | `copy-trigger` | `padding-inline` | `default` | `--xh-_clipboard-px` |
| `--xh-clipboard-copy-trigger-radius` | `copy-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-clipboard-copy-trigger-shadow-hover` | `copy-trigger` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` |
| `--xh-clipboard-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-clipboard-indicator-fg-copied` | `indicator` | `color` | `copied` | `--xh-fg-success` |
| `--xh-clipboard-indicator-gap` | `indicator` | `gap` | `default` | `--xh-clipboard-copy-trigger-gap` |
| `--xh-clipboard-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-subtle-opaque` |
| `--xh-clipboard-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` |
| `--xh-clipboard-input-bg` | `input` | `background` | `default` | `--xh-bg-subtle` |
| `--xh-clipboard-input-bg-focus` | `input` | `background` | `focus-within` | `--xh-bg-surface` |
| `--xh-clipboard-input-border` | `input` | `border` | `default` | `--xh-border-control` |
| `--xh-clipboard-input-border-focus` | `input` | `border-color` | `focus-within` | `--xh-border-control-focus` |
| `--xh-clipboard-input-fg` | `input` | `color` | `default` | `--xh-fg-default` |
| `--xh-clipboard-input-font-size` | `input` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-clipboard-input-h` | `input` | `block-size` | `default` | `--xh-_clipboard-h` |
| `--xh-clipboard-input-px` | `input` | `padding-inline` | `default` | `--xh-_clipboard-px` |
| `--xh-clipboard-input-radius` | `control`<br>`copy-trigger`<br>`input` | `border-end-end-radius`<br>`border-radius`<br>`border-start-end-radius` | `default`<br>`not(:first-child)` | `--xh-shape-control` |
| `--xh-clipboard-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-clipboard-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-clipboard-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-clipboard-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-clipboard-loading-duration` | `copy-trigger` | `animation` | `xh-loading-ring` | `--xh-motion-loop-spin` |
