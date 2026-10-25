# Badge

Feedback component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/badge).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/badge" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/badge.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/badge" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/badge" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/badge.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="badge"`: **`root`** · **`indicator`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-badge>` |
| Vue components | `XhBadge` `XhBadgeIndicator` `XhBadgeRoot` |
| State machine | `badgeMachine` |
| Skin | `@xihan-ui/styles/badge.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `count` | `number` |  |
| `dot` | `boolean` |  |
| `label` | `string` |  |
| `max` | `number` |  |
| `placement` | `BadgePlacement` |  |
| `pulse` | `boolean` |  |
| `showZero` | `boolean` |  |
| `size` | `Size` |  |
| `tone` | `Tone` |  |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhBadge` | `default` | — |
| `XhBadgeIndicator` | `default` | `{ text: string }` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhBadgeIndicator` | `children` | `SlotChildren<BadgeIndicatorSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `indicator` | 'visible' \| 'hidden' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `INDICATOR.RENDERED`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `visible` | `boolean` |
| `text` | `string` |
| `getRootProps` | `() => T['element']` |
| `getIndicatorProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `indicator` | `aria-label` | props.label |
| `indicator` | `role` | 'status' \| undefined |

## Style reference

### Skin

`@xihan-ui/styles/badge.css` is written against `[data-scope="badge"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-badge` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-placement` | props.placement |
| `indicator` | `data-dot` | '' (present only while the condition holds) |
| `indicator` | `data-instant` | '' (present only while the condition holds) |
| `indicator` | `data-placement` | props.placement |
| `indicator` | `data-pulse` | '' (present only while the condition holds) |
| `indicator` | `data-size` | props.size |
| `indicator` | `data-state` | 'visible' \| 'hidden' |
| `indicator` | `data-tone` | props.tone |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-badge-bg` | `indicator` | `background` | `default` | `--xh-_tone` |
| `--xh-badge-dot-radius` | `indicator` | `border-radius` | `dot` | `--xh-shape-circle` |
| `--xh-badge-dot-size` | `indicator` | `block-size`<br>`inline-size`<br>`min-inline-size` | `dot` | `--xh-_badge-dot` |
| `--xh-badge-fg` | `indicator` | `color` | `default` | `--xh-_tone-on` |
| `--xh-badge-font-size` | `indicator` | `font-size` | `default` | `--xh-_badge-font` |
| `--xh-badge-font-weight` | `indicator` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-badge-min-size` | `indicator` | `block-size`<br>`min-inline-size` | `default` | `--xh-_badge-min` |
| `--xh-badge-offset-block` | `indicator` | `inset-block-end`<br>`inset-block-start` | `placement=bottom-end`<br>`placement=bottom-start`<br>`placement=top-end`<br>`placement=top-start` | `--xh-space-0` |
| `--xh-badge-offset-inline` | `indicator` | `inset-inline-end`<br>`inset-inline-start` | `placement=bottom-end`<br>`placement=bottom-start`<br>`placement=top-end`<br>`placement=top-start` | `--xh-space-0` |
| `--xh-badge-px` | `indicator` | `padding-inline` | `default` | `--xh-_badge-px` |
| `--xh-badge-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-badge-ring` | `indicator` | `border` | `default` | `--xh-bg-surface` |
