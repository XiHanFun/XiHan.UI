# Tag

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/tag).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tag" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tag.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tag" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tag" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tag.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="tag"`: **`root`** · `label` · `close-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-tag>` |
| Vue components | `XhTagCloseTrigger` `XhTagLabel` `XhTagRoot` |
| Composable | `useTag` |
| State machine | `tagMachine` |
| Skin | `@xihan-ui/styles/tag.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `variant` | `TagVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `closable` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `onOpenChange` | `(details: TagOpenChangeDetails) => void` |  |
| `translations` | `Partial<TagTranslations>` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `TagOpenChangeDetails` |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSED` · `PRESS.START` · `PRESS.END` · `ROOT.RENDERED`

**Guards**: `isOpenControlled` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `closable` | `boolean` |
| `disabled` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getCloseTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `tag.kbd.close` |
| `Enter` / `Space` | `tag.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `close-trigger` | `aria-label` | translations.close |

## Style reference

### Skin

`@xihan-ui/styles/tag.css` is written against `[data-scope="tag"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-tag` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-pressed` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-ink-surface` | '' (present only while the condition holds) |
| `close-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `close-trigger` | `data-pressed` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-tag-bg` | `root` | `--xh-ink-surface`<br>`background` | `default`<br>`disabled`<br>`is(:not([data-variant])`<br>`not([data-disabled])`<br>`not([data-tone], [data-disabled])`<br>`tone`<br>`variant`<br>`variant=outline`<br>`variant=solid`<br>`variant=subtle`<br>`where([data-xh-field-chrome][data-variant='subtle']:not(:focus-within)`<br>`xh-field-chrome`<br>`xh-ink-surface` | `--xh-_tone`<br>`--xh-_tone-subtle`<br>`--xh-bg-brand`<br>`--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-tag-bg-disabled` | `root` | `--xh-ink-surface`<br>`background` | `disabled`<br>`tone`<br>`variant=solid`<br>`xh-ink-surface` | `--xh-bg-muted`<br>`--xh-bg-muted-opaque` |
| `--xh-tag-border` | `root` | `border`<br>`border-color` | `default`<br>`disabled`<br>`is(:not([data-variant])`<br>`not([data-disabled])`<br>`not([data-tone], [data-disabled])`<br>`tone`<br>`variant`<br>`variant=outline`<br>`variant=subtle`<br>`where([data-xh-field-chrome][data-variant='subtle']:not(:focus-within)`<br>`xh-field-chrome` | `--xh-_tone-border-control`<br>`--xh-border-default`<br>`transparent` |
| `--xh-tag-border-disabled` | `root` | `border-color` | `disabled`<br>`tone` | `--xh-border-default` |
| `--xh-tag-close-bg-active` | `close-trigger`<br>`root` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`is(:not([data-variant])`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-tone], [data-disabled])`<br>`pressed`<br>`tone`<br>`variant`<br>`variant=outline`<br>`variant=subtle`<br>`where([data-xh-field-chrome][data-variant='subtle']:not(:focus-within)`<br>`xh-field-chrome` | `--xh-bg-subtle-hover`<br>`color-mix(in oklab, currentColor 22%, transparent)` |
| `--xh-tag-close-bg-hover` | `close-trigger`<br>`root` | `background` | `disabled`<br>`hover`<br>`is(:not([data-variant])`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-tone], [data-disabled])`<br>`tone`<br>`variant`<br>`variant=outline`<br>`variant=subtle`<br>`where([data-xh-field-chrome][data-variant='subtle']:not(:focus-within)`<br>`xh-field-chrome` | `--xh-bg-subtle`<br>`color-mix(in oklab, currentColor 14%, transparent)` |
| `--xh-tag-close-fg` | `close-trigger` | `color` | `default` | `currentColor` |
| `--xh-tag-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-tag-close-size` | `close-trigger` | `block-size`<br>`inline-size`<br>`inset` | `default` | `--xh-control-indicator-size` |
| `--xh-tag-fg` | `root` | `color` | `default`<br>`is(:not([data-variant])`<br>`tone`<br>`variant`<br>`variant=ghost`<br>`variant=outline`<br>`variant=solid`<br>`variant=subtle` | `--xh-_tone-fg`<br>`--xh-_tone-on`<br>`--xh-fg-default`<br>`--xh-fg-on-brand` |
| `--xh-tag-font-size` | `root` | `font-size` | `default` | `--xh-_tag-font-size` |
| `--xh-tag-font-weight` | `root` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-tag-gap` | `root` | `gap` | `default` | `--xh-_tag-gap` |
| `--xh-tag-h` | `root` | `min-block-size` | `default` | `--xh-_tag-h` |
| `--xh-tag-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` |
| `--xh-tag-px` | `root` | `padding-inline` | `default` | `--xh-_tag-px` |
| `--xh-tag-py` | `root` | `padding-block` | `default` | `--xh-_tag-py` |
| `--xh-tag-radius` | `root` | `border-radius` | `default`<br>`where([data-xh-field-chrome])`<br>`xh-field-chrome` | `--xh-shape-control`<br>`--xh-shape-inset` |
| `--xh-tag-shadow` | `root` | `box-shadow` | `default`<br>`variant=solid` | `none` |
