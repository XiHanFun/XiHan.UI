# ToolCall <Badge type="info" text="alpha" />

AI chat component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/tool-call).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tool-call" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tool-call.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tool-call" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tool-call" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tool-call.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="tool-call"`: **`root`** · **`trigger`** · `indicator` · `label` · `summary` · `status` · `duration` · `approval` · **`content`** · `input` · `output` · `error`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-tool-call>` |
| Vue components | `XhToolCallApproval` `XhToolCallContent` `XhToolCallDuration` `XhToolCallError` `XhToolCallIndicator` `XhToolCallInput` `XhToolCallLabel` `XhToolCallOutput` `XhToolCallRoot` `XhToolCallStatus` `XhToolCallSummary` `XhToolCallTrigger` |
| Composable | `useToolCall` |
| State machine | `toolCallMachine` |
| Skin | `@xihan-ui/styles/tool-call.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `running` | `boolean` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `autoDisclosure` | `boolean` |  |
| `disabled` | `boolean` |  |
| `clock` | `boolean` |  |
| `onOpenChange` | `(details: ToolCallOpenChangeDetails) => void` |  |
| `endTime` | `number` |  |
| `phase` | `ToolCallPhase` |  |
| `size` | `Size` |  |
| `startTime` | `number` |  |
| `tone` | `Tone` |  |
| `translations` | `Partial<ToolCallTranslations>` |  |
| `variant` | `ControlVariant` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `ToolCallOpenChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhToolCallRoot` | `default` | `ToolCallRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhToolCallRoot` | `children` | `SlotChildren<ToolCallRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `label` | props.phase |
| `summary` | props.phase |
| `status` | props.phase |
| `duration` | props.phase |
| `approval` | props.phase |
| `content` | 'open' \| 'closed' |
| `input` | props.phase |
| `output` | props.phase |
| `error` | props.phase |

The following names are internal to the state machine.

**States**: `auto.collapsed` · `auto.expanded` · `held.collapsed` · `held.expanded`

