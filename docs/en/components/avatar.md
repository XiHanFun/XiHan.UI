# Avatar

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/avatar).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/avatar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/avatar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/avatar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/avatar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/avatar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="avatar"`: `root` · `image` · **`fallback`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-avatar>` |
| Vue components | `XhAvatarFallback` `XhAvatarImage` `XhAvatarRoot` |
| Composable | `useAvatar` |
| State machine | `avatarMachine` |
| Skin | `@xihan-ui/styles/avatar.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `src` | `string` |  |
| `alt` | `string` |  |
| `size` | `Size` |  |
| `tone` | `Tone` |  |
| `fallbackDelay` | `number` |  |
| `onStatusChange` | `(details: AvatarStatusChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `status-change` | `AvatarStatusChangeDetails` |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `image` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `fallback` | 'idle' \| 'loading' \| 'loaded' \| 'error' |

The following names are internal to the state machine.

**States**: `idle` · `loading` · `loaded` · `error`

**Events**: `SRC.CHANGE` · `IMAGE.LOAD` · `IMAGE.ERROR` · `FALLBACK.DUE` · `FALLBACK.RENDERED`

**Guards**: `hasSrc`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `status` | `AvatarStatus` |
| `loaded` | `boolean` |
| `getRootProps` | `() => T['element']` |
| `getImageProps` | `() => T['img']` |
| `getFallbackProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/avatar.css` is written against `[data-scope="avatar"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-avatar` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `root` | `data-tone` | props.tone |
| `image` | `data-state` | 'idle' \| 'loading' \| 'loaded' \| 'error' |
| `fallback` | `data-state` | 'idle' \| 'loading' \| 'loaded' \| 'error' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-avatar-bg` | `root` | `background` | `default`<br>`tone` | `--xh-_tone-subtle`<br>`--xh-bg-subtle-active-opaque` |
| `--xh-avatar-fg` | `root` | `color` | `default`<br>`tone` | `--xh-_tone-fg`<br>`--xh-fg-default` |
| `--xh-avatar-font-size` | `root` | `font-size` | `default` | `--xh-_avatar-font-size` |
| `--xh-avatar-font-weight` | `root` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-avatar-radius` | `root` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-avatar-size` | `root` | `block-size`<br>`font-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-h-lg`<br>`--xh-control-h-md`<br>`--xh-control-h-sm` |
