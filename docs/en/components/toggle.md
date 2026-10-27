# Toggle

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/toggle).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toggle" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toggle.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toggle" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toggle" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toggle.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="toggle"`: **`root`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-toggle>` |
| Vue components | `XhToggle` |
| Composable | `useToggle` |
| State machine | `toggleMachine` |
| Skin | `@xihan-ui/styles/toggle.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `pressed` | `boolean` |  |
| `defaultPressed` | `boolean` |  |
| `disabled` | `boolean` |  |
| `variant` | `ActionVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `iconOnly` | `boolean` |  |
| `fullWidth` | `boolean` |  |
| `onPressedChange` | `(details: TogglePressedChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `pressed-change` | `TogglePressedChangeDetails` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhToggle` | `children` | `ReactNode` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'on' \| 'off' |

The following names are internal to the state machine.

**States**: `off` · `on`

**Events**: `TOGGLE` · `CONTROLLED.ON` · `CONTROLLED.OFF` · `PRESS.START` · `PRESS.END`

**Guards**: `isPressedControlled` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `pressed` | `boolean` |
| `setPressed` | `(next: boolean) => void` |
| `getRootProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Space` / `Enter` | `toggle.kbd.toggle` |
| `Space` / `Enter` | `toggle.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-pressed` | 'true' \| 'false' |

## Style reference

### Skin

`@xihan-ui/styles/toggle.css` is written against `[data-scope="toggle"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-toggle` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-full-width` | '' (present only while the condition holds) |
| `root` | `data-icon-only` | '' (present only while the condition holds) |
| `root` | `data-pressed` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'on' \| 'off' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-action-control` | '' |
| `root` | `data-xh-action-display` | 'always' |
| `root` | `data-xh-action-profile` | 'icon' \| 'text' |
| `root` | `data-xh-action-size` | props.size |
| `root` | `data-xh-action-variant` | 'solid' \| 'ghost' \| props.variant |
| `root` | `data-xh-ink-surface` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-toggle-bg` | `root` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` |
| `--xh-toggle-bg-active` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-toggle-bg-disabled` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled` |
| `--xh-toggle-bg-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-toggle-bg-on` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`focus-visible`<br>`not([data-variant='solid'])`<br>`state=on`<br>`variant=solid`<br>`xh-ink-surface` | `--xh-_tone-subtle` |
| `--xh-toggle-bg-on-active` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-variant='solid'])`<br>`pressed`<br>`state=on`<br>`variant=solid` | `--xh-_tone-subtle-active` |
| `--xh-toggle-bg-on-disabled` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`not([data-variant='solid'])`<br>`state=on`<br>`variant=solid`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest`<br>`--xh-_toggle-bg-on` |
| `--xh-toggle-bg-on-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-variant='solid'])`<br>`state=on`<br>`variant=solid` | `--xh-_tone-subtle-hover` |
| `--xh-toggle-border` | `root` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed`<br>`--xh-_action-variant-border-rest` |
| `--xh-toggle-border-disabled` | `root` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` |
| `--xh-toggle-border-on` | `root` | `border`<br>`border-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-variant='solid'])`<br>`pressed`<br>`state=on`<br>`variant=outline`<br>`variant=solid` | `--xh-_tone-border-control`<br>`transparent` |
| `--xh-toggle-fg` | `root` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-toggle-fg-disabled` | `root` | `color` | `disabled` | `--xh-_action-variant-fg-disabled` |
| `--xh-toggle-fg-on` | `root` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-variant='solid'])`<br>`pressed`<br>`state=on`<br>`variant=solid` | `--xh-_tone-fg` |
| `--xh-toggle-fg-on-disabled` | `root` | `color` | `disabled`<br>`not([data-variant='solid'])`<br>`state=on`<br>`variant=solid` | `--xh-_action-variant-fg-rest`<br>`--xh-_toggle-fg-on` |
| `--xh-toggle-font-size` | `root` | `font-size` | `default` | `--xh-_action-profile-font-size` |
| `--xh-toggle-font-weight` | `root` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-toggle-gap` | `root` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-toggle-h` | `root` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-toggle-icon-size` | `*`<br>`root` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-toggle-px` | `root` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-toggle-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-toggle-shadow` | `root` | `box-shadow` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:hover, [data-loading])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `none` |
