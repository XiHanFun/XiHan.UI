# Switch

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/switch).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/switch" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/switch.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/switch" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/switch" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/switch.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="switch"`: **`root`** · `thumb` · `hidden-input` · `label` · `text`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-switch>` |
| Vue components | `XhSwitch` |
| Composable | `useSwitch` |
| State machine | `switchMachine` |
| Skin | `@xihan-ui/styles/switch.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `checked` | `boolean` |  |
| `defaultChecked` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `loading` | `boolean` |  |
| `name` | `string` |  |
| `value` | `string` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onCheckedChange` | `(details: SwitchCheckedChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `checked-change` | `SwitchCheckedChangeDetails` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhSwitch` | `children` | `ReactNode` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'checked' \| 'unchecked' |
| `thumb` | 'checked' \| 'unchecked' |
| `label` | 'checked' \| 'unchecked' |
| `text` | 'checked' \| 'unchecked' |

The following names are internal to the state machine.

**States**: `off` · `on`

**Events**: `TOGGLE` · `CONTROLLED.ON` · `CONTROLLED.OFF` · `FORM.RESET` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `CLICK.SWALLOW` · `PRESS.START` · `PRESS.END`

**Guards**: `isCheckedControlled` · `defaultsToChecked` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `checked` | `boolean` |
| `loading` | `boolean` |
| `setChecked` | `(next: boolean) => void` |
| `getRootProps` | `() => T['button']` |
| `getThumbProps` | `() => T['element']` |
| `getHiddenInputProps` | `() => T['input']` |
| `getLabelProps` | `() => T['label']` |
| `getTextProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/switch/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Space` / `Enter` | `switch.kbd.toggle` |
| `Space` / `Enter` | `switch.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-checked` | 'true' \| 'false' |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'switch' |

## Style reference

### Skin

`@xihan-ui/styles/switch.css` is written against `[data-scope="switch"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-switch` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-pressed` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'checked' \| 'unchecked' |
| `root` | `data-tone` | props.tone |
| `root` | `data-xh-action-control` | '' |
| `root` | `data-xh-action-display` | 'always' |
| `root` | `data-xh-action-profile` | 'text' |
| `root` | `data-xh-action-size` | props.size |
| `root` | `data-xh-action-variant` | 'outline' |
| `thumb` | `data-animating` | '' (present only while the condition holds) |
| `thumb` | `data-disabled` | '' (present only while the condition holds) |
| `thumb` | `data-dragging` | '' (present only while the condition holds) |
| `thumb` | `data-loading` | '' (present only while the condition holds) |
| `thumb` | `data-state` | 'checked' \| 'unchecked' |
| `thumb` | `data-xh-loading-ring` | '' |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `label` | `data-size` | props.size |
| `label` | `data-state` | 'checked' \| 'unchecked' |
| `text` | `data-disabled` | '' (present only while the condition holds) |
| `text` | `data-state` | 'checked' \| 'unchecked' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-switch-bg` | `root` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`xh-ink-surface` | `--xh-bg-subtle-active` |
| `--xh-switch-bg-checked` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`xh-ink-surface` | `--xh-_switch-accent` |
| `--xh-switch-bg-checked-pressed` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=checked` | `--xh-_tone-active` |
| `--xh-switch-bg-checked-readonly` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`xh-ink-surface` | `--xh-bg-subtle-active` |
| `--xh-switch-bg-disabled` | `root` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`xh-ink-surface` | `--xh-bg-subtle` |
| `--xh-switch-bg-pressed` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_switch-track-bg` |
| `--xh-switch-border` | `root` | `box-shadow` | `contrast=more`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:hover, [data-loading])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=unchecked`<br>`where([data-contrast='more'])` | `--xh-border-strong`<br>`transparent` |
| `--xh-switch-border-checked` | `root` | `box-shadow` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:hover, [data-loading])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=checked` | `--xh-_switch-accent` |
| `--xh-switch-border-checked-readonly` | `root` | `box-shadow` | `contrast=more`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:hover, [data-loading])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`where([data-contrast='more'])` | `--xh-border-control`<br>`--xh-border-strong` |
| `--xh-switch-border-disabled` | `root` | `box-shadow` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:hover, [data-loading])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-default` |
| `--xh-switch-border-invalid` | `root` | `box-shadow` | `disabled`<br>`focus-visible`<br>`hover`<br>`invalid`<br>`is(:active, [data-pressed])`<br>`is(:hover, [data-loading])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-invalid` |
| `--xh-switch-fg` | `root` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-switch-fg-checked` | `root` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=checked` | `--xh-_tone-on` |
| `--xh-switch-fg-checked-readonly` | `root` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`state=checked` | `--xh-fg-default` |
| `--xh-switch-fg-disabled` | `root` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-disabled` |
| `--xh-switch-label-fg` | `label` | `color` | `default` | `--xh-fg-default` |
| `--xh-switch-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` |
| `--xh-switch-label-font-size` | `label` | `font-size` | `default` | `--xh-_switch-label-font-size` |
| `--xh-switch-label-gap` | `label` | `gap` | `default` | `--xh-control-gap-md` |
| `--xh-switch-label-leading` | `label` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-switch-loading-duration` | `thumb` | `animation` | `xh-loading-ring` | `--xh-motion-loop-spin` |
| `--xh-switch-loading-fg` | `thumb` | `border`<br>`border-color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`motion=reduce`<br>`where([data-motion='reduce'])`<br>`xh-loading-ring`<br>`xh-loading-ring=overlay` | `--xh-_switch-accent` |
| `--xh-switch-radius` | `root` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-switch-thumb` | `thumb` | `background` | `default` | `--xh-bg-surface-raised` |
| `--xh-switch-thumb-border` | `thumb` | `border` | `default` | `--xh-border-default` |
| `--xh-switch-thumb-fg` | `thumb` | `color` | `default` | `--xh-fg-default` |
| `--xh-switch-thumb-fg-disabled` | `root`<br>`thumb` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-switch-thumb-press-stretch` | `root`<br>`thumb` | `inline-size`<br>`translate` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked` | `--xh-motion-distance-sm` |
| `--xh-switch-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-switch-thumb-shadow` | `thumb` | `box-shadow` | `default` | `--xh-elevation-raised` |
| `--xh-switch-thumb-shadow-disabled` | `root`<br>`thumb` | `box-shadow` | `disabled` | `none` |
| `--xh-switch-thumb-shadow-pressed` | `root`<br>`thumb` | `box-shadow` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly` | `none` |
| `--xh-switch-thumb-shadow-readonly` | `root`<br>`thumb` | `box-shadow` | `readonly` | `none` |
