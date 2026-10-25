# Anchor

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/anchor).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/anchor" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/anchor.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/anchor" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/anchor" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/anchor.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="anchor"`: **`root`** · **`list`** · **`item`** · **`link`** · `link-text` · `indicator`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-anchor>` |
| Vue components | `XhAnchorIndicator` `XhAnchorItem` `XhAnchorLink` `XhAnchorLinkText` `XhAnchorList` `XhAnchorRoot` |
| Composable | `useAnchor` |
| State machine | `anchorMachine` |
| Skin | `@xihan-ui/styles/anchor.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `value` | `string \| null` |  |
| `defaultValue` | `string \| null` |  |
| `collection` | `readonly string[]` |  |
| `offset` | `number` |  |
| `bounds` | `number` |  |
| `smooth` | `boolean` |  |
| `dir` | `Direction` |  |
| `orientation` | `Orientation` |  |
| `translations` | `Partial<AnchorTranslations>` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onValueChange` | `(details: AnchorValueChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `AnchorValueChangeDetails` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhAnchorLink` | `value` | `string` | Yes |
| `XhAnchorRoot` | `target` | `() => HTMLElement \| null` |  |
| `XhAnchorRoot` | `children` | `ReactNode` |  |

### State

The following names are internal to the state machine.

**States**: `idle` · `scrolling`

**Events**: `SPY.RESOLVE` · `LINK.CLICK` · `VALUE.SET` · `SCROLL.SETTLE` · `PRESS.START` · `PRESS.END`

**Guards**: `isSmooth` · `isTargetReached` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string \| null` |
| `isActive` | `(value: string) => boolean` |
| `setValue` | `(next: string \| null) => void` |
| `getRootProps` | `() => T['element']` |
| `getListProps` | `() => T['element']` |
| `getItemProps` | `() => T['element']` |
| `getLinkProps` | `(props: AnchorLinkProps) => T['element']` |
| `getLinkTextProps` | `() => T['element']` |
| `getIndicatorProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` | `anchor.kbd.link` |
| `Enter` / `Space` | `anchor.kbd.press` |
| `Tab` / `Shift+Tab` | `anchor.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | resolveTranslations(ANCHOR_EN_US, prop('translations'… |
| `link` | `aria-current` | 'location' \| undefined |
| `indicator` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/anchor.css` is written against `[data-scope="anchor"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-anchor` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `link` | `data-current` | '' (present only while the condition holds) |
| `link` | `data-pressed` | '' (present only while the condition holds) |
| `link` | `data-xh-collection-context` | 'nav' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `link-text` | `data-xh-collection-slot` | 'text' |
| `indicator` | `data-instant` | '' (present only while the condition holds) |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-value` | context.get('value') |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-anchor-fg` | `link`<br>`root` | `color` | `default`<br>`xh-collection-context=nav` | `--xh-fg-muted` |
| `--xh-anchor-font-size` | `link`<br>`root` | `font-size` | `default` | `--xh-_anchor-font-size` |
| `--xh-anchor-gap` | `list` | `gap` | `default` | `--xh-space-1` |
| `--xh-anchor-gap-horizontal` | `list` | `gap` | `orientation=horizontal` | `--xh-space-2` |
| `--xh-anchor-indicator-color` | `indicator`<br>`link` | `background` | `current`<br>`default` | `--xh-_anchor-accent` |
| `--xh-anchor-indicator-radius` | `indicator`<br>`link` | `border-radius` | `current`<br>`default` | `--xh-shape-pill` |
| `--xh-anchor-indicator-thickness` | `indicator`<br>`link`<br>`list` | `block-size`<br>`inline-size`<br>`inset-block-end`<br>`inset-inline-start` | `current`<br>`default`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` |
| `--xh-anchor-leading` | `link`<br>`root` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-anchor-link-bg-hover` | `link` | `background-color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-bg-subtle` |
| `--xh-anchor-link-bg-pressed` | `link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` |
| `--xh-anchor-link-fg-current` | `link` | `color` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-_anchor-accent-text` |
| `--xh-anchor-link-fg-hover` | `link` | `color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-fg-default` |
| `--xh-anchor-link-font-weight-current` | `link` | `font-weight` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-font-weight-medium` |
| `--xh-anchor-link-max-w` | `link` | `max-inline-size` | `default` | `--xh-nav-link-max-w` |
| `--xh-anchor-link-px` | `link` | `padding-inline` | `default` | `--xh-_anchor-link-px` |
| `--xh-anchor-link-py` | `link` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-anchor-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-anchor-track` | `list` | `border-block-end`<br>`border-inline-start` | `default`<br>`orientation=horizontal` | `--xh-border-default` |
