# Skeleton

Feedback component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/skeleton).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/skeleton" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/skeleton.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/skeleton" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/skeleton" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/skeleton.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="skeleton"`: **`root`** · **`item`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-skeleton>` |
| Vue components | `XhSkeletonItem` `XhSkeletonRoot` |
| State machine | `skeletonMachine` |
| Skin | `@xihan-ui/styles/skeleton.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `animation` | `SkeletonAnimation` |  |
| `loading` | `boolean` |  |
| `shape` | `SkeletonShape` |  |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhSkeletonItem` | `shape` | `SkeletonShape` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'loading' \| 'loaded' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `ROOT.RENDERED`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `loading` | `boolean` |
| `getRootProps` | `() => T['element']` |
| `getItemProps` | `(item?: SkeletonItemProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `item` | `aria-hidden` | 'true' \| undefined |

## Style reference

### Skin

`@xihan-ui/styles/skeleton.css` is written against `[data-scope="skeleton"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-skeleton` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-animation` | props.animation |
| `root` | `data-state` | 'loading' \| 'loaded' |
| `item` | `data-shape` | item.shape |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-skeleton-bg` | `item` | `background-color` | `default` | `--xh-bg-subtle` |
| `--xh-skeleton-circle-radius` | `item` | `border-radius` | `shape=circle` | `--xh-shape-circle` |
| `--xh-skeleton-circle-size` | `item` | `inline-size` | `shape=circle` | `--xh-control-h-lg` |
| `--xh-skeleton-duration` | `item` | `animation` | `default` | `--xh-motion-loop-shimmer` |
| `--xh-skeleton-gap` | `root` | `gap` | `default` | `--xh-space-4` |
| `--xh-skeleton-pulse-duration` | `item`<br>`root` | `animation` | `animation=pulse` | `--xh-motion-loop-shimmer` |
| `--xh-skeleton-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-skeleton-rect-block-size` | `item` | `min-block-size` | `shape=rect` | `--xh-control-h-lg` |
| `--xh-skeleton-rect-radius` | `item` | `border-radius` | `shape=rect` | `--xh-shape-surface` |
| `--xh-skeleton-sheen` | `item` | `background-image` | `default` | `--xh-bg-subtle` |
| `--xh-skeleton-text-block-size` | `item` | `block-size` | `shape=text` | `--xh-text-body-line-h` |
| `--xh-skeleton-text-radius` | `item` | `border-radius` | `shape=text` | `--xh-shape-inset` |
