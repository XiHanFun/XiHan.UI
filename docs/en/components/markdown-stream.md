# MarkdownStream <Badge type="info" text="alpha" />

AI chat component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/markdown-stream).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/markdown-stream" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/markdown-stream.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/markdown-stream" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/markdown-stream" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/markdown-stream.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="markdown-stream"`: **`root`** · **`content`** · `block` · `live-region`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-markdown-stream>` |
| Vue components | `XhMarkdownStreamContent` `XhMarkdownStreamLiveRegion` `XhMarkdownStreamRoot` |
| Composable | `useMarkdownStream` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/markdown-stream.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `announce` | `'off' \| 'polite' \| 'assertive'` |  |
| `blocks` | `readonly MarkdownBlock[]` | Yes |
| `caret` | `boolean` |  |
| `size` | `Size` |  |
| `streaming` | `boolean` |  |
| `translations` | `Partial<MarkdownStreamTranslations>` |  |

### MarkdownBlock

Elements of `blocks`.

| Field | Type | Required |
| --- | --- | --- |
| `key` | `string` | Yes |
| `kind` | `'markdown' \| 'code' \| 'math' \| 'html'` | Yes |
| `html` | `string` | Yes |
| `complete` | `boolean` | Yes |
| `lang` | `string` |  |
| `source` | `string` |  |
| `inlines` | `readonly MarkdownInline[]` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `inline-mount` | `CustomEvent` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhMarkdownStreamContent` | `block` | `MarkdownStreamBlockSlotProps` |
| `XhMarkdownStreamContent` | `citation` | `MarkdownStreamCitationSlotProps` |
| `XhMarkdownStreamContent` | `math` | `MarkdownStreamMathSlotProps` |
| `XhMarkdownStreamRoot` | `default` | `MarkdownStreamRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhMarkdownStreamContent` | `children` | `SlotChildren<MarkdownStreamBlockSlotProps>` |  |
| `XhMarkdownStreamContent` | `renderCitation` | `(props: MarkdownStreamCitationSlotProps) => ReactNode` |  |
| `XhMarkdownStreamContent` | `renderMath` | `(props: MarkdownStreamMathSlotProps) => ReactNode` |  |
| `XhMarkdownStreamRoot` | `children` | `SlotChildren<MarkdownStreamRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'streaming' \| 'complete' |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `blocks` | `readonly MarkdownBlock[]` |
| `streaming` | `boolean` |
| `announcement` | `string \| undefined` |
| `getRootProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getBlockProps` | `(props: { block: MarkdownBlock }) => T['element']` |
| `getLiveRegionProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
|  | `markdown-stream.kbd.none` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'assertive' \| 'polite' |
| `live-region` | `role` | 'alert' \| 'status' |

## Style reference

### Skin

`@xihan-ui/styles/markdown-stream.css` is written against `[data-scope="markdown-stream"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-markdown-stream` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-caret` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'streaming' \| 'complete' |
| `block` | `data-caret` | '' (present only while the condition holds) |
| `block` | `data-complete` | '' (present only while the condition holds) |
| `block` | `data-kind` | block.kind |
| `block` | `data-lang` | block.lang |
| `block` | `data-live` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-markdown-stream-caret-bg` | `block`<br>`root` | `background` | `caret` | `--xh-fg-default` |
| `--xh-markdown-stream-caret-duration` | `root` | `animation` | `caret` | `--xh-motion-loop-caret` |
| `--xh-markdown-stream-caret-enter-duration` | `block` | `animation` | `caret` | `--xh-motion-duration-enter` |
| `--xh-markdown-stream-caret-gap` | `block`<br>`root` | `margin-inline-start` | `caret` | `0.1em` |
| `--xh-markdown-stream-caret-h` | `block`<br>`root` | `block-size` | `caret` | `1.05em` |
| `--xh-markdown-stream-caret-radius` | `block`<br>`root` | `border-radius` | `caret` | `--xh-shape-inset` |
| `--xh-markdown-stream-caret-shift` | `block`<br>`root` | `translate` | `caret` | `-0.5px` |
| `--xh-markdown-stream-caret-w` | `block`<br>`root` | `inline-size` | `caret` | `--xh-stroke-thick` |
| `--xh-markdown-stream-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-markdown-stream-font-size` | `root` | `font-size` | `default` | `--xh-_markdown-stream-font-size` |
| `--xh-markdown-stream-gap` | `content` | `gap` | `default` | `--xh-_markdown-stream-gap` |
| `--xh-markdown-stream-leading` | `root` | `line-height` | `default` | `--xh-text-prose-leading` |
| `--xh-markdown-stream-mono` | `block` | `font-family` | `kind=code`<br>`kind=math` | `--xh-font-family-mono` |
