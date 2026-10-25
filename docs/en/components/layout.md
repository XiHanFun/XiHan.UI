# Layout

Layout component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/layout).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/layout" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/layout.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/layout" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/layout" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/layout.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="layout"`: **`root`** · `header` · `sider-backdrop` · `sider` · `content` · `footer` · `sider-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-layout>` |
| Vue components | `XhLayoutContent` `XhLayoutFooter` `XhLayoutHeader` `XhLayoutRoot` `XhLayoutSider` `XhLayoutSiderBackdrop` `XhLayoutSiderTrigger` |
| Composable | `useLayout` |
| State machine | `layoutMachine` |
| Skin | `@xihan-ui/styles/layout.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `siderCollapsed` | `boolean` |  |
| `defaultSiderCollapsed` | `boolean` |  |
| `siderWidth` | `string` |  |
| `siderCollapsedWidth` | `string` |  |
| `siderPlacement` | `LayoutSiderPlacement` |  |
| `siderBreakpoint` | `LayoutBreakpoint` |  |
| `siderPresentation` | `LayoutSiderPresentation` |  |
| `headerFixed` | `boolean` |  |
| `siderFixed` | `boolean` |  |
| `split` | `boolean` |  |
| `onSiderCollapsedChange` | `(details: LayoutSiderCollapsedChangeDetails) => void` |  |
| `onSiderBreakpoint` | `(details: LayoutSiderBreakpointDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `sider-collapsed-change` | `LayoutSiderCollapsedChangeDetails` |
| `sider-breakpoint` | `LayoutSiderBreakpointDetails` |

### State

The following names are internal to the state machine.

**States**: `expanded` · `collapsed`

**Events**: `SIDER.COLLAPSE` · `SIDER.EXPAND` · `SIDER.TOGGLE` · `CONTROLLED.COLLAPSE` · `CONTROLLED.EXPAND` · `PRESS.START` · `PRESS.END`

**Guards**: `isSiderCollapsedControlled`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `siderCollapsed` | `boolean` |
| `siderPresentation` | `LayoutSiderPresentation` |
| `setSiderCollapsed` | `(next: boolean) => void` |
| `getRootProps` | `() => T['element']` |
| `getHeaderProps` | `() => T['element']` |
| `getSiderBackdropProps` | `() => T['element']` |
| `getSiderProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getFooterProps` | `() => T['element']` |
| `getSiderTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Space` / `Enter` | `layout.kbd.toggle-sider` |
| `Enter` / `Space` | `layout.kbd.press` |
| `Escape` | `layout.kbd.dismiss-sider-sheet` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `sider-backdrop` | `aria-hidden` | 'true' |
| `sider-trigger` | `aria-controls` | id of the `sider` part |
| `sider-trigger` | `aria-expanded` | 'false' \| 'true' |

## Style reference

### Skin

`@xihan-ui/styles/layout.css` is written against `[data-scope="layout"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-layout` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-collapsed` | '' (present only while the condition holds) |
| `root` | `data-header-fixed` | '' (present only while the condition holds) |
| `root` | `data-sider-breakpoint` | props.siderBreakpoint |
| `root` | `data-sider-fixed` | '' (present only while the condition holds) |
| `root` | `data-sider-placement` | props.siderPlacement |
| `root` | `data-sider-presentation` | resolveSiderPresentation( prop('siderPresentation'), … |
| `root` | `data-split` | '' (present only while the condition holds) |
| `header` | `data-fixed` | '' (present only while the condition holds) |
| `header` | `data-xh-liquid` | '' (present only while the condition holds) |
| `sider-backdrop` | `data-collapsed` | '' (present only while the condition holds) |
| `sider-backdrop` | `data-instant` | '' (present only while the condition holds) |
| `sider` | `data-collapsed` | '' (present only while the condition holds) |
| `sider` | `data-fixed` | '' (present only while the condition holds) |
| `sider` | `data-instant` | '' (present only while the condition holds) |
| `sider` | `data-placement` | props.siderPlacement |
| `sider` | `data-presentation` | resolveSiderPresentation( prop('siderPresentation'), … |
| `sider-trigger` | `data-collapsed` | '' (present only while the condition holds) |
| `sider-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `sider-trigger` | `data-xh-action-control` | '' |
| `sider-trigger` | `data-xh-action-display` | 'always' |
| `sider-trigger` | `data-xh-action-profile` | 'text' |
| `sider-trigger` | `data-xh-action-size` | 'sm' |
| `sider-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-layout-bg` | `root` | `background` | `default` | `--xh-bg-page` |
| `--xh-layout-border` | `footer`<br>`header`<br>`root`<br>`sider` | `border-block-end`<br>`border-block-start`<br>`border-inline-end`<br>`border-inline-start` | `default`<br>`fixed`<br>`material=liquid`<br>`placement=end`<br>`placement=start`<br>`presentation=sheet`<br>`split`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-border-default`<br>`--xh-border-subtle`<br>`--xh-material-elevated-border`<br>`--xh-material-liquid-border` |
| `--xh-layout-content-padding` | `content` | `padding` | `default` | `--xh-space-4` |
| `--xh-layout-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-layout-footer-bg` | `footer` | `background` | `default` | `--xh-bg-surface` |
| `--xh-layout-footer-padding` | `footer` | `padding` | `default` | `--xh-space-3` |
| `--xh-layout-header-bg` | `header` | `background` | `default`<br>`fixed`<br>`material=liquid`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-_liquid-bg`<br>`--xh-bg-surface` |
| `--xh-layout-header-gap` | `header` | `gap` | `default` | `--xh-space-3` |
| `--xh-layout-header-h` | `header`<br>`root`<br>`sider` | `block-size`<br>`grid-template-rows`<br>`inset-block-start`<br>`max-block-size` | `default`<br>`fixed`<br>`header-fixed`<br>`sider-fixed` | `--xh-app-header-h` |
| `--xh-layout-header-layer` | `header` | `z-index` | `fixed` | `--xh-layer-sticky` |
| `--xh-layout-header-px` | `header` | `padding-inline` | `default` | `--xh-space-4` |
| `--xh-layout-scrollport-h` | `sider` | `max-block-size` | `fixed`<br>`presentation=sheet` | `100dvh`<br>`100vh` |
| `--xh-layout-sider-backdrop-bg` | `sider-backdrop` | `background` | `default` | `--xh-bg-overlay` |
| `--xh-layout-sider-backdrop-layer` | `sider-backdrop` | `z-index` | `default` | `--xh-layer-drawer` |
| `--xh-layout-sider-bg` | `sider` | `background` | `default`<br>`presentation=sheet` | `--xh-bg-surface`<br>`--xh-material-elevated-bg` |
| `--xh-layout-sider-collapsed-w` | `root`<br>`sider` | `inline-size` | `collapsed`<br>`sider-breakpoint` | `--xh-sider-collapsed-w` |
| `--xh-layout-sider-layer` | `sider` | `z-index` | `presentation=sheet` | `--xh-layer-drawer` |
| `--xh-layout-sider-padding` | `sider` | `padding`<br>`padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default`<br>`presentation=sheet` | `--xh-_layout-sider-padding` |
| `--xh-layout-sider-shadow` | `sider` | `box-shadow` | `presentation=sheet` | `--xh-material-elevated-shadow` |
| `--xh-layout-sider-trigger-bg` | `sider-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-layout-sider-trigger-bg-active` | `sider-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-layout-sider-trigger-bg-hover` | `sider-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-layout-sider-trigger-fg` | `sider-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-layout-sider-trigger-gap` | `sider-trigger` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-layout-sider-trigger-px` | `sider-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-layout-sider-trigger-radius` | `sider-trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` |
| `--xh-layout-sider-w` | `root`<br>`sider` | `inline-size` | `@media (min-width: 1024px)`<br>`@media (min-width: 1280px)`<br>`@media (min-width: 640px)`<br>`@media (min-width: 768px)`<br>`default`<br>`presentation=sheet`<br>`sider-breakpoint=lg`<br>`sider-breakpoint=md`<br>`sider-breakpoint=sm`<br>`sider-breakpoint=xl` | `--xh-sider-w` |
