# Breadcrumb

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/breadcrumb).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/breadcrumb" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/breadcrumb.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/breadcrumb" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/breadcrumb" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/breadcrumb.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="breadcrumb"`: **`root`** · **`list`** · **`item`** · **`link`** · `link-icon` · `separator` · `ellipsis` · `ellipsis-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-breadcrumb>` |
| Vue components | `XhBreadcrumbEllipsis` `XhBreadcrumbEllipsisTrigger` `XhBreadcrumbItem` `XhBreadcrumbLink` `XhBreadcrumbLinkIcon` `XhBreadcrumbList` `XhBreadcrumbRoot` `XhBreadcrumbSeparator` |
| Composable | `useBreadcrumb` |
| State machine | `breadcrumbMachine` |
| Skin | `@xihan-ui/styles/breadcrumb.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `readonly BreadcrumbNode[]` |  |
| `maxItems` | `number` |  |
| `dir` | `Direction` |  |
| `translations` | `Partial<BreadcrumbTranslations>` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |

### BreadcrumbNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `href` | `string` |  |
| `icon` | `string` |  |
| `current` | `boolean` |  |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhBreadcrumbLink` | `value` | `string` |  |
| `XhBreadcrumbLink` | `current` | `boolean` |  |
| `XhBreadcrumbRoot` | `renderSeparator` | `() => ReactNode` |  |
| `XhBreadcrumbRoot` | `renderEllipsis` | `(nodes: readonly BreadcrumbNodeMeta[]) => ReactNode` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `PRESS.START` · `PRESS.END` · `EXPAND`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `collection` | `readonly BreadcrumbNodeMeta[]` |
| `items` | `readonly BreadcrumbItem[]` |
| `expanded` | `boolean` |
| `expand` | `() => void` |
| `collapsedRange` | `(count: number) => BreadcrumbCollapsedRange \| null` |
| `getRootProps` | `() => T['element']` |
| `getListProps` | `() => T['element']` |
| `getItemProps` | `() => T['element']` |
| `getLinkProps` | `(props: BreadcrumbLinkProps) => T['element']` |
| `getLinkIconProps` | `() => T['element']` |
| `getSeparatorProps` | `() => T['element']` |
| `getEllipsisProps` | `() => T['element']` |
| `getEllipsisTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` | `breadcrumb.kbd.link` |
| `Enter` / `Space` | `breadcrumb.kbd.press` |
| `Enter` / `Space` | `breadcrumb.kbd.expand` |
| `Tab` / `Shift+Tab` | `breadcrumb.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | translations.root |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| 'false' |
| `link-icon` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `ellipsis-trigger` | `aria-label` | translations.ellipsis |

## Style reference

### Skin

`@xihan-ui/styles/breadcrumb.css` is written against `[data-scope="breadcrumb"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-breadcrumb` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `link` | `data-current` | '' (present only while the condition holds) |
| `link` | `data-pressed` | '' (present only while the condition holds) |
| `link` | `data-xh-collection-context` | 'nav' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `link` | `data-xh-collection-terminal` | '' (present only while the condition holds) |
| `ellipsis-trigger` | `data-xh-collection-context` | 'nav' |
| `ellipsis-trigger` | `data-xh-collection-item` | '' |
| `ellipsis-trigger` | `data-xh-collection-size` | props.size |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-breadcrumb-ellipsis-size` | `ellipsis` | `min-inline-size` | `default` | `--xh-space-5` |
| `--xh-breadcrumb-ellipsis-trigger-h` | `ellipsis-trigger` | `min-block-size` | `default` | `--xh-breadcrumb-link-h` |
| `--xh-breadcrumb-fg` | `ellipsis-trigger`<br>`link`<br>`root` | `color` | `default`<br>`xh-collection-context=nav` | `--xh-fg-muted` |
| `--xh-breadcrumb-font-size` | `ellipsis-trigger`<br>`link`<br>`root` | `font-size` | `default` | `--xh-_breadcrumb-font-size` |
| `--xh-breadcrumb-gap` | `list` | `gap` | `default` | `--xh-_breadcrumb-gap` |
| `--xh-breadcrumb-icon-size` | `ellipsis-trigger`<br>`link`<br>`root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` |
| `--xh-breadcrumb-leading` | `ellipsis-trigger`<br>`link`<br>`root` | `line-height` | `default` | `--xh-leading-tight` |
| `--xh-breadcrumb-link-bg-hover` | `link` | `background-color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-bg-subtle` |
| `--xh-breadcrumb-link-bg-pressed` | `link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` |
| `--xh-breadcrumb-link-fg-current` | `link` | `color` | `current`<br>`xh-collection-context=nav`<br>`xh-collection-terminal` | `--xh-_breadcrumb-accent-text` |
| `--xh-breadcrumb-link-fg-hover` | `link` | `color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-_tone-fg` |
| `--xh-breadcrumb-link-fg-pressed` | `link` | `color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-_tone-fg` |
| `--xh-breadcrumb-link-font-weight-current` | `link` | `font-weight` | `current`<br>`xh-collection-context=nav`<br>`xh-collection-terminal` | `--xh-font-weight-medium` |
| `--xh-breadcrumb-link-gap` | `link` | `gap` | `default` | `--xh-space-1` |
| `--xh-breadcrumb-link-h` | `ellipsis-trigger`<br>`link` | `min-block-size` | `default` | `--xh-control-action-size` |
| `--xh-breadcrumb-link-icon-size` | `link-icon` | `block-size`<br>`inline-size` | `default` | `--xh-glyph-size-text` |
| `--xh-breadcrumb-link-max-w` | `link` | `max-inline-size` | `default` | `--xh-nav-link-max-w` |
| `--xh-breadcrumb-link-px` | `link` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-breadcrumb-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-breadcrumb-separator-fg` | `ellipsis`<br>`separator` | `color` | `default` | `--xh-fg-disabled` |
| `--xh-breadcrumb-separator-size` | `separator` | `inline-size` | `default` | `--xh-glyph-size-text` |
