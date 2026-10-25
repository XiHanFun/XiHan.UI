# NavigationMenu

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/navigation-menu).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/navigation-menu" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/navigation-menu.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/navigation-menu" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/navigation-menu" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/navigation-menu.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="navigation-menu"`: **`root`** · **`list`** · **`item`** · `trigger` · `trigger-indicator` · `content` · `branch-trigger` · `branch-indicator` · `branch-content` · **`link`** · `indicator` · `viewport`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-navigation-menu>` |
| Vue components | `XhNavigationMenuBranchContent` `XhNavigationMenuBranchIndicator` `XhNavigationMenuBranchTrigger` `XhNavigationMenuContent` `XhNavigationMenuIndicator` `XhNavigationMenuItem` `XhNavigationMenuLink` `XhNavigationMenuList` `XhNavigationMenuRoot` `XhNavigationMenuTrigger` `XhNavigationMenuTriggerIndicator` `XhNavigationMenuViewport` |
| Composable | `useNavigationMenu` |
| State machine | `navigationMenuMachine` |
| Skin | `@xihan-ui/styles/navigation-menu.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `NavigationMenuNode[]` |  |
| `value` | `string \| null` |  |
| `defaultValue` | `string \| null` |  |
| `orientation` | `Orientation` |  |
| `delayDuration` | `number` |  |
| `skipDelayDuration` | `number` |  |
| `dir` | `Direction` |  |
| `loop` | `boolean` |  |
| `disabled` | `boolean` |  |
| `translations` | `Partial<NavigationMenuTranslations>` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onValueChange` | `(details: NavigationMenuValueChangeDetails) => void` |  |

### NavigationMenuNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `disabled` | `boolean` |  |
| `href` | `string` |  |
| `current` | `boolean` |  |
| `children` | `NavigationMenuNode[]` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `NavigationMenuValueChangeDetails` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhNavigationMenuBranchContent` | `value` | `string` | Yes |
| `XhNavigationMenuBranchIndicator` | `value` | `string` | Yes |
| `XhNavigationMenuBranchTrigger` | `value` | `string` | Yes |
| `XhNavigationMenuBranchTrigger` | `disabled` | `boolean` |  |
| `XhNavigationMenuContent` | `value` | `string` | Yes |
| `XhNavigationMenuLink` | `current` | `boolean` |  |
| `XhNavigationMenuRoot` | `renderPanel` | `(node: NavigationMenuNodeMeta) => ReactNode` |  |
| `XhNavigationMenuRoot` | `children` | `ReactNode` |  |
| `XhNavigationMenuTrigger` | `value` | `string` | Yes |
| `XhNavigationMenuTrigger` | `disabled` | `boolean` |  |
| `XhNavigationMenuTriggerIndicator` | `value` | `string` | Yes |
| `XhNavigationMenuTriggerIndicator` | `disabled` | `boolean` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `trigger-indicator` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `branch-trigger` | 'open' \| 'closed' |
| `branch-indicator` | 'open' \| 'closed' |
| `branch-content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `viewport` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `idle` · `opening` · `skipping`

**Events**: `TRIGGER.POINTER` · `TRIGGER.FOCUS` · `TRIGGER.TOGGLE` · `DISMISS` · `VALUE.SET` · `PRESENCE.SET` · `after.delayDuration` · `after.skipDelayDuration` · `PRESS.START` · `PRESS.END` · `BRANCH.TOGGLE` · `BRANCH.DISMISS`

