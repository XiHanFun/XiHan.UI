# Truncate

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/truncate).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/truncate" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/truncate.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/truncate" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/truncate" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/truncate.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="truncate"`: **`root`** · `trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-truncate>` |
| Vue components | `XhTruncate` |
| Composable | `useTruncate` |
| State machine | `truncateMachine` |
| Skin | `@xihan-ui/styles/truncate.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `lines` | `number` |  |
| `position` | `TruncatePosition` |  |
| `expandable` | `boolean` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `tooltip` | `boolean` |  |
| `onOpenChange` | `(details: TruncateOpenChangeDetails) => void` |  |
| `onOverflowChange` | `(details: TruncateOverflowChangeDetails) => void` |  |
| `translations` | `Partial<TruncateTranslations>` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `TruncateOpenChangeDetails` |
| `overflow-change` | `TruncateOverflowChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTruncate` | `default` | `TruncateSlotProps` |
| `XhTruncate` | `trigger` | `TruncateTriggerSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTruncate` | `trigger` | `SlotChildren<TruncateTriggerSlotProps>` |  |
| `XhTruncate` | `children` | `SlotChildren<TruncateSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' \| undefined |
| `trigger` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `closed` · `open`

**Events**: `MEASURE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**Guards**: `isOpenControlled`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `overflowing` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `measure` | `() => void` |
| `triggerLabel` | `string` |
| `getRootProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `truncate.kbd.toggle` |
| `Tab` / `Shift+Tab` | `truncate.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `root` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |

## Style reference

### Skin

`@xihan-ui/styles/truncate.css` is written against `[data-scope="truncate"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-truncate` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-expandable` | '' (present only while the condition holds) |
| `root` | `data-lines` | String(lines) |
| `root` | `data-middle-text` | context.get('text') \| undefined |
| `root` | `data-multiline` | '' (present only while the condition holds) |
| `root` | `data-overflowing` | '' (present only while the condition holds) |
| `root` | `data-position` | 'middle' \| undefined |
| `root` | `data-state` | 'open' \| 'closed' \| undefined |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'sm' |
| `trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-truncate-lines` | `root` | `-webkit-line-clamp` | `multiline` | `--xh-_truncate-lines` |
