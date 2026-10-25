# SideNav

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/side-nav).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/side-nav" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/side-nav.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/side-nav" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/side-nav" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/side-nav.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="side-nav"`: **`root`** · `input` · **`list`** · **`item`** · `group` · `group-label` · `group-list` · `branch` · `branch-trigger` · `branch-text` · `branch-indicator` · `positioner` · `branch-content` · **`link`** · `link-text` · `empty`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-side-nav>` |
| Vue components | `XhSideNavBranch` `XhSideNavBranchContent` `XhSideNavBranchIndicator` `XhSideNavBranchText` `XhSideNavBranchTrigger` `XhSideNavEmpty` `XhSideNavGroup` `XhSideNavGroupLabel` `XhSideNavGroupList` `XhSideNavInput` `XhSideNavItem` `XhSideNavLink` `XhSideNavLinkText` `XhSideNavList` `XhSideNavRoot` `XhSideNavTooltip` |
| Composable | `useSideNav` |
| State machine | `sideNavMachine` |
| Skin | `@xihan-ui/styles/side-nav.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `SideNavNode[]` |  |
| `value` | `string \| null` |  |
| `defaultValue` | `string \| null` |  |
| `expandedValue` | `string[]` |  |
| `defaultExpandedValue` | `string[]` |  |
| `accordion` | `boolean` |  |
| `collapsed` | `boolean` |  |
| `collapsedPopout` | `boolean` |  |
| `disabled` | `boolean` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `filter` | `SideNavFilter` |  |
| `translations` | `Partial<SideNavTranslations>` |  |
| `onValueChange` | `(details: SideNavValueChangeDetails) => void` |  |
| `onExpandedValueChange` | `(details: SideNavExpandedValueChangeDetails) => void` |  |

### SideNavNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `disabled` | `boolean` |  |
| `tone` | `Tone` |  |
| `href` | `string` |  |
| `children` | `SideNavNode[]` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `SideNavValueChangeDetails` |
| `expanded-value-change` | `SideNavExpandedValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhSideNavRoot` | `default` | `SideNavRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhSideNavBranch` | `value` | `string` | Yes |
| `XhSideNavBranchContent` | `container` | `() => Element \| null` |  |
| `XhSideNavGroup` | `value` | `string` | Yes |
| `XhSideNavGroupLabel` | `value` | `string` | Yes |
| `XhSideNavLink` | `value` | `string` | Yes |
| `XhSideNavRoot` | `children` | `SlotChildren<SideNavRootSlotProps>` |  |
| `XhSideNavTooltip` | `container` | `() => Element \| null` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `branch` | 'open' \| 'closed' |
| `branch-trigger` | 'open' \| 'closed' |
| `branch-indicator` | 'open' \| 'closed' |
| `branch-content` | 'open' \| 'closed' |
| `popout-positioner` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `idle` · `popout`

**Events**: `VALUE.SET` · `LINK.SELECT` · `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `NODE.FOCUS` · `FOCUS.CLEAR` · `POPOUT.OPEN` · `POPOUT.CLOSE` · `POPOUT.HOVER` · `POPOUT.HOVER_END` · `PRESENCE.SET` · `PRESS.START` · `PRESS.END` · `COLLAPSE.SETTLED` · `INPUT.CHANGE` · `TOOLTIP.TARGET` · `TOOLTIP.OPEN_CHANGE`