**Guards**: `hasValue` · `isCurrent` · `shouldKeepOpen` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string \| null` |
| `collection` | `readonly NavigationMenuNodeMeta[]` |
| `open` | `boolean` |
| `isOpen` | `(value: string) => boolean` |
| `branchValue` | `string \| null` |
| `isBranchOpen` | `(value: string) => boolean` |
| `setValue` | `(next: string \| null) => void` |
| `getRootProps` | `() => T['element']` |
| `getListProps` | `() => T['element']` |
| `getItemProps` | `() => T['element']` |
| `getTriggerProps` | `(props: NavigationMenuTriggerProps) => T['button']` |
| `getTriggerIndicatorProps` | `(props: NavigationMenuTriggerProps) => T['element']` |
| `getContentProps` | `(props: NavigationMenuContentProps) => T['element']` |
| `getBranchTriggerProps` | `(props: NavigationMenuTriggerProps) => T['button']` |
| `getBranchIndicatorProps` | `(props: NavigationMenuContentProps) => T['element']` |
| `getBranchContentProps` | `(props: NavigationMenuContentProps) => T['element']` |
| `getLinkProps` | `(props: NavigationMenuLinkProps) => T['element']` |
| `getIndicatorProps` | `() => T['element']` |
| `getViewportProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `navigation-menu.kbd.press` |
| `ArrowRight` / `ArrowDown` | `navigation-menu.kbd.next` |
| `ArrowLeft` / `ArrowUp` | `navigation-menu.kbd.prev` |
| `Home` | `navigation-menu.kbd.first` |
| `End` | `navigation-menu.kbd.last` |
| `Enter` / `Space` | `navigation-menu.kbd.toggle` |
| `Enter` / `Space` | `navigation-menu.kbd.branch-toggle` |
| `Escape` | `navigation-menu.kbd.branch-escape` |
| `Escape` | `navigation-menu.kbd.escape` |
| `Tab` / `Shift+Tab` | `navigation-menu.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | resolveTranslations(NAVIGATION_MENU_EN_US, prop('tran… |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger-indicator` | `aria-hidden` | 'true' |
| `content` | `aria-hidden` | !isOpen \|\| undefined |
| `content` | `aria-labelledby` | id of the `trigger` part |
| `content` | `role` | 'group' |
| `branch-trigger` | `aria-controls` | id of the `branch-content` part |
| `branch-trigger` | `aria-disabled` | 'true' \| 'false' |
| `branch-trigger` | `aria-expanded` | 'true' \| 'false' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `aria-labelledby` | id of the `branch-trigger` part |
| `branch-content` | `role` | 'group' |
| `link` | `aria-current` | 'page' \| undefined |
| `indicator` | `aria-hidden` | 'true' |
| `viewport` | `aria-hidden` | !open \|\| undefined |

## Style reference

### Skin

