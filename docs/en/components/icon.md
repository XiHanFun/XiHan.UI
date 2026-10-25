# Icon

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/icon).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/icon" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/icon.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/icon" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/icon" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/icon.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="icon"`: **`root`** · `glyph`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-icon>` |
| Vue components | `XhIcon` |
| Composable | `useIcon` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/icon.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `flip` | `IconFlip` |  |
| `frame` | `ActionVariant` |  |
| `icon` | `IconRecord` |  |
| `label` | `string` |  |
| `rotate` | `IconRotate \| string` |  |
| `size` | `IconSize` |  |
| `tone` | `Tone` |  |
| `weight` | `IconWeight` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `label` | `string \| undefined` |
| `decorative` | `boolean` |
| `nodes` | `readonly IconNode[]` |
| `content` | `IconRecord \| undefined` |
| `getRootProps` | `() => T['element']` |
| `getGlyphProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-hidden` | 'true' \| undefined |
| `root` | `aria-label` | props.label \| undefined |
| `root` | `role` | undefined \| 'img' |

## Style reference

### Skin

`@xihan-ui/styles/icon.css` is written against `[data-scope="icon"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-icon` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-flip` | props.flip |
| `root` | `data-frame` | props.frame |
| `root` | `data-icon` | icon?.name |
| `root` | `data-rotate` | rotateAttr(props.rotate) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-weight` | props.weight |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-icon-fg` | `root` | `color` | `default`<br>`frame=ghost`<br>`frame=outline`<br>`frame=solid`<br>`frame=subtle`<br>`tone` | `--xh-_tone-fg`<br>`--xh-_tone-on`<br>`--xh-fg-default`<br>`--xh-fg-on-brand`<br>`currentColor` |
| `--xh-icon-frame-bg` | `root` | `background` | `frame=solid`<br>`frame=subtle`<br>`tone` | `--xh-_tone`<br>`--xh-_tone-subtle`<br>`--xh-bg-brand`<br>`--xh-bg-subtle` |
| `--xh-icon-frame-border` | `root` | `border-color` | `frame=outline`<br>`tone` | `--xh-_tone-border`<br>`--xh-border-default` |
| `--xh-icon-frame-glyph-size` | `root` | `padding` | `frame`<br>`size=lg`<br>`size=sm` | `--xh-_icon-glyph-step`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-sm` |
| `--xh-icon-frame-radius` | `root` | `border-radius` | `frame` | `--xh-shape-circle` |
| `--xh-icon-frame-shadow` | `root` | `box-shadow` | `frame=solid`<br>`tone` | `--xh-_highlight-brand`<br>`--xh-_highlight-tone` |
| `--xh-icon-frame-size` | `root` | `block-size`<br>`inline-size`<br>`padding` | `frame`<br>`size=lg`<br>`size=sm` | `--xh-_icon-frame-step`<br>`--xh-control-h-lg`<br>`--xh-control-h-sm` |
| `--xh-icon-shift` | `root` | `vertical-align` | `default` | `--xh-glyph-baseline-shift` |
| `--xh-icon-size` | `autoplay-trigger`<br>`branch-error`<br>`branch-indicator`<br>`branch-loading`<br>`branch-trigger`<br>`cancel-trigger`<br>`caps-lock-indicator`<br>`clear-trigger`<br>`close-trigger`<br>`column-header`<br>`comment-trigger`<br>`condition-delete-trigger`<br>`control`<br>`decrement-trigger`<br>`dismiss-trigger`<br>`edit-trigger`<br>`ellipsis-trigger`<br>`expand-trigger`<br>`first-trigger`<br>`flip-horizontal-trigger`<br>`flip-vertical-trigger`<br>`group-delete-trigger`<br>`increment-trigger`<br>`indicator`<br>`item`<br>`item-close-trigger`<br>`item-delete-trigger`<br>`item-indicator`<br>`item-preview`<br>`last-trigger`<br>`line-content`<br>`line-fold-trigger`<br>`loading`<br>`move-down-trigger`<br>`move-up-trigger`<br>`next-trigger`<br>`next-year-trigger`<br>`overflow-trigger`<br>`path`<br>`path-item`<br>`prev-trigger`<br>`prev-year-trigger`<br>`reset-trigger`<br>`root`<br>`rotate-left-trigger`<br>`rotate-right-trigger`<br>`scroll-to-end-trigger`<br>`separator`<br>`sort-trigger`<br>`status`<br>`submit-trigger`<br>`to-source-trigger`<br>`to-target-trigger`<br>`toolbar`<br>`trend`<br>`trigger`<br>`trigger-indicator`<br>`truncation`<br>`viewport`<br>`visibility-trigger`<br>`window-state-trigger`<br>`zoom-in-trigger`<br>`zoom-out-trigger` | `block-size`<br>`column-gap`<br>`inline-size` | `@media (min-width: 640px)`<br>`default`<br>`direction`<br>`empty`<br>`error`<br>`folded`<br>`has(> [data-part='unread-count']:only-child)`<br>`is([data-part='edit-trigger'], [data-part='submit-trigger'], [data-part='cancel-trigger'])`<br>`mode=send`<br>`mode=stop`<br>`not([data-part='status'])`<br>`not([data-variant='dot'])`<br>`preset=toast`<br>`size=2xl`<br>`size=3xl`<br>`size=4xl`<br>`size=lg`<br>`size=md`<br>`size=sm`<br>`size=text`<br>`size=xl`<br>`sort=asc`<br>`sort=desc`<br>`state=completed`<br>`state=paused`<br>`state=running`<br>`state=visible`<br>`variant=dot` | `--xh-_color-swatch-picker-mark`<br>`--xh-glyph-size-2xl`<br>`--xh-glyph-size-3xl`<br>`--xh-glyph-size-4xl`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm`<br>`--xh-glyph-size-text`<br>`--xh-glyph-size-xl` |
| `--xh-icon-stroke` | `root` | `stroke-width` | `default`<br>`weight=bold`<br>`weight=light` | `--xh-glyph-stroke-bold`<br>`--xh-glyph-stroke-light`<br>`--xh-glyph-stroke-regular` |
