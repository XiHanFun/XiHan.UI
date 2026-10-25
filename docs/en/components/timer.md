# Timer

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/timer).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/timer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/timer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/timer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/timer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/timer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="timer"`: **`root`** · **`display`** · `item` · `separator` · `control`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-timer>` |
| Vue components | `XhTimerControl` `XhTimerDisplay` `XhTimerItem` `XhTimerRoot` `XhTimerSeparator` |
| Composable | `useTimer` |
| State machine | `timerMachine` |
| Skin | `@xihan-ui/styles/timer.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `startMs` | `number` |  |
| `targetMs` | `number` |  |
| `countdown` | `boolean` |  |
| `value` | `number` |  |
| `active` | `boolean` |  |
| `autoStart` | `boolean` |  |
| `interval` | `number` |  |
| `format` | `string` |  |
| `precision` | `number` |  |
| `live` | `TimerLive` |  |
| `size` | `Size` |  |
| `translations` | `Partial<TimerTranslations>` |  |
| `onTick` | `(details: TimerTickDetails) => void` |  |
| `onComplete` | `(details: TimerCompleteDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `tick` | `TimerTickDetails` |
| `complete` | `TimerCompleteDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTimerRoot` | `default` | `TimerRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTimerItem` | `unit` | `TimerUnit` | Yes |
| `XhTimerRoot` | `children` | `SlotChildren<TimerRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'idle' \| 'running' \| 'paused' \| 'completed' |
| `display` | 'idle' \| 'running' \| 'paused' \| 'completed' |

The following names are internal to the state machine.

**States**: `idle` · `running` · `paused` · `completed`

**Events**: `RUN.START` · `RUN.PAUSE` · `RUN.RESUME` · `RUN.RESET` · `CLOCK.TICK` · `CLOCK.SETTLE` · `CLOCK.SYNC` · `PRESS.START` · `PRESS.END`

**Guards**: `isSettled`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `phase` | `TimerPhase` |
| `value` | `number` |
| `text` | `string` |
| `controlled` | `boolean` |
| `elapsed` | `number` |
| `running` | `boolean` |
| `paused` | `boolean` |
| `completed` | `boolean` |
| `countdown` | `boolean` |
| `segments` | `TimerSegments` |
| `segmentText` | `(unit: TimerUnit) => string` |
| `controlAction` | `TimerControlAction` |
| `controlLabel` | `string` |
| `start` | `() => void` |
| `pause` | `() => void` |
| `resume` | `() => void` |
| `reset` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getDisplayProps` | `() => T['element']` |
| `getItemProps` | `(props: TimerItemProps) => T['element']` |
| `getSeparatorProps` | `() => T['element']` |
| `getControlProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `timer.kbd.control` |
| `Enter` / `Space` | `timer.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `display` | `aria-label` | label.time(segments) |
| `display` | `aria-live` | props.live |
| `display` | `role` | 'timer' |
| `item` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `control` | `aria-label` | label[controlAction] |

## Style reference

### Skin

`@xihan-ui/styles/timer.css` is written against `[data-scope="timer"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-timer` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-controlled` | '' (present only while the condition holds) |
| `root` | `data-countdown` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'running' \| 'paused' \| 'completed' |
| `display` | `data-state` | 'idle' \| 'running' \| 'paused' \| 'completed' |
| `item` | `data-unit` | item.unit |
| `control` | `data-action` | 'pause' \| 'resume' \| 'reset' \| 'start' |
| `control` | `data-pressed` | '' (present only while the condition holds) |
| `control` | `data-xh-action-control` | '' |
| `control` | `data-xh-action-display` | 'always' |
| `control` | `data-xh-action-profile` | 'text' |
| `control` | `data-xh-action-size` | props.size |
| `control` | `data-xh-action-variant` | 'outline' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-timer-completed-fg` | `display` | `color` | `state=completed` | `--xh-fg-muted` |
| `--xh-timer-control-bg` | `control` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-timer-control-bg-active` | `control` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-timer-control-bg-disabled` | `control` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled` |
| `--xh-timer-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-timer-control-border` | `control` | `border` | `default` | `--xh-_action-variant-border-rest` |
| `--xh-timer-control-border-disabled` | `control` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` |
| `--xh-timer-control-border-focus` | `control` | `border-color` | `focus-visible` | `--xh-_action-variant-border-focus-visible` |
| `--xh-timer-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` |
| `--xh-timer-control-fg` | `control` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-timer-control-gap` | `control` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-timer-control-h` | `control` | `block-size` | `default` | `--xh-_action-profile-visual-size` |
| `--xh-timer-control-px` | `control` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-timer-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-timer-control-shadow-active` | `control` | `box-shadow` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` |
| `--xh-timer-control-shadow-hover` | `control` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` |
| `--xh-timer-digit-font-size` | `display` | `font-size` | `default` | `--xh-_timer-digit-size` |
| `--xh-timer-display-fg` | `display` | `color` | `default` | `--xh-fg-default` |
| `--xh-timer-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-timer-gap` | `root` | `gap` | `default` | `--xh-_timer-gap` |
| `--xh-timer-icon-size` | `control` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-timer-item-fg` | `item` | `color` | `default` | `inherit` |
| `--xh-timer-separator-fg` | `separator` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-timer-separator-px` | `separator` | `padding-inline` | `default` | `--xh-space-0_5` |
