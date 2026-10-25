# Reasoning <Badge type="info" text="alpha" />

AI chat component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/reasoning).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/reasoning" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/reasoning.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/reasoning" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/reasoning" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/reasoning.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="reasoning"`: **`root`** · **`trigger`** · `icon` · `indicator` · `label` · `duration` · **`content`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-reasoning>` |
| Vue components | `XhReasoningContent` `XhReasoningDuration` `XhReasoningIcon` `XhReasoningIndicator` `XhReasoningLabel` `XhReasoningRoot` `XhReasoningTrigger` |
| Composable | `useReasoning` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/reasoning.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `autoDisclosure` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `disabled` | `boolean` |  |
| `endTime` | `number` |  |
| `onOpenChange` | `(details: ToolCallOpenChangeDetails) => void` |  |
| `open` | `boolean` |  |
| `size` | `Size` |  |
| `startTime` | `number` |  |
| `streaming` | `boolean` |  |
| `tone` | `Tone` |  |
| `translations` | `Partial<ReasoningTranslations>` |  |
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
| `XhReasoningRoot` | `default` | `ReasoningRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhReasoningRoot` | `children` | `SlotChildren<ReasoningRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `streaming` | `boolean` |
| `disabled` | `boolean` |
| `durationMs` | `number \| undefined` |
| `elapsedMs` | `number \| undefined` |
| `statusText` | `string` |
| `setOpen` | `(next: boolean) => void` |
| `getRootProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getIconProps` | `() => T['element']` |
| `getIndicatorProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getDurationProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `reasoning.kbd.toggle` |
| `Enter` / `Space` | `reasoning.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `icon` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | id of the `trigger` part |
| `content` | `role` | 'region' |

## Style reference

### Skin

`@xihan-ui/styles/reasoning.css` is written against `[data-scope="reasoning"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-reasoning` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-streaming` | '' (present only while the condition holds) |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-streaming` | '' (present only while the condition holds) |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'disclosure-trigger' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `icon` | `data-streaming` | '' (present only while the condition holds) |
| `indicator` | `data-instant` | '' (present only while the condition holds) |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `label` | `data-instant` | '' (present only while the condition holds) |
| `label` | `data-streaming` | '' (present only while the condition holds) |
| `duration` | `data-instant` | '' (present only while the condition holds) |
| `duration` | `data-streaming` | '' (present only while the condition holds) |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-state` | 'open' \| 'closed' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-reasoning-bg` | `root` | `background` | `default`<br>`variant=outline`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-reasoning-border` | `root` | `border` | `default`<br>`variant=outline` | `--xh-border-default` |
| `--xh-reasoning-content-fg` | `content` | `color` | `default` | `--xh-fg-muted` |
| `--xh-reasoning-content-font-size` | `content` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-reasoning-content-leading` | `content` | `line-height` | `default` | `--xh-text-prose-leading` |
| `--xh-reasoning-content-pe` | `content` | `padding-inline-end` | `default` | `--xh-reasoning-px` |
| `--xh-reasoning-content-ps` | `content` | `padding-inline-start` | `default` | `--xh-space-3` |
| `--xh-reasoning-duration-fg` | `duration` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-reasoning-duration-font-size` | `duration` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-reasoning-font-size` | `trigger` | `font-size` | `default` | `--xh-_reasoning-font-size` |
| `--xh-reasoning-icon-fg` | `icon` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-reasoning-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_reasoning-icon-size` |
| `--xh-reasoning-icon-streaming-fg` | `icon` | `color` | `streaming` | `--xh-fg-muted` |
| `--xh-reasoning-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-reasoning-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-reasoning-label-streaming-fg` | `label` | `color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`motion=reduce`<br>`streaming`<br>`where([data-motion='reduce'])` | `--xh-fg-default` |
| `--xh-reasoning-px` | `content`<br>`trigger` | `margin-inline-start`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-_reasoning-px` |
| `--xh-reasoning-py` | `content`<br>`trigger` | `padding-block`<br>`padding-block-end` | `@keyframes xh-disclosure-collapse`<br>`@keyframes xh-disclosure-expand`<br>`default`<br>`xh-action-profile=disclosure-trigger` | `--xh-_reasoning-py` |
| `--xh-reasoning-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-reasoning-rail` | `content` | `border-inline-start` | `default` | `--xh-border-subtle` |
| `--xh-reasoning-rail-inset` | `content` | `margin-inline-start` | `default` | `--xh-reasoning-px` |
| `--xh-reasoning-rail-width` | `content` | `border-inline-start` | `default` | `--xh-stroke-thin` |
| `--xh-reasoning-shadow` | `root` | `box-shadow` | `default`<br>`tone` | `0 0 0 transparent`<br>`none` |
| `--xh-reasoning-shimmer-duration` | `label` | `animation` | `streaming` | `--xh-motion-loop-shimmer` |
| `--xh-reasoning-shimmer-from` | `label` | `background-image` | `streaming` | `--xh-fg-subtle` |
| `--xh-reasoning-shimmer-to` | `label` | `background-image` | `streaming` | `--xh-fg-default` |
| `--xh-reasoning-tone-bar` | `root` | `box-shadow` | `tone` | `--xh-stroke-thick` |
| `--xh-reasoning-tone-fg` | `root` | `box-shadow` | `tone` | `--xh-_tone-soft` |
| `--xh-reasoning-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-reasoning-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-muted` |
| `--xh-reasoning-trigger-gap` | `trigger` | `gap` | `default` | `--xh-space-2` |
| `--xh-reasoning-trigger-radius` | `root`<br>`trigger` | `border-radius` | `variant=ghost` | `--xh-shape-control` |
