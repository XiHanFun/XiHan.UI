# List

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/list).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/list" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/list.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/list" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/list" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/list.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="list"`: **`root`** · `item` · `item-media` · `item-content` · `item-title` · `item-description` · `item-action`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-list>` |
| Vue components | `XhListItem` `XhListItemAction` `XhListItemContent` `XhListItemDescription` `XhListItemMedia` `XhListItemTitle` `XhListRoot` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/list.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `hoverable` | `boolean` |  |
| `size` | `Size` |  |
| `split` | `boolean` |  |
| `variant` | `ControlVariant` |  |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhListItem` | `as` | `ElementType` |  |
| `XhListRoot` | `as` | `ElementType` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getItemProps` | `() => T['element']` |
| `getItemMediaProps` | `() => T['element']` |
| `getItemContentProps` | `() => T['element']` |
| `getItemTitleProps` | `() => T['element']` |
| `getItemDescriptionProps` | `() => T['element']` |
| `getItemActionProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/list.css` is written against `[data-scope="list"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-list` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-list-action-gap` | `item-action` | `gap` | `default` | `--xh-space-2` |
| `--xh-list-bg` | `root` | `background` | `variant=outline`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-list-border` | `root` | `border` | `variant=outline` | `--xh-border-default` |
| `--xh-list-content-gap` | `item-content` | `gap` | `default` | `--xh-space-0_5` |
| `--xh-list-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-list-description-font-size` | `item-description` | `font-size` | `default` | `--xh-_list-description-size` |
| `--xh-list-divider` | `item`<br>`root` | `border-block-start` | `split` | `--xh-border-default` |
| `--xh-list-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-list-item-bg-hover` | `item`<br>`root` | `background` | `@media (hover: hover)`<br>`hover`<br>`hoverable` | `--xh-_list-item-bg-hover` |
| `--xh-list-item-content-py` | `item-content` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-list-item-gap` | `item` | `gap` | `default` | `--xh-_list-item-gap` |
| `--xh-list-item-px` | `item` | `padding-inline` | `default` | `--xh-_list-item-px` |
| `--xh-list-item-py` | `item` | `padding-block` | `default` | `--xh-_list-item-py` |
| `--xh-list-radius` | `root` | `border-radius` | `variant=outline`<br>`variant=subtle` | `--xh-shape-surface` |
| `--xh-list-title-fg` | `item-title` | `color` | `default` | `--xh-fg-default` |
| `--xh-list-title-font-size` | `item-title` | `font-size` | `default` | `--xh-_list-title-size` |
| `--xh-list-title-font-weight` | `item-title` | `font-weight` | `default` | `--xh-font-weight-medium` |
