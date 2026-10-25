# Notification

Feedback component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/notification).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/notification" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/notification.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/notification" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/notification" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/notification.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="notification"`: **`root`** · **`group`** · `item` · `item-indicator` · `item-content` · `item-title` · `item-description` · `item-action-trigger` · `item-progress` · `item-close-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-notification>` |
| Vue components | `XhNotificationGroup` `XhNotificationItem` `XhNotificationItemActionTrigger` `XhNotificationItemCloseTrigger` `XhNotificationItemContent` `XhNotificationItemDescription` `XhNotificationItemIndicator` `XhNotificationItemProgress` `XhNotificationItemTitle` `XhNotificationRoot` |
| Composable | `useNotification` |
| State machine | `notificationMachine` |
| Skin | `@xihan-ui/styles/notification.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `items` | `NotificationRecord[]` |  |
| `defaultItems` | `NotificationRecord[]` |  |
| `preset` | `NotificationPreset` |  |
| `placement` | `NotificationPlacement` |  |
| `max` | `number` |  |
| `dedupe` | `NotificationDedupe` |  |
| `gap` | `number` |  |
| `duration` | `number` |  |
| `stacked` | `boolean` |  |
| `pauseOnPageIdle` | `boolean` |  |
| `translations` | `Partial<NotificationTranslations>` |  |
| `onItemsChange` | `(details: NotificationItemsChangeDetails) => void` |  |

### NotificationRecord

Elements of `items`.

| Field | Type | Required |
| --- | --- | --- |
| `id` | `string` | Yes |
| `title` | `string` |  |
| `description` | `string` |  |
| `tone` | `NotificationTone` |  |
| `loading` | `boolean` |  |
| `duration` | `number` |  |
| `closable` | `boolean` |  |
| `placement` | `NotificationPlacement` |  |
| `actionLabel` | `string` |  |
| `priority` | `number` |  |
| `count` | `number` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `items-change` | `NotificationItemsChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhNotificationGroup` | `default` | `NotificationGroupSlotProps` |
| `XhNotificationItem` | `default` | `NotificationItemSlotProps` |
| `XhNotificationRoot` | `default` | `NotificationRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhNotificationGroup` | `placement` | `NotificationPlacement` |  |
| `XhNotificationGroup` | `children` | `SlotChildren<NotificationGroupSlotProps>` |  |
| `XhNotificationItem` | `id` | `string` |  |
| `XhNotificationItem` | `preset` | `NotificationPreset` |  |
| `XhNotificationItem` | `title` | `string` |  |
| `XhNotificationItem` | `description` | `string` |  |
| `XhNotificationItem` | `tone` | `NotificationTone` |  |
| `XhNotificationItem` | `loading` | `boolean` |  |
| `XhNotificationItem` | `duration` | `number` |  |
| `XhNotificationItem` | `closable` | `boolean` |  |
| `XhNotificationItem` | `pauseOnPageIdle` | `boolean` |  |
| `XhNotificationItem` | `paused` | `boolean` |  |
| `XhNotificationItem` | `translations` | `NotificationItemProps['translations']` |  |
| `XhNotificationItem` | `onStatusChange` | `NotificationItemProps['onStatusChange']` |  |
| `XhNotificationItem` | `onAction` | `NotificationItemProps['onAction']` |  |
| `XhNotificationItem` | `children` | `SlotChildren<NotificationItemSlotProps>` |  |
| `XhNotificationRoot` | `children` | `SlotChildren<NotificationRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `item` | toStatus(state.get()) |
| `item-progress` | toStatus(state.get()) |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `ITEMS.CREATE` · `ITEMS.UPDATE` · `ITEMS.DISMISS` · `ITEMS.DISMISS_ALL` · `STACK.EXPAND` · `STACK.COLLAPSE`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `preset` | `NotificationPreset` |
| `stacked` | `boolean` |
| `visibleNotifications` | `ResolvedNotification[]` |
| `placements` | `NotificationPlacement[]` |
| `count` | `number` |
| `getItemsByPlacement` | `(placement: NotificationPlacement) => ResolvedNotification[]` |
| `create` | `(options?: NotificationOptions) => string` |
| `update` | `(id: string, options: Partial<NotificationOptions>) => void` |
| `dismiss` | `(id: string) => void` |
| `dismissAll` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getGroupProps` | `(props?: NotificationGroupProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `notification.kbd.close` |
| `Enter` / `Space` | `notification.kbd.action` |
| `Enter` / `Space` | `notification.kbd.press` |
| `Escape` | `notification.kbd.collapse` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `group` | `aria-label` | translations.region |
| `group` | `role` | 'region' |
| `item` | `aria-atomic` | 'true' |
| `item` | `aria-describedby` | id of the `description` part \| undefined |
| `item` | `aria-labelledby` | id of the `title` part \| undefined |
| `item` | `aria-live` | 'assertive' \| 'polite' |
| `item` | `role` | 'alert' \| 'status' |
| `item-indicator` | `aria-hidden` | 'true' |
| `item-progress` | `aria-hidden` | 'true' |
| `item-close-trigger` | `aria-label` | translations.close |

## Style reference

### Skin

`@xihan-ui/styles/notification.css` is written against `[data-scope="notification"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-notification` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-count` | list.length |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `group` | `data-count` | group.length |
| `group` | `data-empty` | '' (present only while the condition holds) |
| `group` | `data-expanded` | '' (present only while the condition holds) |
| `group` | `data-placement` | props.placement |
| `group` | `data-preset` | props.preset |
| `group` | `data-stacked` | '' (present only while the condition holds) |
| `item` | `data-loading` | '' (present only while the condition holds) |
| `item` | `data-paused` | '' (present only while the condition holds) |
| `item` | `data-preset` | props.preset |
| `item` | `data-state` | toStatus(state.get()) |
| `item` | `data-tone` | props.tone |
| `item` | `data-xh-loading-ring` | '' |
| `item-indicator` | `data-loading` | '' (present only while the condition holds) |
| `item-indicator` | `data-xh-loading-ring` | '' |
| `item-action-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `item-action-trigger` | `data-xh-action-control` | '' |
| `item-action-trigger` | `data-xh-action-display` | 'always' |
| `item-action-trigger` | `data-xh-action-profile` | 'text' |
| `item-action-trigger` | `data-xh-action-size` | 'sm' |
| `item-action-trigger` | `data-xh-action-variant` | 'outline' |
| `item-progress` | `data-state` | toStatus(state.get()) |
| `item-close-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `item-close-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `item-close-trigger` | `data-xh-action-control` | '' |
| `item-close-trigger` | `data-xh-action-display` | 'always' |
| `item-close-trigger` | `data-xh-action-profile` | 'icon' |
| `item-close-trigger` | `data-xh-action-size` | 'xs' \| 'sm' |
| `item-close-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-notification-action-bg` | `item-action-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `transparent` |
| `--xh-notification-action-bg-active` | `item-action-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-notification-action-bg-hover` | `item-action-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` |
| `--xh-notification-action-border` | `item-action-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-control`<br>`--xh-border-control-hover` |
| `--xh-notification-action-fg` | `item-action-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-notification-action-font-weight` | `item-action-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-notification-action-h` | `item-action-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-notification-action-px` | `item-action-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-notification-action-radius` | `item-action-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-notification-close-bg` | `item-close-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-notification-close-bg-active` | `item-close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-notification-close-bg-hover` | `item-close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-notification-close-border` | `item-close-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` |
| `--xh-notification-close-fg` | `item-close-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-notification-close-fg-hover` | `item-close-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-notification-close-inset` | `item`<br>`item-close-trigger`<br>`item-title` | `inset-block-start`<br>`inset-inline-end`<br>`padding-inline-end` | `has([data-part='item-close-trigger'])`<br>`preset=card` | `--xh-notification-item-py`<br>`--xh-surface-action-inset` |
| `--xh-notification-close-radius` | `item-close-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-notification-close-size` | `item`<br>`item-close-trigger`<br>`item-title` | `block-size`<br>`inline-size`<br>`inset-block-start`<br>`min-inline-size`<br>`padding-inline-end` | `default`<br>`has([data-part='item-close-trigger'])`<br>`preset=card`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` |
| `--xh-notification-description-fg` | `item`<br>`item-description` | `color` | `default`<br>`preset=toast` | `--xh-fg-default`<br>`--xh-fg-muted` |
| `--xh-notification-description-font-size` | `item`<br>`item-description` | `font-size` | `default`<br>`preset=toast` | `--xh-text-body-size`<br>`--xh-text-secondary-size` |
| `--xh-notification-description-leading` | `item`<br>`item-description` | `line-height` | `preset=toast` | `--xh-leading-normal` |
| `--xh-notification-description-max-h` | `item-description` | `max-block-size` | `default` | `--xh-viewport-h-md` |
| `--xh-notification-icon-size` | `item`<br>`item-action-trigger`<br>`item-close-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-xs` |
| `--xh-notification-indicator-fg` | `item`<br>`item-indicator` | `background-color`<br>`border`<br>`border-color`<br>`color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`motion=reduce`<br>`preset=toast`<br>`where([data-motion='reduce'])`<br>`xh-loading-ring`<br>`xh-loading-ring=overlay` | `--xh-_tone-fg` |
| `--xh-notification-indicator-p` | `item`<br>`item-indicator` | `padding` | `preset=toast` | `--xh-space-1` |
| `--xh-notification-indicator-size` | `item`<br>`item-indicator` | `--xh-icon-size`<br>`inline-size` | `default`<br>`preset=toast` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md` |
| `--xh-notification-inset` | `group` | `inset-block-end`<br>`inset-block-start`<br>`inset-inline-end`<br>`inset-inline-start`<br>`padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default`<br>`not([data-stacked])`<br>`placement=-end`<br>`placement=-start`<br>`placement=bottom`<br>`placement=top`<br>`preset=toast`<br>`stacked` | `--xh-space-4`<br>`--xh-space-6` |
| `--xh-notification-item-bg` | `item` | `background` | `default` | `--xh-material-elevated-bg` |
| `--xh-notification-item-border` | `item` | `border` | `default` | `--xh-material-elevated-border` |
| `--xh-notification-item-fg` | `item` | `color` | `default` | `--xh-material-elevated-fg` |
| `--xh-notification-item-font-size` | `item` | `font-size` | `default`<br>`preset=toast` | `--xh-text-body-size`<br>`--xh-text-label-size` |
| `--xh-notification-item-gap` | `item` | `column-gap` | `default`<br>`preset=toast` | `--xh-space-2`<br>`--xh-space-3` |
| `--xh-notification-item-leading` | `item` | `line-height` | `default` | `--xh-text-body-leading` |
| `--xh-notification-item-px` | `item` | `inset-inline-start`<br>`padding-inline` | `default`<br>`preset=toast` | `--xh-overlay-notification-p`<br>`--xh-space-4` |
| `--xh-notification-item-py` | `item`<br>`item-close-trigger` | `inset-block-start`<br>`padding-block` | `default`<br>`preset=card`<br>`preset=toast` | `--xh-overlay-notification-p`<br>`--xh-space-2_5` |
| `--xh-notification-item-radius` | `item` | `border-radius` | `default`<br>`preset=toast` | `--xh-shape-control`<br>`--xh-shape-overlay` |
| `--xh-notification-item-row-gap` | `item`<br>`item-content` | `row-gap` | `default` | `--xh-space-2` |
| `--xh-notification-item-shadow` | `item` | `box-shadow` | `default` | `--xh-material-elevated-shadow` |
| `--xh-notification-item-w` | `group`<br>`item` | `inline-size` | `default`<br>`preset=toast`<br>`stacked` | `--xh-overlay-notification-w`<br>`--xh-overlay-toast-w` |
| `--xh-notification-layer` | `group` | `z-index` | `default` | `--xh-layer-toast` |
| `--xh-notification-progress-bg` | `item-progress` | `background` | `default` | `--xh-_tone-soft` |
| `--xh-notification-progress-duration` | `item-progress` | `animation` | `default` | `--xh-motion-duration-slide` |
| `--xh-notification-progress-radius` | `item`<br>`item-progress` | `border-radius`<br>`clip-path` | `@keyframes xh-countdown`<br>`preset=card` | `--xh-shape-pill` |
| `--xh-notification-progress-thickness` | `item-progress` | `block-size` | `default` | `--xh-space-0_5` |
| `--xh-notification-stack-scale` | `*`<br>`group`<br>`item` | `scale` | `@keyframes xh-notification-stack-in`<br>`@keyframes xh-notification-stack-out`<br>`preset=toast`<br>`stacked` | `--xh-_notification-stack-scale` |
| `--xh-notification-title-fg` | `item`<br>`item-title` | `color` | `default`<br>`preset=toast` | `--xh-_tone-fg`<br>`--xh-fg-default` |
| `--xh-notification-title-font-size` | `item`<br>`item-close-trigger`<br>`item-indicator`<br>`item-title` | `block-size`<br>`font-size`<br>`inset-block-start` | `default`<br>`preset=card`<br>`preset=toast` | `--xh-text-body-size`<br>`--xh-text-heading-3-size` |
| `--xh-notification-title-font-weight` | `item`<br>`item-title` | `font-weight` | `default`<br>`preset=toast` | `--xh-font-weight-medium`<br>`--xh-text-heading-3-weight` |
| `--xh-notification-title-leading` | `item`<br>`item-close-trigger`<br>`item-title` | `inset-block-start`<br>`line-height` | `default`<br>`preset=card`<br>`preset=toast` | `--xh-leading-normal`<br>`--xh-leading-tight` |
