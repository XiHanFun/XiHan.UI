# Descriptions

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/descriptions).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/descriptions" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/descriptions.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/descriptions" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/descriptions" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/descriptions.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="descriptions"`: **`root`** · `header` · `title` · `extra` · `item` · `label` · `value`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-descriptions>` |
| Vue components | `XhDescriptionsExtra` `XhDescriptionsHeader` `XhDescriptionsItem` `XhDescriptionsLabel` `XhDescriptionsRoot` `XhDescriptionsTitle` `XhDescriptionsValue` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/descriptions.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `columns` | `DescriptionsColumns` |  |
| `placement` | `DescriptionsPlacement` |  |
| `size` | `Size` |  |
| `variant` | `ControlVariant` |  |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhDescriptionsRoot` | `default` | — |
| `XhDescriptionsRoot` | `header` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhDescriptionsItem` | `as` | `ElementType` |  |
| `XhDescriptionsItem` | `span` | `number` |  |
| `XhDescriptionsLabel` | `as` | `ElementType` |  |
| `XhDescriptionsRoot` | `as` | `ElementType` |  |
| `XhDescriptionsRoot` | `header` | `ReactNode` |  |
| `XhDescriptionsTitle` | `as` | `ElementType` |  |
| `XhDescriptionsValue` | `as` | `ElementType` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getHeaderProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getExtraProps` | `() => T['element']` |
| `getItemProps` | `(props?: DescriptionsItemProps) => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getValueProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/descriptions.css` is written against `[data-scope="descriptions"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-descriptions` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `header` | `data-size` | props.size |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-descriptions-bg` | `root` | `background` | `variant=outline`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-descriptions-border` | `root` | `border` | `variant=outline` | `--xh-border-default` |
| `--xh-descriptions-divider` | `item`<br>`label`<br>`root` | `border-block-end`<br>`border-inline-end` | `@media (min-width: 768px)`<br>`placement=left`<br>`variant=outline` | `--xh-border-default` |
| `--xh-descriptions-extra-gap` | `extra` | `gap` | `default` | `--xh-space-2` |
| `--xh-descriptions-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-descriptions-font-size` | `root` | `font-size` | `default` | `--xh-_descriptions-font-size` |
| `--xh-descriptions-gap` | `root` | `gap` | `default` | `--xh-_descriptions-row-gap` |
| `--xh-descriptions-header-gap` | `header` | `gap` | `default` | `--xh-space-3` |
| `--xh-descriptions-header-mb` | `header` | `margin-block-end` | `default` | `--xh-_descriptions-header-mb` |
| `--xh-descriptions-item-px` | `item`<br>`label`<br>`root`<br>`value` | `padding-inline` | `@media (min-width: 768px)`<br>`is([data-scope='descriptions'][data-part='label'], [data-scope='descriptions'][data-part='value'])`<br>`placement=left`<br>`variant=outline` | `--xh-_descriptions-px` |
| `--xh-descriptions-item-py` | `item`<br>`label`<br>`root`<br>`value` | `padding-block` | `@media (min-width: 768px)`<br>`is([data-scope='descriptions'][data-part='label'], [data-scope='descriptions'][data-part='value'])`<br>`placement=left`<br>`variant=outline` | `--xh-_descriptions-py` |
| `--xh-descriptions-label-bg` | `item`<br>`label`<br>`root` | `background` | `@media (min-width: 768px)`<br>`placement=left`<br>`variant=outline` | `--xh-bg-muted` |
| `--xh-descriptions-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-descriptions-label-font-weight` | `label` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-descriptions-label-gap` | `item`<br>`root` | `column-gap` | `@media (min-width: 768px)`<br>`placement=left` | `--xh-_descriptions-label-gap` |
| `--xh-descriptions-label-w` | `item`<br>`root` | `grid-template-columns` | `@media (min-width: 768px)`<br>`@supports (grid-template-columns: subgrid)`<br>`columns=2`<br>`columns=3`<br>`columns=4`<br>`columns=5`<br>`columns=6`<br>`placement=left` | `--xh-_descriptions-label-w` |
| `--xh-descriptions-pair-gap` | `item` | `gap` | `default` | `--xh-_descriptions-pair-gap` |
| `--xh-descriptions-radius` | `root` | `border-radius` | `variant=outline`<br>`variant=subtle` | `--xh-shape-surface` |
| `--xh-descriptions-title-fg` | `title` | `color` | `default` | `--xh-fg-default` |
| `--xh-descriptions-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` |
| `--xh-descriptions-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` |
| `--xh-descriptions-value-fg` | `value` | `color` | `default` | `--xh-fg-default` |
