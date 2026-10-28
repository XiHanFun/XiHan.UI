# Tooltip

Overlays component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/tooltip).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tooltip" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tooltip.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tooltip" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tooltip" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tooltip.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="tooltip"`: **`trigger`** · `positioner` · **`content`** · `text` · `shortcut` · `arrow`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-tooltip>` |
| Vue components | `XhTooltipArrow` `XhTooltipContent` `XhTooltipPositioner` `XhTooltipProvider` `XhTooltipRoot` `XhTooltipShortcut` `XhTooltipText` `XhTooltipTrigger` |
| Composable | `useTooltip` |
| State machine | `tooltipMachine` |
| Skin | `@xihan-ui/styles/tooltip.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `placement` | `Placement` |  |
| `dir` | `Direction` |  |
| `offset` | `number` |  |
| `openDelay` | `number` |  |
| `closeDelay` | `number` |  |
| `skipDelayDuration` | `number` |  |
| `disabled` | `boolean` |  |
| `followCursor` | `boolean` |  |
| `delegate` | `string` |  |
| `platform` | `KbdPlatform` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<TooltipTranslations>` |  |
| `onOpenChange` | `(details: TooltipOpenChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `TooltipOpenChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTooltipRoot` | `default` | `TooltipRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTooltipPositioner` | `container` | `() => Element \| null` |  |
| `XhTooltipProvider` | `openDelay` | `number` |  |
| `XhTooltipProvider` | `closeDelay` | `number` |  |
| `XhTooltipProvider` | `skipDelayDuration` | `number` |  |
| `XhTooltipProvider` | `children` | `ReactNode` |  |
| `XhTooltipRoot` | `children` | `SlotChildren<TooltipRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `closed` · `opening` · `visible` · `visible.open` · `visible.closing`

**Events**: `POINTER.ENTER` · `POINTER.MOVE` · `POINTER.LEAVE` · `POINTER.DOWN` · `FOCUS` · `BLUR` · `ESCAPE` · `OPEN` · `CLOSE` · `after.openDelay` · `after.closeDelay` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**Guards**: `isOpenControlled` · `isDisabled` · `isFocusOpened` · `hasAnchor`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `delegated` | `boolean` |
| `text` | `string` |
| `shortcut` | `string \| null` |
| `getTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getArrowProps` | `() => T['element']` |
| `getTextProps` | `() => T['element']` |
| `getShortcutProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `tooltip.kbd.tab` |
| `Escape` | `tooltip.kbd.escape` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-describedby` | id of the `content` part \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `role` | 'tooltip' |
| `shortcut` | `aria-hidden` | 'true' |
| `arrow` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/tooltip.css` is written against `[data-scope="tooltip"][data-part="trigger"]` part selectors; the published build uses the mount class `.xh-scope-tooltip` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `data-delegate` | '' |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-follow-cursor` | '' (present only while the condition holds) |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-tone` | props.tone |
| `content` | `data-xh-ink-surface` | '' (present only while the condition holds) |
| `arrow` | `data-placement` | actual placement computed by the positioning engine |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-tooltip-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` |
| `--xh-tooltip-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-compact-backdrop` |
| `--xh-tooltip-bg` | `arrow`<br>`content` | `--xh-ink-surface`<br>`background` | `default`<br>`xh-ink-surface` | `--xh-_tooltip-solid` |
| `--xh-tooltip-border` | `arrow`<br>`content` | `border` | `default` | `--xh-_tooltip-border` |
| `--xh-tooltip-fg` | `content` | `color` | `default` | `--xh-_tooltip-on` |
| `--xh-tooltip-font-size` | `content` | `font-size` | `default` | `--xh-_tooltip-font-size` |
| `--xh-tooltip-highlight` | `content` | `box-shadow` | `default` | `transparent` |
| `--xh-tooltip-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-tooltip-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` |
| `--xh-tooltip-px` | `content` | `padding-inline` | `default` | `--xh-_tooltip-px` |
| `--xh-tooltip-py` | `content` | `padding-block` | `default` | `--xh-_tooltip-py` |
| `--xh-tooltip-radius` | `content` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-tooltip-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-compact-shadow` |
| `--xh-tooltip-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-sm` |
