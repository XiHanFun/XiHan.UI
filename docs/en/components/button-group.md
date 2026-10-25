# ButtonGroup

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/button-group).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/button-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/button-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/button-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/button-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/button-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="button-group"`: **`root`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-button-group>` |
| Vue components | `XhButtonGroup` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/button-group.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `disabled` | `boolean` |  |
| `fullWidth` | `boolean` |  |
| `orientation` | `'horizontal' \| 'vertical'` |  |
| `separators` | `boolean` |  |
| `size` | `Size` |  |
| `tone` | `Tone` |  |
| `variant` | `ActionVariant` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` |
| `disabled` | `boolean` |
| `separators` | `boolean` |
| `variant` | `ActionVariant` |
| `tone` | `Tone \| undefined` |
| `size` | `Size \| undefined` |
| `getRootProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `role` | 'group' |

## Style reference

### Skin

`@xihan-ui/styles/button-group.css` is written against `[data-scope="button-group"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-button-group` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-full-width` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-button-group-outline-color` | `root` | `border` | `variant=outline` | `--xh-_tone-border-control` |
| `--xh-button-group-radius` | `root` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `first-child`<br>`last-child`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`variant=outline` | `--xh-shape-control` |
| `--xh-button-group-separator-color` | `root` | `background` | `xh-button-group-separator` | `--xh-fg-default` |
| `--xh-button-group-separator-color-disabled` | `root` | `background` | `disabled`<br>`xh-button-group-separator` | `--xh-border-subtle` |
| `--xh-button-group-separator-opacity` | `root` | `opacity` | `xh-button-group-separator` | `--xh-control-separator-opacity` |
| `--xh-button-group-separator-opacity-disabled` | `root` | `opacity` | `disabled`<br>`xh-button-group-separator` | `--xh-control-separator-disabled-opacity` |
| `--xh-button-group-separator-radius` | `root` | `border-radius` | `xh-button-group-separator` | `--xh-shape-pill` |
| `--xh-button-group-separator-size` | `root` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical`<br>`xh-button-group-separator` | `--xh-_group-separator-size` |
| `--xh-button-group-separator-thickness` | `root` | `block-size`<br>`inline-size`<br>`margin-block-start`<br>`margin-inline-start` | `orientation=horizontal`<br>`orientation=vertical`<br>`xh-button-group-separator` | `--xh-stroke-thin` |
