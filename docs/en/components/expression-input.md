# ExpressionInput

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/expression-input).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/expression-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/expression-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/expression-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/expression-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/expression-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="expression-input"`: **`root`** · `label` · **`control`** · **`input`** · `highlight` · `highlight-segment` · `issues` · `issue` · `positioner` · `content` · `item` · `item-prefix` · `item-text` · `item-suffix` · `item-description` · `empty`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-expression-input>` |
| Vue components | `XhExpressionInputContent` `XhExpressionInputControl` `XhExpressionInputEmpty` `XhExpressionInputHighlight` `XhExpressionInputHighlightSegment` `XhExpressionInputInput` `XhExpressionInputIssue` `XhExpressionInputIssues` `XhExpressionInputItem` `XhExpressionInputItemDescription` `XhExpressionInputItemPrefix` `XhExpressionInputItemSuffix` `XhExpressionInputItemText` `XhExpressionInputLabel` `XhExpressionInputPositioner` `XhExpressionInputRoot` |
| Composable | `useExpressionInput` |
| State machine | `expressionInputMachine` |
| Skin | `@xihan-ui/styles/expression-input.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `label` | `string` |  |
| `multiline` | `boolean` |  |
| `issuesRendered` | `boolean` |  |
| `value` | `string` |  |
| `defaultValue` | `string` |  |
| `check` | `ExpressionCheck` |  |
| `completions` | `ExpressionCompletionSource` |  |
| `functions` | `FunctionTable` |  |
| `placeholder` | `string` |  |
| `name` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `invalid` | `boolean` |  |
| `autoSize` | `boolean \| ExpressionInputAutoSize` |  |
| `checkDelay` | `number` |  |
| `loop` | `boolean` |  |
| `placement` | `Placement` |  |
| `dir` | `Direction` |  |
| `offset` | `number` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<ExpressionInputTranslations>` |  |
| `onValueChange` | `(details: ExpressionInputValueChangeDetails) => void` |  |
| `onIssuesChange` | `(details: ExpressionInputIssuesChangeDetails) => void` |  |
| `onCompletionSelect` | `(details: ExpressionInputCompletionSelectDetails) => void` |  |
| `onOpenChange` | `(details: ExpressionInputOpenChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `ExpressionInputValueChangeDetails` |
| `issues-change` | `ExpressionInputIssuesChangeDetails` |
| `completion-select` | `ExpressionInputCompletionSelectDetails` |
| `open-change` | `ExpressionInputOpenChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhExpressionInputRoot` | `default` | `ExpressionInputRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhExpressionInputHighlightSegment` | `index` | `string` | Yes |
| `XhExpressionInputInput` | `as` | `ExpressionInputHost` |  |
| `XhExpressionInputIssue` | `index` | `string` | Yes |
| `XhExpressionInputItem` | `value` | `string` | Yes |
| `XhExpressionInputPositioner` | `container` | `() => Element \| null` |  |
| `XhExpressionInputRoot` | `children` | `SlotChildren<ExpressionInputRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `INPUT.CHANGE` · `CARET.SYNC` · `COMPOSITION.START` · `COMPOSITION.END` · `OPEN.FORCE` · `OPEN` · `WORD.CHANGED` · `CLOSE` · `ESCAPE` · `ITEM.HIGHLIGHT` · `ITEM.SELECT` · `VALUE.SET` · `TEXT.INSERT` · `CHECK.RUN` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `canEdit` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string` |
| `open` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `items` | `readonly ExpressionInputItem[]` |
| `highlightedKey` | `string \| null` |
| `empty` | `boolean` |
| `emptyText` | `string` |
| `kindText` | `(kind: ExpressionCompletionKind) => string` |
| `issues` | `readonly ExpressionInputIssueView[]` |
| `segments` | `readonly ExpressionInputSegment[]` |
| `setValue` | `(next: string) => void` |
| `insert` | `(text: string) => void` |
| `close` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getControlProps` | `() => T['element']` |
| `getInputProps` | `(props?: ExpressionInputInputProps) => T['input']` |
| `getHighlightProps` | `() => T['element']` |
| `getHighlightSegmentProps` | `(props: ExpressionInputMarkProps) => T['element']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getItemProps` | `(props: ExpressionInputItemProps) => T['element']` |
| `getItemPrefixProps` | `(props: ExpressionInputItemProps) => T['element']` |
| `getItemTextProps` | `(props: ExpressionInputItemProps) => T['element']` |
| `getItemSuffixProps` | `(props: ExpressionInputItemProps) => T['element']` |
| `getItemDescriptionProps` | `(props: ExpressionInputItemProps) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getIssuesProps` | `() => T['element']` |
| `getIssueProps` | `(props: ExpressionInputIssueProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| name characters | `expression-input.kbd.type` |
| `Ctrl+Space` | `expression-input.kbd.force` |
| `ArrowDown` | `expression-input.kbd.next` |
| `ArrowUp` | `expression-input.kbd.prev` |
| `Enter` / `Tab` | `expression-input.kbd.accept` |
| `Enter` | `expression-input.kbd.enter-pass` |
| `Escape` | `expression-input.kbd.escape` |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | `expression-input.kbd.caret` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `input` | `aria-activedescendant` | id of the `item` part \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | id of the `content` part |
| `input` | `aria-describedby` | id of the `issues` part \| undefined |
| `input` | `aria-expanded` | undefined \| 'true' \| 'false' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.ariaLabel |
| `input` | `aria-labelledby` | id of the `label` part \| undefined |
| `input` | `aria-readonly` | 'true' \| 'false' |
| `input` | `aria-required` | 'true' \| 'false' |
| `input` | `role` | undefined \| 'combobox' |
| `highlight` | `aria-hidden` | 'true' |
| `issues` | `role` | 'status' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | t.content |
| `content` | `role` | 'listbox' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-prefix` | `aria-hidden` | 'true' |
| `empty` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/expression-input.css` is written against `[data-scope="expression-input"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-expression-input` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `input` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-invalid` | '' (present only while the condition holds) |
| `input` | `data-state` | 'open' \| 'closed' |
| `input` | `data-xh-field-auto-size` | '' (present only while the condition holds) |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'textarea' \| 'single-line' |
| `highlight` | `data-multiline` | '' (present only while the condition holds) |
| `highlight-segment` | `data-issue` | undefined \| String(segment.issue) |
| `highlight-segment` | `data-severity` | segment.severity |
| `issues` | `data-invalid` | '' (present only while the condition holds) |
| `issue` | `data-issue` | String(issue.index) |
| `issue` | `data-severity` | issue.issue.severity |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | actual placement computed by the positioning engine |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-xh-material` | 'frosted' |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-prefix` | `data-highlighted` | '' (present only while the condition holds) |
| `item-prefix` | `data-xh-collection-slot` | 'prefix' |
| `item-text` | `data-highlighted` | '' (present only while the condition holds) |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-suffix` | `data-highlighted` | '' (present only while the condition holds) |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `item-description` | `data-highlighted` | '' (present only while the condition holds) |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `empty` | `data-state` | 'open' \| 'closed' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-expression-input-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` |
| `--xh-expression-input-content-bg` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg` |
| `--xh-expression-input-content-border` | `content` | `border` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border` |
| `--xh-expression-input-content-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-expression-input-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-expression-input-content-highlight` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-highlight` |
| `--xh-expression-input-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` |
| `--xh-expression-input-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` |
| `--xh-expression-input-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-min-w` |
| `--xh-expression-input-content-px` | `content` | `padding-inline` | `default` | `0` |
| `--xh-expression-input-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-expression-input-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-expression-input-content-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-expression-input-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-expression-input-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-expression-input-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-expression-input-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-expression-input-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-expression-input-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-expression-input-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-expression-input-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-expression-input-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-expression-input-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_expression-input-gap` |
| `--xh-expression-input-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_expression-input-h` |
| `--xh-expression-input-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-expression-input-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_expression-input-px` |
| `--xh-expression-input-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-expression-input-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-expression-input-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-expression-input-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-expression-input-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_expression-input-font-size` |
| `--xh-expression-input-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_expression-input-px` |
| `--xh-expression-input-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-expression-input-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` |
| `--xh-expression-input-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` |
| `--xh-expression-input-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` |
| `--xh-expression-input-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` |
| `--xh-expression-input-input-font-size` | `highlight`<br>`input` | `font-size` | `default`<br>`xh-field-input` | `--xh-_expression-input-font-size` |
| `--xh-expression-input-input-max-h` | `input` | `max-block-size` | `xh-field-auto-size` | `--xh-viewport-h-sm` |
| `--xh-expression-input-issue-error-fg` | `highlight-segment`<br>`issue` | `color`<br>`text-decoration-color` | `default`<br>`issue` | `--xh-fg-danger` |
| `--xh-expression-input-issue-font-size` | `issue` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-expression-input-issue-warning-fg` | `highlight-segment`<br>`issue` | `color`<br>`text-decoration-color` | `severity=warning` | `--xh-fg-warning` |
| `--xh-expression-input-issues-gap` | `issues` | `gap` | `default` | `--xh-space-0_5` |
| `--xh-expression-input-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-expression-input-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-expression-input-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` |
| `--xh-expression-input-item-font-size` | `item` | `font-size` | `default` | `--xh-_expression-input-font-size` |
| `--xh-expression-input-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_expression-input-gap` |
| `--xh-expression-input-item-h` | `item` | `min-block-size` | `default` | `--xh-_expression-input-item-h` |
| `--xh-expression-input-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-expression-input-item-prefix-fg` | `item-prefix` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-expression-input-item-prefix-font-size` | `item-prefix` | `font-size` | `default` | `--xh-_expression-input-caption-size` |
| `--xh-expression-input-item-prefix-w` | `item-prefix` | `min-inline-size` | `default` | `--xh-space-8` |
| `--xh-expression-input-item-px` | `item` | `padding-inline` | `default` | `--xh-_expression-input-px` |
| `--xh-expression-input-item-py` | `item` | `padding-block` | `default` | `--xh-_expression-input-item-py` |
| `--xh-expression-input-item-radius` | `item` | `border-radius` | `default` | `0` |
| `--xh-expression-input-item-suffix-fg` | `item-suffix` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-expression-input-item-suffix-font-size` | `item-suffix` | `font-size` | `default` | `--xh-_expression-input-caption-size` |
| `--xh-expression-input-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-expression-input-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-expression-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-expression-input-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-expression-input-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-expression-input-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` |
| `--xh-expression-input-textarea-py` | `highlight`<br>`input` | `padding-block` | `multiline`<br>`xh-field-input`<br>`xh-field-layout=textarea` | `--xh-space-1` |
