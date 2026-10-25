# Kbd

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/kbd).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/kbd" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/kbd.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/kbd" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/kbd" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/kbd.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="kbd"`: **`root`** · `key`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-kbd>` |
| Vue components | `XhKbd` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/kbd.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `enabled` | `boolean` |  |
| `keys` | `string[]` | Yes |
| `onHotKey` | `(details: KbdTriggerDetails) => void` |  |
| `platform` | `KbdPlatform` |  |
| `preventDefault` | `boolean` |  |
| `register` | `boolean` |  |
| `target` | `KbdTarget` |  |
| `translations` | `Partial<KbdTranslations>` |  |
| `variant` | `KbdVariant` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `hot-key` | `KbdTriggerDetails` |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `segments` | `readonly HotkeySegment[]` |
| `platform` | `KbdResolvedPlatform` |
| `register` | `boolean` |
| `enabled` | `boolean` |
| `target` | `KbdTarget` |
| `resolveTarget` | `(documentTarget: EventTarget \| null) => EventTarget \| null` |
| `matches` | `(event: KeyboardEvent) => boolean` |
| `handleKeyDown` | `(event: KeyboardEvent) => void` |
| `getRootProps` | `() => T['element']` |
| `getKeyProps` | `(props: KbdKeyProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/TR/uievents/#event-type-keydown). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| the combination given by keys | `kbd.keydown.trigger` |
| the combination given by keys | `kbd.keydown.typing` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | translations.hotkey(names) |
| `root` | `role` | 'img' |
| `key` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/kbd.css` is written against `[data-scope="kbd"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-kbd` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-platform` | resolveKbdPlatform(props.platform) |
| `root` | `data-register` | '' (present only while the condition holds) |
| `root` | `data-variant` | props.variant |
| `key` | `data-key` | segmentOf(value)?.key |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-kbd-bg` | `root` | `background` | `default` | `--xh-bg-subtle` |
| `--xh-kbd-border` | `root` | `border` | `default` | `transparent` |
| `--xh-kbd-fg` | `root` | `color` | `default` | `--xh-fg-muted` |
| `--xh-kbd-fg-disabled` | `root` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-kbd-font` | `root` | `font-family` | `default` | `inherit` |
| `--xh-kbd-font-size` | `root` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-kbd-font-weight` | `root` | `font-weight` | `default` | `--xh-font-weight-regular` |
| `--xh-kbd-gap` | `root` | `gap` | `default` | `--xh-space-1` |
| `--xh-kbd-h` | `root` | `block-size` | `default` | `--xh-space-6` |
| `--xh-kbd-min-w` | `root` | `min-inline-size` | `default` | `--xh-space-6` |
| `--xh-kbd-px` | `root` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-kbd-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` |
