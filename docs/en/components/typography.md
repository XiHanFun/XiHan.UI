# Typography

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/typography).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/typography" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/typography.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/typography" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/typography" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/typography.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="typography"`: **`root`** · `heading` · `paragraph` · `text` · `link` · `prose`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-typography>` |
| Vue components | `XhTypographyHeading` `XhTypographyLink` `XhTypographyParagraph` `XhTypographyProse` `XhTypographyRoot` `XhTypographyText` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/typography.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `align` | `TypographyAlign` |  |
| `size` | `Size` |  |
| `weight` | `TypographyWeight` |  |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTypographyHeading` | `level` | `TypographyLevel \| string` |  |
| `XhTypographyHeading` | `as` | `ElementType` |  |
| `XhTypographyProse` | `as` | `ElementType` |  |
| `XhTypographyText` | `tone` | `Tone` |  |
| `XhTypographyText` | `variant` | `TypographyVariant` |  |
| `XhTypographyText` | `weight` | `TypographyWeight` |  |
| `XhTypographyText` | `strikethrough` | `boolean` |  |
| `XhTypographyText` | `underline` | `boolean` |  |
| `XhTypographyText` | `mark` | `boolean` |  |
| `XhTypographyText` | `as` | `ElementType` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getHeadingProps` | `(props?: TypographyHeadingProps) => T['element']` |
| `getParagraphProps` | `() => T['element']` |
| `getTextProps` | `(props?: TypographyTextProps) => T['element']` |
| `getLinkProps` | `() => T['element']` |
| `getProseProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/typography.css` is written against `[data-scope="typography"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-typography` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-size` | props.size |
| `root` | `data-weight` | props.weight |
| `heading` | `data-level` | levelAttr(heading.level) |
| `text` | `data-marked` | '' (present only while the condition holds) |
| `text` | `data-strikethrough` | '' (present only while the condition holds) |
| `text` | `data-tone` | text.tone |
| `text` | `data-underline` | '' (present only while the condition holds) |
| `text` | `data-variant` | text.variant |
| `text` | `data-weight` | text.weight |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-typography-block-gap` | `heading`<br>`paragraph` | `margin-block-start` | `is([data-part='heading'], [data-part='paragraph'])` | `--xh-_typography-block-gap` |
| `--xh-typography-code-bg` | `prose`<br>`text` | `background` | `variant=code`<br>`where(code)` | `--xh-bg-subtle` |
| `--xh-typography-code-fg` | `prose`<br>`text` | `color` | `variant=code`<br>`where(code)` | `--xh-fg-muted` |
| `--xh-typography-code-font` | `prose`<br>`text` | `font-family` | `variant=code`<br>`where(code)`<br>`where(pre)` | `--xh-font-family-mono` |
| `--xh-typography-code-font-size` | `prose`<br>`text` | `font-size` | `variant=code`<br>`where(code)`<br>`where(pre)` | `--xh-_typography-code-size` |
| `--xh-typography-code-px` | `prose`<br>`text` | `padding-inline` | `variant=code`<br>`where(code)` | `--xh-space-2` |
| `--xh-typography-code-py` | `prose`<br>`text` | `padding-block` | `variant=code`<br>`where(code)` | `--xh-space-0_5` |
| `--xh-typography-code-radius` | `prose`<br>`text` | `border-radius` | `variant=code`<br>`where(code)` | `--xh-shape-inset` |
| `--xh-typography-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-typography-font-size` | `root` | `font-size` | `default` | `--xh-_typography-body-size` |
| `--xh-typography-font-weight` | `root` | `font-weight` | `default`<br>`weight=bold`<br>`weight=medium`<br>`weight=regular`<br>`weight=semibold` | `--xh-font-weight-bold`<br>`--xh-font-weight-medium`<br>`--xh-font-weight-regular`<br>`--xh-font-weight-semibold`<br>`--xh-text-body-weight` |
| `--xh-typography-gradient-direction` | `text` | `background-image` | `variant=gradient` | `to right` |
| `--xh-typography-gradient-from` | `text` | `background-image` | `variant=gradient` | `--xh-_typography-gradient-from` |
| `--xh-typography-gradient-to` | `text` | `background-image` | `variant=gradient` | `--xh-_typography-gradient-to` |
| `--xh-typography-heading-fg` | `heading` | `color` | `default` | `--xh-fg-default` |
| `--xh-typography-heading-font-size` | `heading` | `font-size` | `default`<br>`level=1`<br>`level=2`<br>`level=3`<br>`level=4`<br>`level=5`<br>`level=6` | `--xh-_typography-h1`<br>`--xh-_typography-h2`<br>`--xh-_typography-h3`<br>`--xh-_typography-h4`<br>`--xh-_typography-h5`<br>`--xh-_typography-h6` |
| `--xh-typography-heading-font-weight` | `heading` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-typography-heading-gap` | `heading`<br>`paragraph` | `margin-block-start` | `is([data-part='heading'], [data-part='paragraph'])` | `--xh-_typography-heading-gap` |
| `--xh-typography-heading-leading` | `heading` | `line-height` | `default` | `--xh-leading-tight` |
| `--xh-typography-leading` | `root` | `line-height` | `default` | `--xh-text-body-leading` |
| `--xh-typography-link-fg` | `link`<br>`prose` | `color` | `default`<br>`where(a)` | `--xh-fg-brand` |
| `--xh-typography-link-fg-hover` | `link` | `color` | `@media (hover: hover)`<br>`hover` | `--xh-fg-brand-strong` |
| `--xh-typography-link-radius` | `link`<br>`prose` | `border-radius` | `default`<br>`where(a)` | `--xh-shape-inset` |
| `--xh-typography-link-underline-offset` | `link`<br>`prose` | `text-underline-offset` | `default`<br>`where(a)` | `--xh-space-0_5` |
| `--xh-typography-mark-bg` | `text` | `background` | `marked`<br>`tone` | `--xh-_tone-subtle`<br>`--xh-bg-mark` |
| `--xh-typography-mark-fg` | `text` | `color` | `marked`<br>`tone` | `--xh-_tone-fg`<br>`--xh-fg-default` |
| `--xh-typography-mark-px` | `text` | `padding-inline` | `marked` | `--xh-space-0_5` |
| `--xh-typography-mark-radius` | `text` | `border-radius` | `marked` | `--xh-shape-inset` |
| `--xh-typography-measure` | `root` | `max-inline-size` | `default` | `--xh-_typography-measure` |
| `--xh-typography-prose-block-gap` | `prose` | `margin-block-start` | `where(h1, h2, h3, h4, h5, h6, p, ul, ol, pre, blockquote, table, hr)` | `--xh-_typography-block-gap` |
| `--xh-typography-prose-cell-border` | `prose` | `border-block-end` | `where(th, td)` | `--xh-border-subtle` |
| `--xh-typography-prose-cell-px` | `prose` | `padding-inline` | `where(th, td)` | `--xh-space-3` |
| `--xh-typography-prose-cell-py` | `prose` | `padding-block` | `where(th, td)` | `--xh-space-2` |
| `--xh-typography-prose-fg` | `prose` | `color` | `default` | `--xh-fg-default` |
| `--xh-typography-prose-font-size` | `prose` | `font-size` | `default` | `--xh-_typography-body-size` |
| `--xh-typography-prose-h1` | `prose` | `font-size` | `where(h1)` | `--xh-_typography-h1` |
| `--xh-typography-prose-h2` | `prose` | `font-size` | `where(h2)` | `--xh-_typography-h2` |
| `--xh-typography-prose-h3` | `prose` | `font-size` | `where(h3)` | `--xh-_typography-h3` |
| `--xh-typography-prose-h4` | `prose` | `font-size` | `where(h4)` | `--xh-_typography-h4` |
| `--xh-typography-prose-h5` | `prose` | `font-size` | `where(h5)` | `--xh-_typography-h5` |
| `--xh-typography-prose-h6` | `prose` | `font-size` | `where(h6)` | `--xh-_typography-h6` |
| `--xh-typography-prose-heading-fg` | `prose` | `color` | `where(h1, h2, h3, h4, h5, h6)` | `--xh-fg-default` |
| `--xh-typography-prose-heading-font-weight` | `prose` | `font-weight` | `where(h1, h2, h3, h4, h5, h6)` | `--xh-font-weight-medium` |
| `--xh-typography-prose-heading-gap` | `prose` | `margin-block-start` | `where(h1, h2, h3, h4, h5, h6)`<br>`where(h1, h2, h3, h4, h5, h6, p, ul, ol, pre, blockquote, table, hr)` | `--xh-_typography-heading-gap` |
| `--xh-typography-prose-item-gap` | `prose` | `margin-block-start` | `where(li + li)`<br>`where(li)`<br>`where(ul, ol)` | `--xh-space-1` |
| `--xh-typography-prose-leading` | `prose` | `line-height` | `default` | `--xh-text-prose-leading` |
| `--xh-typography-prose-link-fg` | `prose` | `color` | `where(a)` | `--xh-typography-link-fg` |
| `--xh-typography-prose-link-radius` | `prose` | `border-radius` | `where(a)` | `--xh-typography-link-radius` |
| `--xh-typography-prose-link-underline-offset` | `prose` | `text-underline-offset` | `where(a)` | `--xh-typography-link-underline-offset` |
| `--xh-typography-prose-list-ps` | `prose` | `padding-inline-start` | `where(ul, ol)` | `--xh-space-5` |
| `--xh-typography-prose-pre-bg` | `prose` | `background` | `where(pre)` | `--xh-bg-subtle` |
| `--xh-typography-prose-pre-padding` | `prose` | `padding` | `where(pre)` | `--xh-space-4` |
| `--xh-typography-prose-pre-radius` | `prose` | `border-radius` | `where(pre)` | `--xh-shape-surface` |
| `--xh-typography-prose-quote-border` | `prose` | `border-inline-start` | `where(blockquote)` | `--xh-border-strong` |
| `--xh-typography-prose-quote-fg` | `prose` | `color` | `where(blockquote)` | `inherit` |
| `--xh-typography-prose-quote-ps` | `prose` | `padding-inline-start` | `where(blockquote)` | `--xh-space-2` |
| `--xh-typography-prose-rule-border` | `prose` | `border-block-start` | `where(hr)` | `--xh-border-subtle` |
| `--xh-typography-prose-strong-font-weight` | `prose` | `font-weight` | `where(strong)` | `--xh-font-weight-medium` |
| `--xh-typography-prose-th-font-weight` | `prose` | `font-weight` | `where(th)` | `--xh-font-weight-semibold` |
| `--xh-typography-text-fg-muted` | `text` | `color` | `variant=muted` | `--xh-fg-muted` |
| `--xh-typography-text-fg-tone` | `text` | `color` | `tone` | `--xh-_tone-fg` |
| `--xh-typography-text-font-weight` | `text` | `font-weight` | `variant=strong` | `--xh-font-weight-medium` |
| `--xh-typography-text-underline-offset` | `text` | `text-underline-offset` | `underline` | `--xh-space-0_5` |