**Guards**: `canChange` · `canPopout` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string \| null` |
| `expandedValue` | `string[]` |
| `collapsed` | `boolean` |
| `popoutValue` | `string \| null` |
| `openPopout` | `(value: string) => void` |
| `closePopout` | `() => void` |
| `focusedValue` | `string \| null` |
| `isSelected` | `(value: string) => boolean` |
| `isExpanded` | `(value: string) => boolean` |
| `isActiveBranch` | `(value: string) => boolean` |
| `select` | `(value: string) => void` |
| `setValue` | `(next: string \| null) => void` |
| `setExpandedValue` | `(next: string[]) => void` |
| `expand` | `(value: string) => void` |
| `collapse` | `(value: string) => void` |
| `inputValue` | `string` |
| `setInputValue` | `(next: string) => void` |
| `searching` | `boolean` |
| `empty` | `boolean` |
| `translations` | `SideNavTranslations` |
| `getRootProps` | `() => T['element']` |
| `getListProps` | `() => T['element']` |
| `getInputProps` | `() => T['input']` |
| `getEmptyProps` | `() => T['element']` |
| `getItemProps` | `(props?: SideNavItemProps) => T['element']` |
| `getGroupProps` | `(props: SideNavGroupProps) => T['element']` |
| `getGroupLabelProps` | `(props: SideNavNodeProps) => T['element']` |
| `getGroupListProps` | `(props: SideNavNodeProps) => T['element']` |
| `getBranchProps` | `(props: SideNavNodeProps) => T['element']` |
| `getBranchTriggerProps` | `(props: SideNavNodeProps) => T['button']` |
| `getBranchTextProps` | `() => T['element']` |
| `getBranchIndicatorProps` | `(props: SideNavNodeProps) => T['element']` |
| `isPopoutPanel` | `(value: string) => boolean` |
| `getPopoutPositionerProps` | `(props: SideNavNodeProps) => T['element']` |
| `getBranchContentProps` | `(props: SideNavNodeProps) => T['element']` |
| `getLinkProps` | `(props: SideNavNodeProps) => T['element']` |
| `getLinkTextProps` | `() => T['element']` |
| `tooltipText` | `string` |
| `getTooltipPositionerProps` | `() => T['element']` |
| `getTooltipContentProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `side-nav.kbd.press` |
| `Enter` / `Space` | `side-nav.kbd.activate` |
| `Enter` | `side-nav.kbd.link` |
| `ArrowDown` | `side-nav.kbd.down` |
| `ArrowUp` | `side-nav.kbd.up` |
| `ArrowRight` | `side-nav.kbd.expand` |
| `ArrowLeft` | `side-nav.kbd.collapse` |
| `Home` | `side-nav.kbd.home` |
| `End` | `side-nav.kbd.end` |
| `ArrowRight` / `Enter` / `Space` | `side-nav.kbd.popout-open` |
| `ArrowLeft` / `Escape` | `side-nav.kbd.popout-close` |
| printable characters | `side-nav.kbd.search-type` |
| `ArrowDown` / `Enter` | `side-nav.kbd.search-to-list` |
| `Tab` / `ArrowDown` / `ArrowUp` / `Home` / `End` | `side-nav.kbd.tooltip-show` |
| `Escape` | `side-nav.kbd.tooltip-escape` |
| `Escape` | `side-nav.kbd.search-escape` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | translations.root |
| `root` | `role` | 'navigation' |
| `input` | `aria-controls` | scope.partId('side-nav', 'list') |
| `input` | `aria-label` | translations.input |
| `group-list` | `aria-labelledby` | id of the `group-label` part |
| `branch-trigger` | `aria-controls` | id of the `content` part |
| `branch-trigger` | `aria-disabled` | 'true' \| 'false' |
| `branch-trigger` | `aria-expanded` | 'true' \| 'false' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `aria-hidden` | !open \|\| undefined |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| undefined |
| `empty` | `role` | 'status' |
| `popout-positioner` | `aria-hidden` | !open \|\| undefined |
| `tooltip-content` | `aria-hidden` | 'true' |
| `tooltip-content` | `role` | undefined |

## Style reference

### Skin

