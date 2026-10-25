# HoverCard

Overlays component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/hover-card).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/hover-card" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/hover-card.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/hover-card" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/hover-card" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/hover-card.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="hover-card"`: `root` · **`trigger`** · `positioner` · **`content`** · `title` · `description` · `arrow`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-hover-card>` |
| Vue components | `XhHoverCardArrow` `XhHoverCardContent` `XhHoverCardDescription` `XhHoverCardPositioner` `XhHoverCardRoot` `XhHoverCardTitle` `XhHoverCardTrigger` |
| Composable | `useHoverCard` |
| State machine | `hoverCardMachine` |
| Skin | `@xihan-ui/styles/hover-card.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `placement` | `Placement` |  |
| `offset` | `number` |  |
| `openDelay` | `number` |  |
| `closeDelay` | `number` |  |
| `dir` | `Direction` |  |
| `parts` | `TitleDescriptionParts` |  |
| `disabled` | `boolean` |  |
| `size` | `Size` |  |
| `onOpenChange` | `(details: HoverCardOpenChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `HoverCardOpenChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhHoverCardRoot` | `default` | `HoverCardRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhHoverCardPositioner` | `container` | `() => Element \| null` |  |
| `XhHoverCardRoot` | `children` | `SlotChildren<HoverCardRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `closed` · `opening` · `visible` · `visible.open` · `visible.closing`

**Events**: `POINTER.ENTER` · `POINTER.LEAVE` · `FOCUS` · `BLUR` · `ESCAPE` · `OPEN` · `CLOSE` · `after.openDelay` · `after.closeDelay` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**Guards**: `isOpenControlled` · `isDisabled` · `isFocusHeld`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `getRootProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getArrowProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `hover-card.kbd.focus-trigger` |
| `Escape` | `hover-card.kbd.escape` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | id of the `description` part \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | id of the `title` part \| id of the `trigger` part |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `arrow` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/hover-card.css` is written against `[data-scope="hover-card"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-hover-card` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-placement` | actual placement computed by the positioning engine |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-xh-material` | 'frosted' |
| `arrow` | `data-placement` | actual placement computed by the positioning engine |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-hover-card-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` |
| `--xh-hover-card-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` |
| `--xh-hover-card-bg` | `arrow`<br>`content` | `background` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg`<br>`--xh-material-frosted-bg` |
| `--xh-hover-card-border` | `arrow`<br>`content` | `border` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border`<br>`--xh-material-frosted-border` |
| `--xh-hover-card-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-hover-card-description-font-size` | `description` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-hover-card-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-hover-card-gap` | `content` | `gap` | `default` | `--xh-space-1` |
| `--xh-hover-card-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-hover-card-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` |
| `--xh-hover-card-max-w` | `content` | `max-inline-size` | `default` | `--xh-_hover-card-max-w` |
| `--xh-hover-card-px` | `content` | `padding-inline` | `default` | `--xh-_hover-card-px` |
| `--xh-hover-card-py` | `content` | `padding-block` | `default` | `--xh-_hover-card-py` |
| `--xh-hover-card-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-hover-card-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-hover-card-title-fg` | `title` | `color` | `default` | `--xh-fg-default` |
| `--xh-hover-card-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-hover-card-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-hover-card-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-sm` |
