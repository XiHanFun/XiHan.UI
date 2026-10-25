# PageHeader

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/page-header).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/page-header" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/page-header.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/page-header" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/page-header" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/page-header.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="page-header"`: **`root`** · `breadcrumb` · `back-trigger` · `media` · `title` · `description` · `extra` · `footer`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-page-header>` |
| Vue components | `XhPageHeaderBackTrigger` `XhPageHeaderBreadcrumb` `XhPageHeaderDescription` `XhPageHeaderExtra` `XhPageHeaderFooter` `XhPageHeaderMedia` `XhPageHeaderRoot` `XhPageHeaderTitle` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/page-header.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `size` | `Size` |  |
| `split` | `boolean` |  |
| `variant` | `ControlVariant` |  |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhPageHeaderBackTrigger` | `as` | `ElementType` |  |
| `XhPageHeaderTitle` | `as` | `ElementType` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getBreadcrumbProps` | `() => T['element']` |
| `getBackTriggerProps` | `() => T['element']` |
| `getMediaProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getExtraProps` | `() => T['element']` |
| `getFooterProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/page-header.css` is written against `[data-scope="page-header"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-page-header` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-split` | '' (present only while the condition holds) |
| `root` | `data-variant` | props.variant |
| `back-trigger` | `data-xh-action-control` | '' |
| `back-trigger` | `data-xh-action-display` | 'always' |
| `back-trigger` | `data-xh-action-profile` | 'icon' |
| `back-trigger` | `data-xh-action-size` | 'md' \| 'sm' |
| `back-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-page-header-back-fg` | `back-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-page-header-back-fg-hover` | `back-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-page-header-bg` | `root` | `background` | `variant=outline`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-page-header-border` | `root` | `border`<br>`border-block-end` | `split`<br>`variant=ghost`<br>`variant=outline` | `--xh-border-default` |
| `--xh-page-header-breadcrumb-fg` | `breadcrumb` | `color` | `default` | `--xh-fg-muted` |
| `--xh-page-header-breadcrumb-font-size` | `breadcrumb` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-page-header-column-gap` | `back-trigger`<br>`extra`<br>`media` | `margin-inline-end`<br>`margin-inline-start` | `default` | `--xh-space-3` |
| `--xh-page-header-description-fg` | `description` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-page-header-description-font-size` | `description` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-page-header-divider` | `description`<br>`title` | `background` | `default` | `--xh-border-default` |
| `--xh-page-header-extra-gap` | `extra` | `gap` | `default` | `--xh-space-2` |
| `--xh-page-header-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-page-header-footer-fg` | `footer` | `color` | `default` | `--xh-fg-muted` |
| `--xh-page-header-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-page-header-px` | `root` | `padding-inline` | `default` | `--xh-_page-header-px` |
| `--xh-page-header-py` | `root` | `padding-block` | `default` | `--xh-_page-header-py` |
| `--xh-page-header-radius` | `root` | `border-radius` | `default` | `--xh-_page-header-radius` |
| `--xh-page-header-row-gap` | `root` | `row-gap` | `default` | `--xh-_page-header-row-gap` |
| `--xh-page-header-title-fg` | `title` | `color` | `default` | `--xh-fg-default` |
| `--xh-page-header-title-font-size` | `title` | `font-size` | `default` | `--xh-_page-header-title-size` |
| `--xh-page-header-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-2-weight` |
