# Field

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/field).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="field"`: **`root`** · `label` · **`control`** · `description` · `error-text`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-field>` |
| Vue components | `XhFieldBoundary` `XhFieldControl` `XhFieldDescription` `XhFieldErrorText` `XhFieldLabel` `XhFieldRoot` |
| Composable | `useField` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/field.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `controlId` | `string` |  |
| `disabled` | `boolean` |  |
| `invalid` | `boolean` |  |
| `parts` | `FieldRenderedParts` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhFieldControl` | `default` | `FieldControlSlotProps` |
| `XhFieldRoot` | `default` | — |
| `XhFieldRoot` | `label` | — |
| `XhFieldRoot` | `control` | — |
| `XhFieldRoot` | `description` | — |
| `XhFieldRoot` | `errorText` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhFieldBoundary` | `children` | `ReactNode` |  |
| `XhFieldControl` | `asChild` | `boolean` |  |
| `XhFieldControl` | `children` | `SlotChildren<FieldControlSlotProps>` |  |
| `XhFieldRoot` | `label` | `ReactNode` |  |
| `XhFieldRoot` | `control` | `ReactNode` |  |
| `XhFieldRoot` | `description` | `ReactNode` |  |
| `XhFieldRoot` | `errorText` | `ReactNode` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `invalid` | `boolean` |
| `required` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `controlId` | `string` |
| `labelId` | `string` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getErrorTextProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `control` | `aria-describedby` | [ rendered?.description === false ? null : ids.descri… |
| `control` | `aria-invalid` | 'true' \| 'false' |
| `control` | `aria-labelledby` | undefined \| id of the `label` part |
| `control` | `aria-readonly` | 'true' \| 'false' |
| `control` | `aria-required` | 'true' \| 'false' |
| `error-text` | `aria-atomic` | 'true' |
| `error-text` | `aria-live` | 'polite' |
| `error-text` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/field.css` is written against `[data-scope="field"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-field` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `label` | `data-invalid` | '' (present only while the condition holds) |
| `label` | `data-readonly` | '' (present only while the condition holds) |
| `label` | `data-required` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-variant` | 'outline' |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | 'md' |
| `description` | `data-disabled` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-field-border-invalid` | `jumper` | `border-color` | `user-invalid` | `--xh-_field-variant-border-invalid` |
| `--xh-field-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-field-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-field-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-field-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-field-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-field-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-field-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-field-control-font-size` | `control` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-field-control-h` | `control`<br>`label`<br>`root` | `block-size`<br>`min-block-size`<br>`padding-block` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`layout=horizontal`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_field-size-control-height`<br>`--xh-control-h-md` |
| `--xh-field-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_field-size-padding-inline` |
| `--xh-field-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-field-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-field-description-fg` | `description` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-field-description-fg-disabled` | `description` | `color` | `disabled` | `--xh-fg-subtle` |
| `--xh-field-description-font-size` | `description` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-field-error-fg` | `error-text` | `color` | `default` | `--xh-fg-danger` |
| `--xh-field-error-font-size` | `error-text`<br>`root` | `block-size`<br>`font-size`<br>`margin-block-end`<br>`padding-block-end` | `default`<br>`has(> [data-scope='field'][data-part='error-text'][hidden])`<br>`not(:has(> [data-scope='field'][data-part='description']:not([hidden])` | `--xh-text-caption-size` |
| `--xh-field-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-0` |
| `--xh-field-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-field-label-fg-invalid` | `label` | `color` | `invalid` | `--xh-fg-danger` |
| `--xh-field-label-font-size` | `label`<br>`root` | `font-size`<br>`padding-block` | `default`<br>`layout=horizontal` | `--xh-text-label-size` |
| `--xh-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-field-label-gap` | `root` | `column-gap` | `layout=horizontal` | `--xh-space-4` |
| `--xh-field-label-gap-block` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-field-label-leading` | `label`<br>`root` | `line-height`<br>`padding-block` | `layout=horizontal` | `--xh-leading-normal` |
| `--xh-field-label-star` | `label` | `color` | `required` | `--xh-fg-danger` |