`@xihan-ui/styles/side-nav.css` is written against `[data-scope="side-nav"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-side-nav` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-animating` | '' (present only while the condition holds) |
| `root` | `data-collapsed` | '' (present only while the condition holds) |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `input` | `data-collapsed` | '' (present only while the condition holds) |
| `input` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-xh-field-input` | '' |
| `list` | `data-collapsed` | '' (present only while the condition holds) |
| `group-label` | `data-collapsed` | '' (present only while the condition holds) |
| `branch` | `data-disabled` | '' (present only while the condition holds) |
| `branch` | `data-in-path` | '' (present only while the condition holds) |
| `branch` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `branch-trigger` | `data-highlighted` | '' (present only while the condition holds) |
| `branch-trigger` | `data-in-path` | '' (present only while the condition holds) |
| `branch-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `branch-trigger` | `data-state` | 'open' \| 'closed' |
| `branch-trigger` | `data-tone` | metaOf(v)?.tone |
| `branch-trigger` | `data-value` | itemValue(el) |
| `branch-trigger` | `data-xh-collection-context` | 'page' |
| `branch-trigger` | `data-xh-collection-item` | '' |
| `branch-trigger` | `data-xh-collection-size` | props.size |
| `branch-text` | `data-xh-collection-slot` | 'text' |
| `branch-indicator` | `data-state` | 'open' \| 'closed' |
| `branch-indicator` | `data-xh-collection-slot` | 'suffix' |
| `branch-content` | `data-popout` | '' |
| `branch-content` | `data-state` | 'open' \| 'closed' |
| `link` | `data-current` | '' (present only while the condition holds) |
| `link` | `data-disabled` | '' (present only while the condition holds) |
| `link` | `data-highlighted` | '' (present only while the condition holds) |
| `link` | `data-pressed` | '' (present only while the condition holds) |
| `link` | `data-tone` | metaOf(v)?.tone |
| `link` | `data-value` | itemValue(el) |
| `link` | `data-xh-collection-context` | 'page' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `link-text` | `data-xh-collection-slot` | 'text' |
| `popout-positioner` | `data-hidden` | '' (present only while the condition holds) |
| `popout-positioner` | `data-placement` | placed?.placement |
| `popout-positioner` | `data-positioned` | '' (present only while the condition holds) |
| `popout-positioner` | `data-size` | props.size |
| `popout-positioner` | `data-state` | 'open' \| 'closed' |
| `popout-positioner` | `data-tone` | props.tone |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-side-nav-branch-indicator-size` | `branch-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-side-nav-collapsed-w` | `root` | `inline-size` | `collapsed` | `--xh-sider-collapsed-w` |
| `--xh-side-nav-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` |
| `--xh-side-nav-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_side-nav-row-font-size` |
| `--xh-side-nav-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_side-nav-row-px` |
| `--xh-side-nav-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-side-nav-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-side-nav-gap` | `branch`<br>`branch-content`<br>`group`<br>`group-list`<br>`list`<br>`root` | `gap` | `default` | `--xh-space-1` |
| `--xh-side-nav-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_side-nav-row-px` |
| `--xh-side-nav-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-side-nav-icon-size` | `branch-trigger`<br>`link`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-_collection-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-side-nav-indent` | `branch-content` | `padding-inline-start` | `default` | `--xh-space-4` |
| `--xh-side-nav-indicator-color` | `branch-trigger`<br>`link` | `color` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=page`<br>`xh-collection-slot=indicator` | `--xh-fg-brand` |
| `--xh-side-nav-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-surface` |
| `--xh-side-nav-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` |
| `--xh-side-nav-input-font-size` | `input` | `font-size` | `default` | `--xh-_side-nav-row-font-size` |
| `--xh-side-nav-input-h` | `input` | `block-size` | `default` | `--xh-_side-nav-input-h` |
| `--xh-side-nav-input-px` | `input` | `padding-inline` | `default` | `--xh-_side-nav-row-px` |
| `--xh-side-nav-link-font-size` | `branch-trigger`<br>`link` | `font-size` | `default` | `--xh-_side-nav-row-font-size` |
| `--xh-side-nav-link-gap` | `branch-trigger`<br>`link` | `gap` | `default` | `--xh-_side-nav-row-gap` |
| `--xh-side-nav-link-h` | `branch-trigger`<br>`link` | `min-block-size` | `default` | `--xh-_side-nav-row-h` |
| `--xh-side-nav-link-px` | `branch-trigger`<br>`link` | `padding-inline` | `default` | `--xh-_side-nav-row-px` |
| `--xh-side-nav-link-radius` | `branch-trigger`<br>`link` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-side-nav-p` | `root` | `padding` | `default` | `--xh-space-2` |
| `--xh-side-nav-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-side-nav-popout-bg` | `branch-content` | `background` | `popout` | `--xh-bg-surface` |
| `--xh-side-nav-popout-border` | `branch-content` | `border` | `popout` | `--xh-border-default` |
| `--xh-side-nav-popout-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-side-nav-popout-max-h` | `branch-content` | `max-block-size` | `popout` | `--xh-overlay-menu-max-h` |
| `--xh-side-nav-popout-max-w` | `branch-content` | `max-inline-size` | `popout` | `--xh-overlay-max-w` |
| `--xh-side-nav-popout-min-w` | `branch-content` | `min-inline-size` | `popout` | `--xh-overlay-menu-min-w` |
| `--xh-side-nav-popout-p` | `branch-content` | `padding` | `popout` | `--xh-space-1` |
| `--xh-side-nav-popout-radius` | `branch-content` | `border-radius` | `popout` | `--xh-shape-overlay` |
| `--xh-side-nav-popout-shadow` | `branch-content` | `box-shadow` | `popout` | `--xh-elevation-floating` |
| `--xh-side-nav-row-bg-active` | `branch-trigger`<br>`link` | `background-color` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` |
| `--xh-side-nav-row-bg-hover` | `branch-trigger`<br>`link` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` |
| `--xh-side-nav-row-bg-in-path` | `branch-trigger`<br>`link` | `background-color` | `in-path` | `--xh-bg-subtle` |
| `--xh-side-nav-row-bg-pressed` | `branch-trigger`<br>`link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-side-nav-row-fg` | `branch-trigger`<br>`link` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `currentColor` |
| `--xh-side-nav-row-fg-active` | `branch-trigger`<br>`link` | `color` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` |
| `--xh-side-nav-row-fg-in-path` | `branch-trigger`<br>`link` | `color` | `in-path` | `--xh-side-nav-row-fg` |
| `--xh-side-nav-row-font-weight-active` | `branch-trigger`<br>`link` | `font-weight` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=page` | `--xh-font-weight-semibold` |
| `--xh-side-nav-search-divider` | `input` | `border-block-end` | `default` | `--xh-material-solid-separator` |
| `--xh-side-nav-w` | `root` | `inline-size` | `default` | `--xh-sider-w` |
