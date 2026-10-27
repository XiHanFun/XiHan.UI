# BackTop

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/back-top).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/back-top" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/back-top.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/back-top" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/back-top" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/back-top.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="back-top"`: **`root`** · **`trigger`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-back-top>` |
| Vue components | `XhBackTopRoot` `XhBackTopTrigger` |
| Composable | `useBackTop` |
| State machine | `backTopMachine` |
| Skin | `@xihan-ui/styles/back-top.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `visibilityHeight` | `number` |  |
| `behavior` | `BackTopBehavior` |  |
| `translations` | `Partial<BackTopTranslations>` |  |
| `variant` | `ActionVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onVisibilityChange` | `(details: BackTopVisibilityChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `visibility-change` | `BackTopVisibilityChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhBackTopRoot` | `default` | `BackTopRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhBackTopRoot` | `target` | `() => HTMLElement \| null` |  |
| `XhBackTopRoot` | `children` | `SlotChildren<BackTopRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'visible' \| 'hidden' |
| `trigger` | 'visible' \| 'hidden' |

The following names are internal to the state machine.

**States**: `hidden` · `visible`

**Events**: `SCROLL.RESOLVE` · `TRIGGER.CLICK` · `PRESS.START` · `PRESS.END` · `TRIGGER.RENDERED`

**Guards**: `shouldShow` · `shouldHide`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `visible` | `boolean` |
| `scrollToTop` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `back-top.kbd.activate` |
| `Enter` / `Space` | `back-top.kbd.press` |
| `Tab` / `Shift+Tab` | `back-top.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-label` | translations.trigger |

## Style reference

### Skin

`@xihan-ui/styles/back-top.css` is written against `[data-scope="back-top"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-back-top` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'visible' \| 'hidden' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'visible' \| 'hidden' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'floating' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | props.variant |
| `trigger` | `data-xh-ink-surface` | '' (present only while the condition holds) |
| `trigger` | `data-xh-liquid` | '' |
| `trigger` | `data-xh-material` | 'frosted' \| undefined |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-back-top-bg` | `root`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`variant=outline`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled`<br>`--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest`<br>`--xh-_material-bg`<br>`--xh-_material-bg-focus` |
| `--xh-back-top-bg-active` | `root`<br>`trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`variant=outline` | `--xh-_action-variant-bg-pressed`<br>`--xh-_material-bg-pressed` |
| `--xh-back-top-bg-hover` | `root`<br>`trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`variant=outline` | `--xh-_action-variant-bg-hover`<br>`--xh-_material-bg-hover` |
| `--xh-back-top-border` | `root`<br>`trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`variant=outline` | `--xh-_action-variant-border-disabled`<br>`--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest`<br>`--xh-_material-border` |
| `--xh-back-top-border-hover` | `root`<br>`trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`variant=outline` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed`<br>`--xh-_material-border` |
| `--xh-back-top-fg` | `root`<br>`trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`variant=outline` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest`<br>`--xh-_material-fg` |
| `--xh-back-top-icon-size` | `trigger` | `--xh-icon-size` | `default` | `--xh-_back-top-glyph-size` |
| `--xh-back-top-inset-block` | `root` | `inset-block-end` | `default` | `--xh-space-6` |
| `--xh-back-top-inset-inline` | `root` | `inset-inline-end` | `default` | `--xh-space-6` |
| `--xh-back-top-layer` | `root` | `z-index` | `default` | `--xh-layer-sticky` |
| `--xh-back-top-radius` | `trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` |
| `--xh-back-top-shadow` | `root`<br>`trigger` | `box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:hover, [data-loading])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`variant=outline` | `--xh-_material-shadow`<br>`none` |
| `--xh-back-top-size` | `trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=floating` | `--xh-_back-top-size` |
