# Flex

Layout component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/flex).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/flex" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/flex.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/flex" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/flex" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/flex.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="flex"`: **`root`** · `split`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-flex>` |
| Vue components | `XhFlex` `XhFlexSplit` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/flex.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `align` | `FlexResponsive<FlexAlign>` |  |
| `gap` | `FlexResponsive<FlexGap>` |  |
| `inline` | `boolean` |  |
| `justify` | `FlexResponsive<FlexJustify>` |  |
| `orientation` | `FlexResponsive<Orientation>` |  |
| `wrap` | `boolean` |  |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhFlex` | `default` | — |
| `XhFlex` | `split` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhFlex` | `split` | `ReactNode` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getSplitProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `split` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/flex.css` is written against `[data-scope="flex"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-flex` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-align` | align.base |
| `root` | `data-align-lg` | align.lg |
| `root` | `data-align-md` | align.md |
| `root` | `data-align-sm` | align.sm |
| `root` | `data-align-xl` | align.xl |
| `root` | `data-gap` | gap.base |
| `root` | `data-gap-lg` | gap.lg |
| `root` | `data-gap-md` | gap.md |
| `root` | `data-gap-sm` | gap.sm |
| `root` | `data-gap-xl` | gap.xl |
| `root` | `data-inline` | '' (present only while the condition holds) |
| `root` | `data-justify` | justify.base |
| `root` | `data-justify-lg` | justify.lg |
| `root` | `data-justify-md` | justify.md |
| `root` | `data-justify-sm` | justify.sm |
| `root` | `data-justify-xl` | justify.xl |
| `root` | `data-orientation` | orientation.base |
| `root` | `data-orientation-lg` | orientation.lg |
| `root` | `data-orientation-md` | orientation.md |
| `root` | `data-orientation-sm` | orientation.sm |
| `root` | `data-orientation-xl` | orientation.xl |
| `root` | `data-wrap` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-flex-gap` | `root` | `gap` | `@media (min-width: 1024px)`<br>`@media (min-width: 1280px)`<br>`@media (min-width: 640px)`<br>`@media (min-width: 768px)`<br>`default`<br>`gap-lg=lg`<br>`gap-lg=md`<br>`gap-lg=sm`<br>`gap-lg=xl`<br>`gap-lg=xs`<br>`gap-md=lg`<br>`gap-md=md`<br>`gap-md=sm`<br>`gap-md=xl`<br>`gap-md=xs`<br>`gap-sm=lg`<br>`gap-sm=md`<br>`gap-sm=sm`<br>`gap-sm=xl`<br>`gap-sm=xs`<br>`gap-xl=lg`<br>`gap-xl=md`<br>`gap-xl=sm`<br>`gap-xl=xl`<br>`gap-xl=xs`<br>`gap=lg`<br>`gap=md`<br>`gap=sm`<br>`gap=xl`<br>`gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs`<br>`--xh-space-0` |
