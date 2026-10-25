# Button

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/button).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/button" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/button.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/vue/src/components/button.ts" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/react/src/components/button.tsx" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/button.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="button"`: **`root`** · `label` · `indicator` · `prefix` · `suffix`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-button>` |
| Vue components | `XhButton` `XhButtonIndicator` `XhButtonLabel` `XhButtonPrefix` `XhButtonSuffix` |
| State machine | `buttonMachine` |
| Skin | `@xihan-ui/styles/button.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `type` | `'button' \| 'submit' \| 'reset'` |  |
| `disabled` | `boolean` |  |
| `loading` | `boolean` |  |
| `variant` | `ActionVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `iconOnly` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `ariaLabelledby` | `string` |  |
| `fullWidth` | `boolean` |  |
| `as` | `ButtonElement` |  |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhButton` | `href` | `ComponentPropsWithRef<'a'>['href']` |  |
| `XhButton` | `target` | `ComponentPropsWithRef<'a'>['target']` |  |
| `XhButton` | `rel` | `ComponentPropsWithRef<'a'>['rel']` |  |
| `XhButton` | `download` | `ComponentPropsWithRef<'a'>['download']` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `PRESS.START` · `PRESS.END`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `disabled` | `boolean` |
| `loading` | `boolean` |
| `getRootProps` | `() => T['button']` |
| `getLabelProps` | `() => T['element']` |
| `getIndicatorProps` | `() => T['element']` |
| `getPrefixProps` | `() => T['element']` |
| `getSuffixProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `button.kbd.activate` |
| `Enter` / `Space` | `button.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-disabled` | 'true' \| undefined |
| `indicator` | `aria-hidden` | 'true' |
| `prefix` | `aria-hidden` | 'true' |
| `suffix` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/button.css` is written against `[data-scope="button"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-button` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-full-width` | '' (present only while the condition holds) |
| `root` | `data-icon-only` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-pressed` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-action-control` | '' |
| `root` | `data-xh-action-display` | 'always' |
| `root` | `data-xh-action-profile` | 'icon' \| 'text' |
| `root` | `data-xh-action-size` | props.size |
| `root` | `data-xh-action-variant` | props.variant |
| `root` | `data-xh-ink-surface` | '' (present only while the condition holds) |
| `indicator` | `data-loading` | '' (present only while the condition holds) |
| `indicator` | `data-xh-loading-ring` | 'overlay' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-button-bg` | `root` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`loading`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-loading`<br>`--xh-_action-variant-bg-rest` |
| `--xh-button-bg-active` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-button-bg-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-button-fg` | `root` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-loading`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-button-font-size` | `root` | `font-size` | `default` | `--xh-_button-group-font-size` |
| `--xh-button-font-weight` | `root` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-button-gap` | `root` | `gap` | `default` | `--xh-_button-group-gap` |
| `--xh-button-glint-duration` | `root` | `animation` | `@media (hover: hover) and (pointer: fine) and (forced-colors: none)`<br>`disabled`<br>`hover`<br>`loading`<br>`material=liquid`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`where([data-material='liquid'])`<br>`xh-action-variant=solid` | `--xh-motion-duration-glint` |
| `--xh-button-h` | `root` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_button-group-h` |
| `--xh-button-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-button-px` | `root` | `padding-inline` | `default` | `--xh-_button-group-px` |
| `--xh-button-radius` | `root` | `border-radius` | `default` | `--xh-_button-radius` |
| `--xh-button-shadow` | `root` | `box-shadow` | `default` | `none` |
| `--xh-button-shadow-hover` | `root` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` |
| `--xh-button-spin-duration` | `indicator` | `animation` | `default` | `--xh-motion-loop-spin` |