`@xihan-ui/styles/navigation-menu.css` is written against `[data-scope="navigation-menu"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-navigation-menu` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-in-path` | '' (present only while the condition holds) |
| `trigger` | `data-orientation` | props.orientation |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-collection-context` | 'nav' |
| `trigger` | `data-xh-collection-item` | '' |
| `trigger` | `data-xh-collection-size` | props.size |
| `trigger-indicator` | `data-disabled` | '' (present only while the condition holds) |
| `trigger-indicator` | `data-orientation` | props.orientation |
| `trigger-indicator` | `data-state` | 'open' \| 'closed' |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-orientation` | props.orientation |
| `content` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `branch-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `branch-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-xh-collection-context` | 'nav' |
| `branch-trigger` | `data-xh-collection-item` | '' |
| `branch-trigger` | `data-xh-collection-size` | props.size |
| `branch-indicator` | `data-state` | 'open' \| 'closed' |
| `branch-content` | `data-state` | 'open' \| 'closed' |
| `link` | `data-current` | '' (present only while the condition holds) |
| `link` | `data-pressed` | '' (present only while the condition holds) |
| `link` | `data-xh-collection-context` | 'nav' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `indicator` | `data-instant` | '' (present only while the condition holds) |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-value` | context.get('value') |
| `viewport` | `data-instant` | '' (present only while the condition holds) |
| `viewport` | `data-orientation` | props.orientation |
| `viewport` | `data-state` | 'open' \| 'closed' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-navigation-menu-branch-content-indent` | `branch-content` | `padding-inline-start` | `default` | `--xh-space-4` |
| `--xh-navigation-menu-branch-indicator-size` | `branch-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-navigation-menu-branch-trigger-gap` | `branch-trigger` | `gap` | `default` | `--xh-_navigation-menu-trigger-gap` |
| `--xh-navigation-menu-content-bg` | `content`<br>`viewport` | `background` | `default` | `--xh-bg-surface` |
| `--xh-navigation-menu-content-border` | `content`<br>`viewport` | `border` | `default` | `--xh-border-default` |
| `--xh-navigation-menu-content-gap` | `branch-content`<br>`content` | `gap` | `default` | `--xh-space-1` |
| `--xh-navigation-menu-content-max-w` | `content`<br>`viewport` | `max-inline-size` | `default` | `--xh-overlay-max-w-xl` |
| `--xh-navigation-menu-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` |
| `--xh-navigation-menu-content-offset` | `content`<br>`viewport` | `inset-block-start`<br>`inset-inline-start` | `default`<br>`orientation=vertical` | `--xh-space-1` |
| `--xh-navigation-menu-content-p` | `content` | `padding` | `default` | `--xh-surface-pad-xs` |
| `--xh-navigation-menu-content-radius` | `content`<br>`viewport` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-navigation-menu-content-shadow` | `content`<br>`viewport` | `box-shadow` | `default` | `--xh-elevation-floating` |
| `--xh-navigation-menu-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-navigation-menu-font-size` | `root`<br>`trigger` | `font-size` | `default` | `--xh-_navigation-menu-font-size` |
| `--xh-navigation-menu-gap` | `list` | `gap` | `default` | `--xh-space-1` |
| `--xh-navigation-menu-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-navigation-menu-indicator-color` | `indicator`<br>`link` | `background` | `current`<br>`default` | `--xh-_navigation-menu-accent` |
| `--xh-navigation-menu-indicator-radius` | `indicator`<br>`link` | `border-radius` | `current`<br>`default` | `--xh-shape-pill` |
| `--xh-navigation-menu-indicator-thickness` | `indicator`<br>`item`<br>`link`<br>`list` | `block-size`<br>`inline-size`<br>`inset-block-end` | `current`<br>`default`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` |
| `--xh-navigation-menu-layer` | `content`<br>`viewport` | `z-index` | `default` | `--xh-_layer` |
| `--xh-navigation-menu-link-bg-hover` | `branch-trigger`<br>`link` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-_navigation-menu-highlight-bg` |
| `--xh-navigation-menu-link-bg-pressed` | `branch-trigger`<br>`link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` |
| `--xh-navigation-menu-link-fg` | `branch-trigger`<br>`link` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-fg-default` |
| `--xh-navigation-menu-link-fg-current` | `link` | `color` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-fg-brand` |
| `--xh-navigation-menu-link-font-size` | `branch-trigger`<br>`link` | `font-size` | `default` | `--xh-_navigation-menu-link-font-size` |
| `--xh-navigation-menu-link-font-weight-current` | `link` | `font-weight` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-font-weight-medium` |
| `--xh-navigation-menu-link-px` | `branch-trigger`<br>`link` | `padding-inline` | `default` | `--xh-_navigation-menu-link-px` |
| `--xh-navigation-menu-link-py` | `branch-trigger`<br>`link` | `padding-block` | `default` | `--xh-_navigation-menu-link-py` |
| `--xh-navigation-menu-link-radius` | `branch-trigger`<br>`link` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-navigation-menu-trigger-bg-active` | `trigger` | `background-color` | `in-path`<br>`xh-collection-context=nav` | `--xh-_navigation-menu-highlight-bg` |
| `--xh-navigation-menu-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-_navigation-menu-highlight-bg` |
| `--xh-navigation-menu-trigger-bg-pressed` | `trigger` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` |
| `--xh-navigation-menu-trigger-fg` | `trigger` | `color` | `default`<br>`xh-collection-context=nav` | `--xh-fg-muted` |
| `--xh-navigation-menu-trigger-font-weight` | `trigger` | `font-weight` | `default`<br>`xh-collection-context=nav` | `--xh-font-weight-regular` |
| `--xh-navigation-menu-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_navigation-menu-trigger-gap` |
| `--xh-navigation-menu-trigger-h` | `trigger` | `block-size` | `default` | `--xh-_navigation-menu-trigger-h` |
| `--xh-navigation-menu-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_navigation-menu-trigger-px` |
| `--xh-navigation-menu-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-navigation-menu-viewport-p` | `viewport` | `padding` | `default` | `--xh-space-2` |
