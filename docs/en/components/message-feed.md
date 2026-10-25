# MessageFeed <Badge type="info" text="alpha" />

AI chat component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/message-feed).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/message-feed" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/message-feed.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/message-feed" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/message-feed" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/message-feed.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="message-feed"`: **`root`** · **`viewport`** · **`list`** · `item` · `item-label` · `separator` · `pending-indicator` · `scroll-to-end-trigger` · `unread-count` · `live-region`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-message-feed>` |
| Vue components | `XhMessageFeedItem` `XhMessageFeedItemLabel` `XhMessageFeedList` `XhMessageFeedLiveRegion` `XhMessageFeedPendingIndicator` `XhMessageFeedRoot` `XhMessageFeedScrollToEndTrigger` `XhMessageFeedSeparator` `XhMessageFeedUnreadCount` `XhMessageFeedViewport` |
| Composable | `useMessageFeed` |
| State machine | `messageFeedMachine` |
| Skin | `@xihan-ui/styles/message-feed.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `count` | `number` |  |
| `status` | `MessageFeedStatus` |  |
| `threshold` | `number` |  |
| `loop` | `boolean` |  |
| `size` | `Size` |  |
| `translations` | `Partial<MessageFeedTranslations>` |  |
| `onStickChange` | `(details: MessageFeedStickChangeDetails) => void` |  |
| `onItemFocus` | `(details: MessageFeedItemFocusDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `stick-change` | `MessageFeedStickChangeDetails` |
| `item-focus` | `MessageFeedItemFocusDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhMessageFeedRoot` | `default` | `MessageFeedRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhMessageFeedItem` | `itemId` | `string` | Yes |
| `XhMessageFeedItem` | `itemIndex` | `number \| string` | Yes |
| `XhMessageFeedItem` | `itemRole` | `MessageFeedItemRole` |  |
| `XhMessageFeedItem` | `itemStreaming` | `boolean` |  |
| `XhMessageFeedRoot` | `children` | `SlotChildren<MessageFeedRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | props.status |
| `pending-indicator` | props.status |
| `scroll-to-end-trigger` | 'hidden' \| 'visible' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `STICK.CHANGE` · `SCROLL_TO_BOTTOM` · `ITEM.FOCUS` · `FEED.BLUR` · `PRESS.START` · `PRESS.END` · `ARRIVALS.TRACKED` · `TRIGGER.RENDERED`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `status` | `MessageFeedStatus` |
| `atBottom` | `boolean` |
| `sticking` | `boolean` |
| `focusedId` | `string \| null` |
| `showScrollToEndTrigger` | `boolean` |
| `unreadCount` | `number` |
| `scrollToBottom` | `() => void` |
| `scrollToItem` | `(id: string) => void` |
| `focusItem` | `(id: string) => void` |
| `getRootProps` | `() => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getListProps` | `() => T['element']` |
| `getItemProps` | `(props: MessageFeedItemProps) => T['element']` |
| `getItemLabelProps` | `(props: Pick<MessageFeedItemProps, 'id'>) => T['element']` |
| `getScrollToEndTriggerProps` | `() => T['button']` |
| `getUnreadCountProps` | `() => T['element']` |
| `getSeparatorProps` | `() => T['element']` |
| `getPendingIndicatorProps` | `() => T['element']` |
| `getLiveRegionProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/feed/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `PageDown` | `message-feed.kbd.next` |
| `PageUp` | `message-feed.kbd.prev` |
| `Control+End` | `message-feed.kbd.exit-after` |
| `Control+Home` | `message-feed.kbd.exit-before` |
| `Tab` | `message-feed.kbd.tab` |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | `message-feed.kbd.scroll` |
| `Enter` / `Space` | `message-feed.kbd.scroll-to-end-trigger` |
| `Enter` / `Space` | `message-feed.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `list` | `aria-label` | translations.feed |
| `list` | `role` | 'feed' |
| `item` | `aria-label` | undefined \| itemLabel(item.index + 1, count ?? -1, item.role) |
| `item` | `aria-labelledby` | scope.partId('message-feed', `item-label:${item.id}`) \| undefined |
| `item` | `aria-posinset` | item.index + 1 |
| `item` | `aria-setsize` | props.count |
| `item` | `role` | 'article' |
| `separator` | `aria-hidden` | 'true' |
| `pending-indicator` | `aria-hidden` | 'true' |
| `scroll-to-end-trigger` | `aria-label` | translations.scrollToBottomUnread(unreadCount) \| translations.scrollToBottom |
| `unread-count` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |

## Style reference

### Skin

`@xihan-ui/styles/message-feed.css` is written against `[data-scope="message-feed"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-message-feed` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | props.status |
| `list` | `data-instant` | '' (present only while the condition holds) |
| `item` | `data-role` | item.role |
| `item` | `data-streaming` | '' (present only while the condition holds) |
| `pending-indicator` | `data-state` | props.status |
| `scroll-to-end-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `scroll-to-end-trigger` | `data-state` | 'hidden' \| 'visible' |
| `scroll-to-end-trigger` | `data-xh-action-control` | '' |
| `scroll-to-end-trigger` | `data-xh-action-display` | 'always' |
| `scroll-to-end-trigger` | `data-xh-action-profile` | 'floating' |
| `scroll-to-end-trigger` | `data-xh-action-size` | floatingSizeBelow(prop('size')) |
| `scroll-to-end-trigger` | `data-xh-action-variant` | 'ghost' |
| `scroll-to-end-trigger` | `data-xh-liquid` | '' |
| `scroll-to-end-trigger` | `data-xh-material` | 'frosted' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-message-feed-gap` | `list` | `gap` | `default` | `--xh-_message-feed-gap` |
| `--xh-message-feed-icon-size` | `scroll-to-end-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-message-feed-item-gap` | `item` | `gap` | `default` | `--xh-space-1` |
| `--xh-message-feed-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-message-feed-label-fg` | `item-label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-message-feed-label-font-size` | `item-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-message-feed-p` | `list`<br>`pending-indicator` | `margin-block-end`<br>`margin-inline-start`<br>`padding` | `default` | `--xh-_message-feed-p` |
| `--xh-message-feed-pending-indicator-color` | `pending-indicator` | `background` | `default` | `--xh-fg-muted` |
| `--xh-message-feed-pending-indicator-radius` | `pending-indicator` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-message-feed-pending-indicator-size` | `pending-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-space-2` |
| `--xh-message-feed-scroll-to-end-trigger-bg` | `scroll-to-end-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_material-bg`<br>`--xh-_material-bg-focus` |
| `--xh-message-feed-scroll-to-end-trigger-bg-hover` | `scroll-to-end-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_material-bg-hover` |
| `--xh-message-feed-scroll-to-end-trigger-border` | `scroll-to-end-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-border` |
| `--xh-message-feed-scroll-to-end-trigger-fg` | `scroll-to-end-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-fg` |
| `--xh-message-feed-scroll-to-end-trigger-inset` | `scroll-to-end-trigger` | `inset-block-end`<br>`inset-inline-end` | `default` | `--xh-space-4` |
| `--xh-message-feed-scroll-to-end-trigger-radius` | `scroll-to-end-trigger` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-message-feed-scroll-to-end-trigger-shadow` | `scroll-to-end-trigger` | `box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-shadow` |
| `--xh-message-feed-scroll-to-end-trigger-size` | `scroll-to-end-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=floating` | `--xh-_action-profile-visual-size` |
| `--xh-message-feed-separator-fg` | `separator` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-message-feed-separator-font-size` | `separator` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-message-feed-separator-gap` | `separator` | `gap` | `default` | `--xh-space-3` |
| `--xh-message-feed-separator-line` | `separator` | `border-block-start` | `default` | `--xh-border-subtle` |
| `--xh-message-feed-unread-count-bg` | `unread-count` | `background` | `default` | `--xh-bg-brand` |
| `--xh-message-feed-unread-count-fg` | `unread-count` | `color` | `default` | `--xh-fg-on-brand` |
| `--xh-message-feed-unread-count-font-size` | `unread-count` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-message-feed-unread-count-px` | `unread-count` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-message-feed-unread-count-radius` | `unread-count` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-message-feed-unread-count-size` | `unread-count` | `block-size`<br>`line-height`<br>`min-inline-size` | `default` | `--xh-space-4` |
