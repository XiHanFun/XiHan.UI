# Tabs

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/tabs).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tabs" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tabs.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tabs" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tabs" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tabs.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="tabs"`: `root` · **`list`** · **`trigger`** · `close-trigger` · `indicator` · `separator` · `prev-trigger` · `next-trigger` · `overflow-trigger` · **`content`** · `tab-drag-trigger` · `live-region`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-tabs>` |
| Vue components | `XhTabsCloseTrigger` `XhTabsContent` `XhTabsIndicator` `XhTabsList` `XhTabsLiveRegion` `XhTabsNextTrigger` `XhTabsOverflowTrigger` `XhTabsPrevTrigger` `XhTabsRoot` `XhTabsSeparator` `XhTabsTabDragTrigger` `XhTabsTrigger` |
| Composable | `useTabs` |
| State machine | `tabsMachine` |
| Skin | `@xihan-ui/styles/tabs.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `TabsNode[]` |  |
| `value` | `string \| null` |  |
| `defaultValue` | `string \| null` |  |
| `orientation` | `Orientation` |  |
| `dir` | `Direction` |  |
| `activationMode` | `TabsActivationMode` |  |
| `loop` | `boolean` |  |
| `variant` | `TabsVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `reorderable` | `boolean` |  |
| `onTabMove` | `(details: TabsMoveDetails) => void` |  |
| `closable` | `boolean` |  |
| `onTabClose` | `(details: TabsCloseDetails) => void` |  |
| `lazyMount` | `boolean` |  |
| `unmountOnExit` | `boolean` |  |
| `translations` | `Partial<TabsTranslations>` |  |
| `onValueChange` | `(details: TabsValueChangeDetails) => void` |  |

### TabsNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `disabled` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `TabsValueChangeDetails` |
| `tab-move` | `TabsMoveDetails` |
| `tab-close` | `TabsCloseDetails` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTabsCloseTrigger` | `value` | `string` | Yes |
| `XhTabsCloseTrigger` | `disabled` | `boolean` |  |
| `XhTabsContent` | `value` | `string` | Yes |
| `XhTabsRoot` | `renderPanel` | `(node: TabsNodeMeta) => ReactNode` |  |
| `XhTabsRoot` | `children` | `ReactNode` |  |
| `XhTabsTabDragTrigger` | `value` | `string` | Yes |
| `XhTabsTrigger` | `value` | `string` | Yes |
| `XhTabsTrigger` | `disabled` | `boolean` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `trigger` | 'active' \| 'inactive' |
| `content` | 'active' \| 'inactive' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `TRIGGER.SELECT` · `TRIGGER.FOCUS` · `TRIGGER.NAVIGATE` · `LIST.BLUR` · `TAB_DRAG.START` · `TAB_DRAG.MOVE` · `TAB_DRAG.END` · `TAB_DRAG.CANCEL` · `TAB.MOVE_BY` · `TAB.CLOSE` · `PRESS.START` · `PRESS.END` · `SCROLL.PREV` · `SCROLL.NEXT` · `SCROLL.BY` · `SCROLL.FRAME` · `PAN.START` · `PAN.MOVE` · `PAN.END` · `PAN.CANCEL` · `OVERFLOW.SELECT`

**Guards**: `isAutomatic` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string \| null` |
| `collection` | `readonly TabsNodeMeta[]` |
| `focusedValue` | `string \| null` |
| `dropTarget` | `DropTarget \| null` |
| `announcement` | `string` |
| `overflow` | `TabsOverflow \| null` |
| `overflowItems` | `readonly TabsOverflowItem[]` |
| `setValue` | `(next: string \| null) => void` |
| `getRootProps` | `() => T['element']` |
| `getListProps` | `() => T['element']` |
| `getTriggerProps` | `(props: TabsTriggerProps) => T['button']` |
| `getCloseTriggerProps` | `(props: TabsTriggerProps) => T['button']` |
| `isContentMounted` | `(value: string) => boolean` |
| `getIndicatorProps` | `() => T['element']` |
| `getSeparatorProps` | `() => T['element']` |
| `getPrevTriggerProps` | `() => T['button']` |
| `getNextTriggerProps` | `() => T['button']` |
| `getOverflowTriggerProps` | `() => T['button']` |
| `getContentProps` | `(props: TabsContentProps) => T['element']` |
| `getTabDragTriggerProps` | `(props: TabsTriggerProps) => T['element']` |
| `getLiveRegionProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowRight` / `ArrowDown` | `tabs.kbd.next` |
| `ArrowLeft` / `ArrowUp` | `tabs.kbd.prev` |
| `Home` | `tabs.kbd.first` |
| `End` | `tabs.kbd.last` |
| `Enter` / `Space` | `tabs.kbd.activate` |
| `Enter` / `Space` | `tabs.kbd.press` |
| `Delete` / `Backspace` | `tabs.kbd.close` |
| `Tab` / `Shift+Tab` | `tabs.kbd.tab` |
| `Tab` / `Shift+Tab` | `tabs.kbd.overflow-stop` |
| `Enter` / `Space` / `ArrowDown` / `ArrowUp` | `tabs.kbd.overflow-open` |
| `Escape` | `tabs.kbd.overflow-close` |
| `Alt+ArrowLeft` / `Alt+ArrowRight` / `Alt+ArrowUp` / `Alt+ArrowDown` | `tabs.kbd.tab-move` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `list` | `aria-orientation` | props.orientation |
| `list` | `role` | 'tablist' |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-selected` | 'true' \| 'false' |
| `trigger` | `role` | 'tab' |
| `close-trigger` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `prev-trigger` | `aria-hidden` | 'true' |
| `next-trigger` | `aria-hidden` | 'true' |
| `overflow-trigger` | `aria-label` | translations.overflowTrigger |
| `content` | `aria-labelledby` | id of the `trigger` part |
| `content` | `role` | 'tabpanel' |
| `tab-drag-trigger` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/tabs.css` is written against `[data-scope="tabs"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-tabs` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-closable` | '' (present only while the condition holds) |
| `trigger` | `data-current` | '' (present only while the condition holds) |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-draggable` | '' (present only while the condition holds) |
| `trigger` | `data-dragging` | '' (present only while the condition holds) |
| `trigger` | `data-drop` | 'before' \| 'after' |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'active' \| 'inactive' |
| `trigger` | `data-xh-collection-context` | 'nav' \| undefined |
| `trigger` | `data-xh-collection-item` | '' (present only while the condition holds) |
| `trigger` | `data-xh-collection-size` | props.size \| undefined |
| `close-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'xs' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |
| `indicator` | `data-instant` | '' (present only while the condition holds) |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-value` | item.value |
| `indicator` | `data-variant` | props.variant |
| `separator` | `data-orientation` | props.orientation |
| `prev-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `prev-trigger` | `data-orientation` | props.orientation |
| `prev-trigger` | `data-xh-action-control` | '' |
| `prev-trigger` | `data-xh-action-display` | 'always' |
| `prev-trigger` | `data-xh-action-profile` | 'icon' |
| `prev-trigger` | `data-xh-action-size` | props.size |
| `prev-trigger` | `data-xh-action-variant` | 'ghost' |
| `next-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `next-trigger` | `data-orientation` | props.orientation |
| `next-trigger` | `data-xh-action-control` | '' |
| `next-trigger` | `data-xh-action-display` | 'always' |
| `next-trigger` | `data-xh-action-profile` | 'icon' |
| `next-trigger` | `data-xh-action-size` | props.size |
| `next-trigger` | `data-xh-action-variant` | 'ghost' |
| `overflow-trigger` | `data-orientation` | props.orientation |
| `overflow-trigger` | `data-xh-action-control` | '' |
| `overflow-trigger` | `data-xh-action-display` | 'always' |
| `overflow-trigger` | `data-xh-action-profile` | 'icon' |
| `overflow-trigger` | `data-xh-action-size` | props.size |
| `overflow-trigger` | `data-xh-action-variant` | 'ghost' |
| `content` | `data-state` | 'active' \| 'inactive' |
| `tab-drag-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `tab-drag-trigger` | `data-dragging` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-tabs-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-tabs-content-py` | `content` | `padding-block` | `default` | `--xh-stack-gap-md` |
| `--xh-tabs-drag-fg` | `tab-drag-trigger` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-tabs-drag-fg-active` | `tab-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` |
| `--xh-tabs-drag-fg-disabled` | `tab-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-tabs-drag-grip-long` | `root`<br>`tab-drag-trigger` | `block-size`<br>`inline-size` | `empty`<br>`orientation=vertical` | `--xh-space-2` |
| `--xh-tabs-drag-grip-short` | `root`<br>`tab-drag-trigger` | `block-size`<br>`inline-size` | `empty`<br>`orientation=vertical` | `--xh-space-1` |
| `--xh-tabs-drag-radius` | `tab-drag-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-tabs-drag-size` | `tab-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-tabs-dragging-opacity` | `trigger` | `opacity` | `dragging` | `--xh-state-dragging-opacity` |
| `--xh-tabs-drop-fg` | `trigger` | `background` | `drop=after`<br>`drop=before`<br>`is([data-drop='before'], [data-drop='after'])` | `--xh-bg-brand` |
| `--xh-tabs-drop-line` | `root`<br>`trigger` | `block-size`<br>`inline-size` | `drop=after`<br>`drop=before`<br>`is([data-drop='before'], [data-drop='after'])`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` |
| `--xh-tabs-gap` | `root` | `column-gap`<br>`gap`<br>`row-gap` | `default`<br>`has(> [data-scope='tabs'][data-part='overflow-trigger'])`<br>`orientation=vertical` | `--xh-stack-gap-md` |
| `--xh-tabs-indicator-color` | `indicator`<br>`root`<br>`trigger` | `background` | `current`<br>`default`<br>`drop`<br>`not([data-drop])`<br>`variant=line` | `--xh-_tabs-accent` |
| `--xh-tabs-indicator-radius` | `indicator`<br>`root`<br>`trigger` | `border-radius` | `current`<br>`default`<br>`drop`<br>`not([data-drop])`<br>`variant=line` | `--xh-shape-pill` |
| `--xh-tabs-indicator-thickness` | `indicator`<br>`root`<br>`trigger` | `block-size`<br>`inline-size` | `current`<br>`default`<br>`drop`<br>`not([data-drop])`<br>`not([data-variant='segment'])`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`variant=line`<br>`variant=segment` | `--xh-stroke-thick` |
| `--xh-tabs-list-bg` | `list` | `background` | `default` | `--xh-_tabs-list-bg` |
| `--xh-tabs-list-border` | `list`<br>`root` | `border`<br>`border-block-end`<br>`border-inline-end` | `default`<br>`variant=segment` | `--xh-border-default`<br>`transparent` |
| `--xh-tabs-list-gap` | `close-trigger`<br>`list`<br>`root` | `gap`<br>`margin-block-start`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-_tabs-list-gap` |
| `--xh-tabs-list-p` | `list`<br>`next-trigger`<br>`prev-trigger` | `inset-block-end`<br>`inset-block-start`<br>`inset-inline`<br>`inset-inline-end`<br>`inset-inline-start`<br>`padding` | `default`<br>`orientation=vertical` | `--xh-_tabs-list-p` |
| `--xh-tabs-list-radius` | `list` | `border-radius` | `default` | `--xh-_tabs-list-radius` |
| `--xh-tabs-scroll-icon-size` | `next-trigger`<br>`prev-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-tabs-scroll-trigger-bg` | `next-trigger`<br>`prev-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_tabs-scroll-trigger-bg` |
| `--xh-tabs-scroll-trigger-fg` | `next-trigger`<br>`prev-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tabs-separator-color` | `separator` | `background` | `default` | `--xh-border-default` |
| `--xh-tabs-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-tabs-separator-size` | `separator` | `block-size` | `default` | `--xh-space-4` |
| `--xh-tabs-separator-thickness` | `separator` | `block-size`<br>`inline-size` | `default`<br>`orientation=vertical` | `--xh-stroke-thin` |
| `--xh-tabs-trigger-bg` | `root`<br>`trigger` | `background`<br>`background-color` | `is([data-variant='card'], [data-variant='segment'])`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `transparent` |
| `--xh-tabs-trigger-bg-active` | `indicator`<br>`root`<br>`trigger` | `background`<br>`background-color` | `current`<br>`disabled`<br>`error`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`state=active`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-_tabs-trigger-bg-active`<br>`--xh-_tone-subtle`<br>`transparent` |
| `--xh-tabs-trigger-bg-active-hover` | `root`<br>`trigger` | `background`<br>`background-color` | `current`<br>`disabled`<br>`error`<br>`hover`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`not([data-disabled])`<br>`state=active`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-_tabs-trigger-bg-active-hover`<br>`--xh-bg-subtle` |
| `--xh-tabs-trigger-bg-hover` | `root`<br>`trigger` | `background`<br>`background-color` | `disabled`<br>`error`<br>`hover`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`not([data-disabled])`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-_tabs-trigger-bg-hover`<br>`--xh-bg-subtle` |
| `--xh-tabs-trigger-bg-pressed` | `root`<br>`trigger` | `background`<br>`background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`not([data-disabled])`<br>`not([data-state='active'])`<br>`pressed`<br>`state=active`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-_tabs-trigger-bg-pressed`<br>`--xh-bg-subtle-hover` |
| `--xh-tabs-trigger-border` | `trigger` | `border` | `default` | `--xh-_tabs-trigger-border` |
| `--xh-tabs-trigger-border-active` | `indicator`<br>`root`<br>`trigger` | `border`<br>`border-color` | `is([data-variant='card'], [data-variant='segment'])`<br>`state=active`<br>`variant=card`<br>`variant=segment` | `--xh-_tabs-trigger-border-active`<br>`--xh-_tone-border` |
| `--xh-tabs-trigger-fg` | `root`<br>`trigger` | `color` | `is([data-variant='card'], [data-variant='segment'])`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-fg-muted` |
| `--xh-tabs-trigger-fg-active` | `root`<br>`trigger` | `color` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`state=active`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-_tabs-accent-text`<br>`--xh-_tabs-accent-text-strong` |
| `--xh-tabs-trigger-fg-hover` | `root`<br>`trigger` | `color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`variant=line`<br>`xh-collection-context=nav` | `--xh-fg-default` |
| `--xh-tabs-trigger-fg-pressed` | `root`<br>`trigger` | `color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`variant=line`<br>`xh-collection-context=nav` | `--xh-fg-default` |
| `--xh-tabs-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_tabs-trigger-font-size` |
| `--xh-tabs-trigger-font-weight` | `root`<br>`trigger` | `font-weight` | `is([data-variant='card'], [data-variant='segment'])`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-font-weight-regular`<br>`--xh-text-label-weight` |
| `--xh-tabs-trigger-font-weight-active` | `root`<br>`trigger` | `font-weight` | `current`<br>`disabled`<br>`error`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`state=active`<br>`variant=card`<br>`variant=line`<br>`variant=segment`<br>`xh-collection-context=nav` | `--xh-font-weight-medium` |
| `--xh-tabs-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-md` |
| `--xh-tabs-trigger-h` | `close-trigger`<br>`next-trigger`<br>`overflow-trigger`<br>`prev-trigger`<br>`root`<br>`trigger` | `block-size`<br>`inline-size`<br>`margin-block-end`<br>`margin-block-start`<br>`margin-inline-end`<br>`margin-inline-start`<br>`padding-inline-end` | `default`<br>`has(+ [data-scope='tabs'][data-part='close-trigger']:not([hidden])`<br>`orientation=vertical`<br>`xh-action-profile=icon` | `--xh-_tabs-trigger-h` |
| `--xh-tabs-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_tabs-trigger-px` |
| `--xh-tabs-trigger-radius` | `indicator`<br>`trigger` | `border-radius` | `default`<br>`variant=segment` | `--xh-_tabs-trigger-radius`<br>`--xh-shape-inset` |
| `--xh-tabs-trigger-shadow-active` | `indicator`<br>`root`<br>`trigger` | `box-shadow` | `focus-visible`<br>`is([data-variant='card'], [data-variant='segment'])`<br>`state=active`<br>`variant=card`<br>`variant=segment` | `--xh-_tabs-trigger-shadow-active`<br>`--xh-elevation-raised` |
