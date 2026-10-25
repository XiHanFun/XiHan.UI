# Card

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/card).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/card" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/card.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/card" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/card" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/card.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="card"`: **`root`** · `header` · `title` · `trigger` · `description` · `content` · `footer`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-card>` |
| Vue components | `XhCardContent` `XhCardDescription` `XhCardFooter` `XhCardHeader` `XhCardRoot` `XhCardTitle` `XhCardTrigger` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/card.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `interactive` | `boolean` |  |
| `variant` | `ControlVariant` |  |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhCardRoot` | `default` | — |
| `XhCardRoot` | `title` | — |
| `XhCardRoot` | `description` | — |
| `XhCardRoot` | `content` | — |
| `XhCardRoot` | `footer` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhCardRoot` | `title` | `ReactNode` |  |
| `XhCardRoot` | `description` | `ReactNode` |  |
| `XhCardRoot` | `content` | `ReactNode` |  |
| `XhCardRoot` | `footer` | `ReactNode` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getHeaderProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getFooterProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `card.kbd.activate` |

## Style reference

### Skin

`@xihan-ui/styles/card.css` is written against `[data-scope="card"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-card` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-card-bg` | `root` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-card-bg-hover` | `root` | `background` | `hover`<br>`interactive`<br>`variant=ghost`<br>`variant=subtle` | `--xh-_card-host-bg-hover`<br>`--xh-bg-subtle` |
| `--xh-card-bg-pressed` | `root` | `background` | `active`<br>`interactive`<br>`not(:has([data-scope='card'][data-part='footer']:active)`<br>`variant=ghost`<br>`variant=outline`<br>`variant=subtle` | `--xh-_card-host-bg-pressed`<br>`--xh-bg-subtle-hover`<br>`--xh-bg-subtle-hover-opaque` |
| `--xh-card-border` | `root` | `border` | `default` | `--xh-border-default` |
| `--xh-card-content-fg` | `content` | `color` | `default` | `--xh-fg-muted` |
| `--xh-card-content-font-size` | `content` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-card-content-gap` | `content` | `gap` | `default` | `--xh-space-1` |
| `--xh-card-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-card-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-card-description-leading` | `description` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-card-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-card-font-size` | `root` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-card-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` |
| `--xh-card-gap` | `root` | `gap` | `default` | `0` |
| `--xh-card-glint-duration` | `root` | `animation` | `@media (hover: hover) and (pointer: fine) and (forced-colors: none)`<br>`hover`<br>`interactive`<br>`material=liquid`<br>`where([data-material='liquid'])` | `--xh-motion-duration-glint` |
| `--xh-card-header-border` | `header`<br>`root` | `border-block-end` | `default` | `--xh-border-subtle` |
| `--xh-card-header-h` | `header`<br>`root` | `min-block-size` | `default` | `--xh-surface-header-h` |
| `--xh-card-header-py` | `header`<br>`root` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-card-leading` | `root` | `line-height` | `default` | `--xh-text-body-leading` |
| `--xh-card-p` | `content`<br>`footer`<br>`header`<br>`root` | `padding`<br>`padding-block-end`<br>`padding-inline` | `default` | `--xh-space-4`<br>`--xh-surface-pad-lg` |
| `--xh-card-radius` | `root`<br>`trigger` | `border-radius` | `default`<br>`interactive` | `--xh-shape-surface` |
| `--xh-card-shadow` | `root` | `box-shadow` | `default`<br>`variant=ghost`<br>`variant=subtle` | `--xh-elevation-raised`<br>`none` |
| `--xh-card-shadow-hover` | `root` | `box-shadow` | `hover`<br>`interactive`<br>`variant=outline` | `--xh-elevation-lifted` |
| `--xh-card-title-fg` | `title` | `color` | `default` | `--xh-fg-default` |
| `--xh-card-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` |
| `--xh-card-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` |
| `--xh-card-title-leading` | `title` | `line-height` | `default` | `--xh-leading-tight` |
