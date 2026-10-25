# Marquee

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/marquee).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/marquee" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/marquee.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/marquee" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/marquee" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/marquee.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="marquee"`: **`root`** · **`content`** · `autoplay-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-marquee>` |
| Vue components | `XhMarqueeAutoplayTrigger` `XhMarqueeContent` `XhMarqueeRoot` |
| State machine | `marqueeMachine` |
| Skin | `@xihan-ui/styles/marquee.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `direction` | `MarqueeDirection` |  |
| `speed` | `number` |  |
| `pauseOnHover` | `boolean` |  |
| `paused` | `boolean` |  |
| `defaultPaused` | `boolean` |  |
| `autoFill` | `boolean` |  |
| `fade` | `boolean` |  |
| `translations` | `Partial<MarqueeTranslations>` |  |
| `onPausedChange` | `(details: MarqueePausedChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `paused-change` | `MarqueePausedChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhMarqueeRoot` | `default` | — |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `autoplay-trigger` | 'paused' \| 'running' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `PAUSED.SET` · `PAUSED.TOGGLE` · `PRESS.START` · `PRESS.END` · `SPAN.MEASURE`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `copies` | `number` |
| `paused` | `boolean` |
| `setPaused` | `(paused: boolean) => void` |
| `getRootProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getAutoplayTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `marquee.kbd.activate` |
| `Enter` / `Space` | `marquee.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `autoplay-trigger` | `aria-controls` | scope.partId('marquee', 'content') |
| `autoplay-trigger` | `aria-label` | label.autoplayTriggerPlay \| label.autoplayTriggerPause |

## Style reference

### Skin

`@xihan-ui/styles/marquee.css` is written against `[data-scope="marquee"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-marquee` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `autoplay-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `autoplay-trigger` | `data-state` | 'paused' \| 'running' |
| `autoplay-trigger` | `data-xh-action-control` | '' |
| `autoplay-trigger` | `data-xh-action-display` | 'always' |
| `autoplay-trigger` | `data-xh-action-profile` | 'icon' |
| `autoplay-trigger` | `data-xh-action-size` | 'md' |
| `autoplay-trigger` | `data-xh-action-variant` | 'outline' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-marquee-block-size` | `root` | `block-size` | `orientation=vertical` | `10rem` |
| `--xh-marquee-fade-size` | `root` | `-webkit-mask-image`<br>`mask-image` | `fade` | `--xh-space-6` |
| `--xh-marquee-gap` | `content`<br>`root` | `padding-block-end`<br>`padding-inline-end` | `orientation=vertical`<br>`xh-copy` | `--xh-space-6` |
| `--xh-marquee-icon-size` | `autoplay-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-marquee-span` | `content`<br>`root` | `animation-duration` | `auto-fill`<br>`default` | `--xh-_marquee-measured-span` |
| `--xh-marquee-speed` | `content`<br>`root` | `animation-duration` | `auto-fill`<br>`default` | `60` |
| `--xh-marquee-trigger-bg` | `autoplay-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-bg-surface` |
| `--xh-marquee-trigger-bg-active` | `autoplay-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover-opaque` |
| `--xh-marquee-trigger-bg-hover` | `autoplay-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle-opaque` |
| `--xh-marquee-trigger-inset` | `autoplay-trigger`<br>`root` | `-webkit-mask-image`<br>`-webkit-mask-size`<br>`inset-block-end`<br>`inset-inline-end`<br>`mask-image`<br>`mask-size` | `default`<br>`fade`<br>`has(> [data-scope='marquee'][data-part='autoplay-trigger']:not([hidden])`<br>`orientation=vertical` | `--xh-space-1` |
