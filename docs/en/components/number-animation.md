# NumberAnimation

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/number-animation).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/number-animation" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/number-animation.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/number-animation" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/number-animation" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/number-animation.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="number-animation"`: **`root`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-number-animation>` |
| Vue components | `XhNumberAnimation` |
| State machine | `numberAnimationMachine` |
| Skin | `@xihan-ui/styles/number-animation.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `from` | `number` |  |
| `to` | `number` |  |
| `duration` | `number` |  |
| `easing` | `NumberAnimationEasing` |  |
| `precision` | `number` |  |
| `separator` | `string` |  |
| `locale` | `string` |  |
| `formatOptions` | `NumberAnimationFormatOptions` |  |
| `active` | `boolean` |  |
| `size` | `Size` |  |
| `tone` | `Tone` |  |
| `live` | `NumberAnimationLive` |  |
| `onComplete` | `(details: NumberAnimationCompleteDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `complete` | `NumberAnimationCompleteDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhNumberAnimation` | `default` | `NumberAnimationSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhNumberAnimation` | `children` | `SlotChildren<NumberAnimationSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'idle' \| 'running' |

The following names are internal to the state machine.

**States**: `idle` · `running`

**Events**: `RUN.START` · `RUN.STOP` · `RUN.SYNC` · `FRAME` · `RUN.SKIP`

**Guards**: `isSettled` · `isActive`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `phase` | `NumberAnimationPhase` |
| `value` | `number` |
| `text` | `string` |
| `running` | `boolean` |
| `getRootProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/TR/wai-aria-1.2/#status). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-live` | props.live |
| `root` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/number-animation.css` is written against `[data-scope="number-animation"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-number-animation` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'running' |
| `root` | `data-tone` | props.tone |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-number-animation-fg` | `root` | `color` | `default` | `--xh-_tone-fg` |
| `--xh-number-animation-font-size` | `root` | `font-size` | `default` | `--xh-_number-animation-size` |
