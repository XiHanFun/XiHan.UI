# InputGroup

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/input-group).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/input-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/input-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/input-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/input-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/input-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="input-group"`: **`root`** · `item`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-input-group>` |
| Vue components | `XhInputGroupItem` `XhInputGroupRoot` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/input-group.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `size` | `Size` |  |
| `variant` | `ControlVariant` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getItemProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/input-group.css` is written against `[data-scope="input-group"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-input-group` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-input-group-bg` | `root` | `background` | `default` | `--xh-_input-group-bg` |
| `--xh-input-group-bg-disabled` | `root` | `background` | `disabled`<br>`has([data-xh-field-chrome][data-disabled])`<br>`xh-field-chrome` | `--xh-bg-subtle` |
| `--xh-input-group-bg-focus` | `root` | `background` | `focus-within` | `--xh-_input-group-bg-focus` |
| `--xh-input-group-bg-hover` | `root` | `background` | `disabled`<br>`hover`<br>`invalid`<br>`not(:focus-within)`<br>`not(:has([data-xh-field-chrome]:is([data-disabled], [data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_input-group-bg-hover` |
| `--xh-input-group-bg-invalid` | `root` | `background` | `has([data-invalid], [aria-invalid='true'])`<br>`invalid` | `--xh-bg-field-invalid` |
| `--xh-input-group-bg-read-only` | `root` | `background` | `has(:where([data-xh-field-chrome][data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-bg-subtle` |
| `--xh-input-group-border` | `root` | `border` | `default` | `--xh-_input-group-border` |
| `--xh-input-group-border-disabled` | `root` | `border-color` | `disabled`<br>`has([data-xh-field-chrome][data-disabled])`<br>`xh-field-chrome` | `--xh-border-default` |
| `--xh-input-group-border-focus` | `root` | `border-color` | `focus-within` | `--xh-_input-group-border-focus` |
| `--xh-input-group-border-hover` | `root` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not(:focus-within)`<br>`not(:has([data-xh-field-chrome]:is([data-disabled], [data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_input-group-border-hover` |
| `--xh-input-group-border-invalid` | `root` | `border-color` | `has([data-invalid], [aria-invalid='true'])`<br>`invalid` | `--xh-border-invalid` |
| `--xh-input-group-item-bg` | `item` | `background-color` | `default` | `--xh-bg-subtle` |
| `--xh-input-group-item-divider` | `item`<br>`root` | `border-inline-end`<br>`border-inline-start` | `not(:first-child)`<br>`not(:has(+ [data-scope='input-group'][data-part='item'])`<br>`not(:last-child)` | `--xh-border-default` |
| `--xh-input-group-item-fg` | `item` | `color` | `default` | `--xh-fg-default` |
| `--xh-input-group-item-font-size` | `item` | `font-size` | `default` | `--xh-_input-group-font-size` |
| `--xh-input-group-item-h` | `item` | `block-size` | `default` | `--xh-_input-group-h` |
| `--xh-input-group-item-px` | `item` | `padding-inline` | `default` | `--xh-_input-group-px` |
| `--xh-input-group-radius` | `control`<br>`root` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `default`<br>`first-child`<br>`is(*, [data-part='control'], [data-part='root'])`<br>`is([data-part='control'], [data-part='root'])`<br>`last-child` | `--xh-shape-control` |
| `--xh-input-group-shadow` | `root` | `box-shadow` | `default` | `--xh-_input-group-shadow` |
| `--xh-input-group-w` | `root` | `inline-size` | `default` | `--xh-control-w` |
