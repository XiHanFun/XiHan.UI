# CodeView

AI chat component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/code-view).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/code-view" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/code-view.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/code-view" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/code-view" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/code-view.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="code-view"`: **`root`** · `header` · `filename` · `lang-label` · **`pre`** · **`code`** · `line` · `line-number` · `line-content` · `token` · `fold-trigger` · `line-fold-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-code-view>` |
| Vue components | `XhCodeViewCode` `XhCodeViewFilename` `XhCodeViewFoldTrigger` `XhCodeViewHeader` `XhCodeViewLangLabel` `XhCodeViewPre` `XhCodeViewRoot` |
| Composable | `useCodeView` |
| State machine | `codeViewMachine` |
| Skin | `@xihan-ui/styles/code-view.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `code` | `string` | Yes |
| `lang` | `string` |  |
| `filename` | `string` |  |
| `labelled` | `boolean` |  |
| `complete` | `boolean` |  |
| `wrap` | `boolean` |  |
| `lineNumbers` | `boolean` |  |
| `startLine` | `number` |  |
| `highlightLines` | `string \| readonly number[]` |  |
| `clamp` | `number` |  |
| `clamped` | `boolean` |  |
| `blockFolding` | `boolean` |  |
| `folded` | `readonly number[]` |  |
| `defaultFolded` | `readonly number[]` |  |
| `onFoldedChange` | `(details: CodeViewFoldedChangeDetails) => void` |  |
| `highlighter` | `HighlighterPort` |  |
| `highlightWhileStreaming` | `boolean` |  |
| `size` | `Size` |  |
| `translations` | `Partial<CodeViewTranslations>` |  |
| `onClampToggle` | `(details: CodeViewClampToggleDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `clamp-toggle` | `CustomEvent` |
| `folded-change` | `CustomEvent` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhCodeViewCode` | `line` | `CodeViewLineSlotProps` |
| `XhCodeViewRoot` | `default` | `CodeViewRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhCodeViewCode` | `children` | `SlotChildren<CodeViewLineSlotProps>` |  |
| `XhCodeViewFilename` | `filename` | `string` |  |
| `XhCodeViewRoot` | `children` | `SlotChildren<CodeViewRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `fold-trigger` | 'closed' \| 'open' |
| `line-fold-trigger` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `PRESS.START` · `PRESS.END` · `FOLD.TOGGLE` · `FOLD.FOCUS`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `lang` | `string` |
| `filename` | `string \| undefined` |
| `lineCount` | `number` |
| `lines` | `readonly CodeLine[]` |
| `lineNumberAt` | `(index: number) => number` |
| `lineNumbers` | `boolean` |
| `foldable` | `boolean` |
| `clamped` | `boolean` |
| `setClamped` | `(next: boolean) => void` |
| `foldRegions` | `readonly CodeViewFoldRegion[]` |
| `folded` | `readonly number[]` |
| `isFoldStart` | `(index: number) => boolean` |
| `toggleFold` | `(line: number) => void` |
| `getLineFoldTriggerProps` | `(props: CodeViewLineProps) => T['button']` |
| `getRootProps` | `() => T['element']` |
| `getHeaderProps` | `() => T['element']` |
| `getFilenameProps` | `() => T['element']` |
| `getLangLabelProps` | `() => T['element']` |
| `getPreProps` | `() => T['element']` |
| `getCodeProps` | `() => T['element']` |
| `getLineProps` | `(props: CodeViewLineProps) => T['element']` |
| `getLineNumberProps` | `(props: CodeViewLineProps) => T['element']` |
| `getLineContentProps` | `(props: CodeViewLineProps) => T['element']` |
| `getTokenProps` | `(token: CodeToken) => T['element']` |
| `getFoldTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` | `code-view.kbd.pre-focus` |
| `Enter` / `Space` | `code-view.kbd.fold` |
| `Enter` / `Space` | `code-view.kbd.press` |
| `Tab` | `code-view.kbd.block-fold-tab` |
| `Enter` / `Space` | `code-view.kbd.block-fold-toggle` |
| `ArrowDown` / `ArrowUp` | `code-view.kbd.block-fold-move` |
| `Home` / `End` | `code-view.kbd.block-fold-edge` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `lang-label` | `aria-hidden` | 'true' |
| `pre` | `role` | 'group' |
| `line-number` | `aria-hidden` | 'true' |
| `fold-trigger` | `aria-controls` | id of the `pre` part |
| `fold-trigger` | `aria-expanded` | 'false' \| 'true' |
| `fold-trigger` | `aria-label` | translations.expand \| translations.collapse |
| `line-fold-trigger` | `aria-expanded` | 'true' \| 'false' |
| `line-fold-trigger` | `aria-label` | undefined \| foldLabel(lineNumberAt(region.start + 1), lineNumberA… |

## Style reference

### Skin

`@xihan-ui/styles/code-view.css` is written against `[data-scope="code-view"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-code-view` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-block-folding` | '' (present only while the condition holds) |
| `root` | `data-clamped` | '' (present only while the condition holds) |
| `root` | `data-complete` | '' (present only while the condition holds) |
| `root` | `data-digits` | String(Math.min( String(lineNumberAt(lineCount - 1)).… |
| `root` | `data-foldable` | '' (present only while the condition holds) |
| `root` | `data-lang` | prop('lang')?.trim() \|\| CODE_VIEW_FALLBACK_LANG |
| `root` | `data-line-numbers` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `pre` | `data-complete` | '' (present only while the condition holds) |
| `pre` | `data-wrap` | '' (present only while the condition holds) |
| `code` | `data-lang` | prop('lang')?.trim() \|\| CODE_VIEW_FALLBACK_LANG |
| `code` | `data-wrap` | '' (present only while the condition holds) |
| `line` | `data-folded` | '' (present only while the condition holds) |
| `line` | `data-highlighted` | '' (present only while the condition holds) |
| `line` | `data-line-number` | String(lineNumberAt(index)) |
| `line-number` | `data-folded` | '' (present only while the condition holds) |
| `line-number` | `data-highlighted` | '' (present only while the condition holds) |
| `line-number` | `data-line-number` | String(lineNumberAt(index)) |
| `line-content` | `data-folded` | '' (present only while the condition holds) |
| `line-content` | `data-highlighted` | '' (present only while the condition holds) |
| `line-content` | `data-line-number` | String(lineNumberAt(index)) |
| `token` | `data-kind` | token.kind |
| `fold-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `fold-trigger` | `data-state` | 'closed' \| 'open' |
| `fold-trigger` | `data-xh-action-control` | '' |
| `fold-trigger` | `data-xh-action-display` | 'always' |
| `fold-trigger` | `data-xh-action-profile` | 'disclosure-trigger' |
| `fold-trigger` | `data-xh-action-size` | props.size |
| `fold-trigger` | `data-xh-action-variant` | 'ghost' |
| `line-fold-trigger` | `data-state` | 'open' \| 'closed' |
| `line-fold-trigger` | `data-xh-action-control` | '' |
| `line-fold-trigger` | `data-xh-action-display` | 'always' |
| `line-fold-trigger` | `data-xh-action-profile` | 'icon' |
| `line-fold-trigger` | `data-xh-action-size` | props.size |
| `line-fold-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-code-view-bg` | `root` | `background` | `default` | `--xh-bg-surface` |
| `--xh-code-view-border` | `root` | `border` | `default` | `--xh-border-default` |
| `--xh-code-view-comment-fg` | `token` | `color` | `kind=comment` | `--xh-fg-muted` |
| `--xh-code-view-fg` | `root` | `color` | `default` | `--xh-fg-muted` |
| `--xh-code-view-filename-fg` | `filename` | `color` | `default` | `--xh-fg-default` |
| `--xh-code-view-fold-bg-hover` | `fold-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-code-view-fold-col` | `line-content`<br>`line-fold-trigger`<br>`root` | `block-size`<br>`inline-size`<br>`min-block-size`<br>`min-inline-size`<br>`padding-inline-start` | `block-folding`<br>`line-numbers`<br>`not([data-line-numbers])`<br>`xh-action-profile=disclosure-trigger`<br>`xh-action-profile=icon` | `--xh-code-view-line-height` |
| `--xh-code-view-fold-fg` | `fold-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-code-view-fold-py` | `fold-trigger` | `padding-block` | `xh-action-profile=disclosure-trigger` | `--xh-space-2` |
| `--xh-code-view-folded-fg` | `line-content` | `background-color` | `folded` | `--xh-fg-subtle` |
| `--xh-code-view-folded-gap` | `line-content` | `margin-inline-start` | `folded` | `--xh-space-1` |
| `--xh-code-view-font` | `code`<br>`filename` | `font-family` | `default` | `--xh-font-family-mono` |
| `--xh-code-view-font-size` | `root` | `font-size` | `default` | `--xh-_code-view-font-size` |
| `--xh-code-view-gutter-border` | `line-number` | `border-inline-end` | `default` | `--xh-border-subtle` |
| `--xh-code-view-gutter-gap` | `line-number` | `padding-inline-end` | `default` | `--xh-space-1` |
| `--xh-code-view-header-border` | `fold-trigger`<br>`header` | `border`<br>`border-block-end`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-subtle` |
| `--xh-code-view-header-fg` | `header` | `color` | `default` | `--xh-fg-muted` |
| `--xh-code-view-header-font-size` | `fold-trigger`<br>`header` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-code-view-header-gap` | `header` | `gap` | `default` | `--xh-space-2` |
| `--xh-code-view-header-h` | `header` | `min-block-size` | `default` | `--xh-control-h-lg` |
| `--xh-code-view-header-px` | `header` | `padding-inline` | `default` | `--xh-space-4` |
| `--xh-code-view-header-py` | `header` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-code-view-highlight-bar` | `line` | `box-shadow`<br>`outline`<br>`outline-offset` | `@media print`<br>`highlighted` | `--xh-stroke-thick` |
| `--xh-code-view-highlight-bg` | `line` | `background` | `highlighted` | `--xh-bg-subtle` |
| `--xh-code-view-highlight-fg` | `line` | `box-shadow` | `highlighted` | `--xh-border-strong` |
| `--xh-code-view-icon-size` | `line-fold-trigger` | `--xh-icon-size` | `default` | `--xh-glyph-size-sm` |
| `--xh-code-view-keyword-fg` | `token` | `color` | `kind=keyword` | `--xh-syntax-keyword` |
| `--xh-code-view-keyword-weight` | `token` | `font-weight` | `kind=keyword` | `--xh-font-weight-semibold` |
| `--xh-code-view-label-fg` | `lang-label` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-code-view-label-font-size` | `lang-label` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-code-view-line-fold-trigger-fg` | `line-fold-trigger` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-code-view-line-fold-trigger-radius` | `line-fold-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-code-view-line-height` | `line`<br>`line-content`<br>`line-fold-trigger`<br>`pre`<br>`root` | `block-size`<br>`inline-size`<br>`line-height`<br>`min-block-size`<br>`min-inline-size`<br>`padding-inline-start` | `block-folding`<br>`default`<br>`line-numbers`<br>`not([data-line-numbers])`<br>`xh-action-profile=disclosure-trigger`<br>`xh-action-profile=icon` | `--xh-text-code-leading` |
| `--xh-code-view-number-fg` | `line-number` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-code-view-number-font-size` | `line-number` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-code-view-number-token-fg` | `token` | `color` | `kind=number` | `--xh-syntax-number` |
| `--xh-code-view-punctuation-fg` | `token` | `color` | `kind=punctuation` | `--xh-fg-subtle` |
| `--xh-code-view-px` | `fold-trigger`<br>`line`<br>`line-content`<br>`line-fold-trigger`<br>`line-number`<br>`root` | `inset-inline-start`<br>`padding-inline`<br>`padding-inline-end`<br>`padding-inline-start` | `block-folding`<br>`default`<br>`line-numbers`<br>`not([data-line-numbers])` | `--xh-space-3` |
| `--xh-code-view-py` | `pre` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-code-view-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-code-view-shadow` | `root` | `box-shadow` | `default` | `none` |
| `--xh-code-view-string-fg` | `token` | `color` | `kind=string` | `--xh-syntax-string` |