**Events**: `TOGGLE` · `OPEN` · `CLOSE` · `PHASE.ACTIVE` · `PHASE.SETTLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

**Guards**: `isOpenControlled` · `isAutoAllowed` · `isAutoEnabled` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `phase` | `ToolCallPhase` |
| `running` | `boolean` |
| `settled` | `boolean` |
| `errored` | `boolean` |
| `disabled` | `boolean` |
| `statusText` | `string` |
| `durationMs` | `number \| undefined` |
| `setOpen` | `(next: boolean) => void` |
| `getRootProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getIndicatorProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getSummaryProps` | `() => T['element']` |
| `getStatusProps` | `() => T['element']` |
| `getDurationProps` | `() => T['element']` |
| `getApprovalProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getInputProps` | `() => T['element']` |
| `getOutputProps` | `() => T['element']` |
| `getErrorProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `tool-call.kbd.toggle` |
| `Enter` / `Space` | `tool-call.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-describedby` | id of the `error` part \| undefined |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `indicator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | id of the `trigger` part |
| `content` | `role` | 'region' |

## Style reference

### Skin

`@xihan-ui/styles/tool-call.css` is written against `[data-scope="tool-call"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-tool-call` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-errored` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-settled` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'disclosure-trigger' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `indicator` | `data-instant` | '' (present only while the condition holds) |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `label` | `data-state` | props.phase |
| `summary` | `data-state` | props.phase |
| `status` | `data-state` | props.phase |
| `status` | `data-tone` | statusTone(phase) |
| `duration` | `data-loading` | '' (present only while the condition holds) |
| `duration` | `data-state` | props.phase |
| `approval` | `data-state` | props.phase |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-state` | 'open' \| 'closed' |
| `input` | `data-state` | props.phase |
| `output` | `data-state` | props.phase |
| `error` | `data-state` | props.phase |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-tool-call-bg` | `root` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-tool-call-border` | `root` | `border` | `default` | `--xh-border-default` |
| `--xh-tool-call-border-error` | `root` | `border-color` | `errored`<br>`has([data-scope='tool-call'][data-state='output-error'])`<br>`state=output-error` | `--xh-border-invalid` |
| `--xh-tool-call-content-gap` | `content` | `gap` | `default` | `--xh-space-2` |
| `--xh-tool-call-divider` | `approval`<br>`content` | `border-block-start` | `default` | `--xh-border-subtle` |
| `--xh-tool-call-duration-fg` | `duration` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-tool-call-error-fg` | `error` | `color` | `default` | `--xh-fg-danger` |
| `--xh-tool-call-font-size` | `trigger` | `font-size` | `default` | `--xh-_tool-call-font-size` |
| `--xh-tool-call-icon-size` | `root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` |
| `--xh-tool-call-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-tool-call-label-font` | `label`<br>`summary` | `font-family` | `default` | `--xh-font-family-mono` |
| `--xh-tool-call-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-tool-call-px` | `approval`<br>`content`<br>`trigger` | `padding-inline` | `default` | `--xh-_tool-call-px` |
| `--xh-tool-call-py` | `approval`<br>`content`<br>`trigger` | `padding-block`<br>`padding-block-end`<br>`padding-block-start` | `@keyframes xh-disclosure-collapse`<br>`@keyframes xh-disclosure-expand`<br>`default`<br>`xh-action-profile=disclosure-trigger` | `--xh-_tool-call-py` |
| `--xh-tool-call-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-tool-call-shadow` | `root` | `box-shadow` | `default`<br>`tone` | `0 0 0 transparent`<br>`none` |
| `--xh-tool-call-shimmer-duration` | `root`<br>`status` | `animation` | `loading` | `--xh-motion-loop-shimmer` |
| `--xh-tool-call-status-bg-approval` | `status` | `background` | `state=awaiting-approval` | `--xh-_tone-subtle` |
| `--xh-tool-call-status-bg-done` | `status` | `background` | `state=output-available` | `--xh-_tone-subtle` |
| `--xh-tool-call-status-bg-error` | `status` | `background` | `state=output-error` | `--xh-_tone-subtle` |
| `--xh-tool-call-status-fg` | `root`<br>`status` | `color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`loading`<br>`motion=reduce`<br>`where([data-motion='reduce'])` | `--xh-fg-muted` |
| `--xh-tool-call-status-fg-approval` | `status` | `color` | `state=awaiting-approval` | `--xh-_tone-fg` |
| `--xh-tool-call-status-fg-done` | `status` | `color` | `state=output-available` | `--xh-_tone-fg` |
| `--xh-tool-call-status-fg-error` | `status` | `color` | `state=output-error` | `--xh-_tone-fg` |
| `--xh-tool-call-status-font-size` | `duration`<br>`error`<br>`status` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-tool-call-status-h` | `status` | `min-block-size` | `tone` | `--xh-chip-h-sm` |
| `--xh-tool-call-status-px` | `status` | `padding-inline` | `tone` | `--xh-space-1_5` |
| `--xh-tool-call-status-py` | `status` | `padding-block` | `tone` | `0` |
| `--xh-tool-call-status-radius` | `status` | `border-radius` | `tone` | `--xh-shape-control` |
| `--xh-tool-call-status-shimmer-base` | `root`<br>`status` | `background-image` | `loading` | `--xh-fg-subtle` |
| `--xh-tool-call-status-shimmer-sheen` | `root`<br>`status` | `background-image` | `loading` | `--xh-fg-default` |
| `--xh-tool-call-summary-bg` | `summary` | `background` | `default` | `--xh-bg-subtle` |
| `--xh-tool-call-summary-fg` | `summary` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tool-call-summary-font-size` | `summary` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-tool-call-summary-px` | `summary` | `padding-inline` | `default` | `--xh-space-1_5` |
| `--xh-tool-call-summary-radius` | `summary` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-tool-call-tone-bar` | `root` | `box-shadow` | `tone` | `--xh-stroke-thick` |
| `--xh-tool-call-tone-fg` | `root` | `box-shadow` | `tone` | `--xh-_tone-soft` |
| `--xh-tool-call-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-tool-call-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` |
| `--xh-tool-call-trigger-gap` | `trigger` | `gap` | `default` | `--xh-space-2` |
| `--xh-tool-call-trigger-radius` | `root`<br>`trigger` | `border-radius` | `variant=ghost` | `--xh-shape-control` |
