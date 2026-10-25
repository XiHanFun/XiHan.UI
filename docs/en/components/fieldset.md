# Fieldset

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/fieldset).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/fieldset" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/fieldset.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/fieldset" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/fieldset" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/fieldset.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="fieldset"`: **`root`** · **`legend`** · `description` · `field-group` · `actions` · `error-text`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-fieldset>` |
| Vue components | `XhFieldsetActions` `XhFieldsetDescription` `XhFieldsetErrorText` `XhFieldsetFieldGroup` `XhFieldsetLegend` `XhFieldsetRoot` |
| Composable | `useFieldset` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/fieldset.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `disabled` | `boolean` |  |
| `invalid` | `boolean` |  |
| `parts` | `FieldsetRenderedParts` |  |
| `required` | `boolean` |  |
| `translations` | `Partial<FieldsetTranslations>` |  |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhFieldsetRoot` | `default` | — |
| `XhFieldsetRoot` | `legend` | — |
| `XhFieldsetRoot` | `description` | — |
| `XhFieldsetRoot` | `fieldGroup` | — |
| `XhFieldsetRoot` | `errorText` | — |
| `XhFieldsetRoot` | `actions` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhFieldsetRoot` | `legend` | `ReactNode` |  |
| `XhFieldsetRoot` | `description` | `ReactNode` |  |
| `XhFieldsetRoot` | `fieldGroup` | `ReactNode` |  |
| `XhFieldsetRoot` | `errorText` | `ReactNode` |  |
| `XhFieldsetRoot` | `actions` | `ReactNode` |  |
| `XhFieldsetRoot` | `children` | `ReactNode` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `disabled` | `boolean` |
| `invalid` | `boolean` |
| `required` | `boolean` |
| `getRootProps` | `() => T['element']` |
| `getLegendProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getFieldGroupProps` | `() => T['element']` |
| `getActionsProps` | `() => T['element']` |
| `getErrorTextProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-describedby` | [ props.parts?.description !== false ? ids.descriptio… |
| `error-text` | `aria-atomic` | 'true' |
| `error-text` | `aria-live` | 'polite' |
| `error-text` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/fieldset.css` is written against `[data-scope="fieldset"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-fieldset` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `legend` | `data-disabled` | '' (present only while the condition holds) |
| `legend` | `data-invalid` | '' (present only while the condition holds) |
| `legend` | `data-required` | '' (present only while the condition holds) |
| `description` | `data-disabled` | '' (present only while the condition holds) |
| `field-group` | `data-disabled` | '' (present only while the condition holds) |
| `actions` | `data-disabled` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-fieldset-actions-gap` | `actions` | `gap` | `default` | `--xh-space-2` |
| `--xh-fieldset-description-fg` | `description` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-fieldset-description-fg-disabled` | `description` | `color` | `disabled` | `--xh-fg-subtle` |
| `--xh-fieldset-description-font-size` | `description` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-fieldset-error-fg` | `error-text` | `color` | `default` | `--xh-fg-danger` |
| `--xh-fieldset-error-font-size` | `error-text` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-fieldset-field-group-col-w` | `field-group` | `grid-template-columns` | `default` | `--xh-layout-col-min-sm` |
| `--xh-fieldset-field-group-gap` | `field-group` | `gap` | `default` | `--xh-space-3` |
| `--xh-fieldset-gap` | `root` | `margin-block-end` | `where(:not(:last-child)`<br>`where([data-scope='fieldset'][data-part='root'])` | `--xh-space-5` |
| `--xh-fieldset-legend-fg` | `legend` | `color` | `default` | `--xh-fg-default` |
| `--xh-fieldset-legend-fg-disabled` | `legend`<br>`root` | `color` | `disabled` | `--xh-fg-subtle` |
| `--xh-fieldset-legend-fg-invalid` | `legend` | `color` | `invalid` | `--xh-fg-danger` |
| `--xh-fieldset-legend-font-size` | `legend` | `font-size` | `default` | `--xh-text-heading-3-size` |
| `--xh-fieldset-legend-font-weight` | `legend` | `font-weight` | `default` | `--xh-text-heading-3-weight` |
| `--xh-fieldset-legend-gap` | `legend` | `margin-block-end` | `default` | `--xh-space-4` |
| `--xh-fieldset-legend-star` | `legend` | `color` | `required` | `--xh-fg-danger` |
