# DownloadTrigger

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/download-trigger).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/download-trigger" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/download-trigger.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/download-trigger" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/download-trigger" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/download-trigger.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="download-trigger"`: **`root`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-download-trigger>` |
| Vue components | `XhDownloadTrigger` |
| Composable | `useDownloadTrigger` |
| State machine | `downloadTriggerMachine` |
| Skin | `@xihan-ui/styles/download-trigger.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `data` | `DownloadTriggerData` |  |
| `fileName` | `string` |  |
| `mimeType` | `string` |  |
| `disabled` | `boolean` |  |
| `variant` | `ActionVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<DownloadTriggerTranslations>` |  |
| `onDownloadComplete` | `(details: DownloadTriggerCompleteDetails) => void` |  |
| `onDownloadError` | `(details: DownloadTriggerErrorDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `download-complete` | `DownloadTriggerCompleteDetails` |
| `download-error` | `DownloadTriggerErrorDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhDownloadTrigger` | `default` | `DownloadTriggerSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhDownloadTrigger` | `children` | `SlotChildren<DownloadTriggerSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'idle' \| 'preparing' |

The following names are internal to the state machine.

**States**: `idle` · `preparing`

**Events**: `DOWNLOAD.TRIGGER` · `DOWNLOAD.SUCCESS` · `DOWNLOAD.ERROR` · `PRESS.START` · `PRESS.END`

**Guards**: `isDisabled` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `status` | `DownloadTriggerStatus` |
| `preparing` | `boolean` |
| `disabled` | `boolean` |
| `fileName` | `string` |
| `download` | `() => void` |
| `getRootProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `download-trigger.kbd.activate` |
| `Enter` / `Space` | `download-trigger.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-disabled` | 'true' \| undefined |
| `root` | `aria-label` | props.translations.trigger |

## Style reference

### Skin

`@xihan-ui/styles/download-trigger.css` is written against `[data-scope="download-trigger"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-download-trigger` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-pressed` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'preparing' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-action-control` | '' |
| `root` | `data-xh-action-display` | 'always' |
| `root` | `data-xh-action-profile` | 'text' |
| `root` | `data-xh-action-size` | props.size |
| `root` | `data-xh-action-variant` | props.variant |
| `root` | `data-xh-ink-surface` | '' (present only while the condition holds) |
| `root` | `data-xh-loading-ring` | 'overlay' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-download-trigger-bg` | `root` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`loading`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-loading`<br>`--xh-_action-variant-bg-rest` |
| `--xh-download-trigger-bg-active` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-download-trigger-bg-disabled` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled` |
| `--xh-download-trigger-bg-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-download-trigger-border` | `root` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest` |
| `--xh-download-trigger-border-disabled` | `root` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` |
| `--xh-download-trigger-border-hover` | `root` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` |
| `--xh-download-trigger-fg` | `root` | `border`<br>`border-color`<br>`color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`motion=reduce`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`where([data-motion='reduce'])`<br>`xh-loading-ring`<br>`xh-loading-ring=overlay` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-loading`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-download-trigger-font-size` | `root` | `font-size` | `default` | `--xh-_action-profile-font-size` |
| `--xh-download-trigger-font-weight` | `root` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-download-trigger-gap` | `root` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-download-trigger-h` | `root` | `block-size` | `default` | `--xh-_action-profile-visual-size` |
| `--xh-download-trigger-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-download-trigger-loading-duration` | `root` | `animation` | `xh-loading-ring` | `--xh-motion-loop-spin` |
| `--xh-download-trigger-loading-fg` | `root` | `border`<br>`border-color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`motion=reduce`<br>`where([data-motion='reduce'])`<br>`xh-loading-ring`<br>`xh-loading-ring=overlay` | `--xh-download-trigger-fg` |
| `--xh-download-trigger-px` | `root` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-download-trigger-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-download-trigger-shadow-hover` | `root` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` |
