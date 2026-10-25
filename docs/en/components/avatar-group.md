# AvatarGroup

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/avatar-group).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/avatar-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/avatar-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/avatar-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/avatar-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/avatar-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="avatar-group"`: **`root`** · `overflow-item`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-avatar-group>` |
| Vue components | `XhAvatarGroupOverflowItem` `XhAvatarGroupRoot` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/avatar-group.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `max` | `number` |  |
| `size` | `Size` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getOverflowItemProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/avatar-group.css` is written against `[data-scope="avatar-group"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-avatar-group` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-avatar-group-font-size` | `overflow-item`<br>`root` | `--xh-avatar-font-size`<br>`font-size` | `default` | `--xh-_avatar-group-half-size` |
| `--xh-avatar-group-font-weight` | `overflow-item` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-avatar-group-overflow-item-bg` | `overflow-item` | `background` | `default` | `--xh-bg-subtle-active-opaque` |
| `--xh-avatar-group-overflow-item-fg` | `overflow-item` | `color` | `default` | `--xh-fg-default` |
| `--xh-avatar-group-overlap` | `root` | `margin-inline-start` | `default` | `--xh-space-2` |
| `--xh-avatar-group-radius` | `overflow-item` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-avatar-group-ring` | `root` | `box-shadow` | `default` | `--xh-bg-surface` |
| `--xh-avatar-group-size` | `overflow-item`<br>`root` | `--xh-avatar-font-size`<br>`--xh-avatar-size`<br>`block-size`<br>`font-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-h-lg`<br>`--xh-control-h-md`<br>`--xh-control-h-sm` |
