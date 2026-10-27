# Mention

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/mention).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/mention" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/mention.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/mention" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/mention" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/mention.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="mention"`: **`root`** · `label` · **`input`** · `positioner` · **`content`** · `empty` · `loading` · `item` · `item-prefix` · `item-text` · `item-description` · `item-suffix`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-mention>` |
| Vue components | `XhMentionContent` `XhMentionEmpty` `XhMentionInput` `XhMentionItem` `XhMentionItemDescription` `XhMentionItemPrefix` `XhMentionItemSuffix` `XhMentionItemText` `XhMentionLabel` `XhMentionLoading` `XhMentionPositioner` `XhMentionRoot` |
| Composable | `useMention` |
| State machine | `mentionMachine` |
| Skin | `@xihan-ui/styles/mention.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `triggerPrefix` | `string \| string[]` |  |
| `collection` | `MentionNode[]` |  |
| `value` | `string` |  |
| `defaultValue` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `loading` | `boolean` |  |
| `placeholder` | `string` |  |
| `name` | `string` |  |
| `loop` | `boolean` |  |
| `placement` | `Placement` |  |
| `dir` | `Direction` |  |
| `offset` | `number` |  |
| `translations` | `MentionTranslations` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `onValueChange` | `(details: MentionValueChangeDetails) => void` |  |
| `onQueryChange` | `(details: MentionQueryChangeDetails) => void` |  |
| `onItemSelect` | `(details: MentionItemSelectDetails) => void` |  |
| `onOpenChange` | `(details: MentionOpenChangeDetails) => void` |  |

### MentionNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `disabled` | `boolean` |  |
| `tone` | `Tone` |  |
| `description` | `string` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `MentionValueChangeDetails` |
| `query-change` | `MentionQueryChangeDetails` |
| `item-select` | `MentionItemSelectDetails` |
| `open-change` | `MentionOpenChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhMentionRoot` | `default` | `MentionRootSlotProps` |
| `XhMentionRoot` | `label` | — |
| `XhMentionRoot` | `item` | `MentionNodeMeta` |
| `XhMentionRoot` | `item-prefix` | `MentionNodeMeta` |
| `XhMentionRoot` | `item-suffix` | `MentionNodeMeta` |
| `XhMentionRoot` | `empty` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhMentionInput` | `as` | `MentionInputHost` |  |
| `XhMentionItem` | `value` | `string` | Yes |
| `XhMentionItem` | `disabled` | `boolean` |  |
| `XhMentionPositioner` | `container` | `() => Element \| null` |  |
| `XhMentionRoot` | `label` | `ReactNode` |  |
| `XhMentionRoot` | `multiline` | `boolean` |  |
| `XhMentionRoot` | `renderItem` | `(node: MentionNodeMeta) => ReactNode` |  |
| `XhMentionRoot` | `renderItemPrefix` | `(node: MentionNodeMeta) => ReactNode` |  |
| `XhMentionRoot` | `renderItemSuffix` | `(node: MentionNodeMeta) => ReactNode` |  |
| `XhMentionRoot` | `empty` | `ReactNode` |  |
| `XhMentionRoot` | `children` | `SlotChildren<MentionRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `CLOSE` · `ESCAPE` · `INPUT.CHANGE` · `CARET.SYNC` · `VALUE.SET` · `ITEM.HIGHLIGHT` · `ITEM.SELECT` · `ITEMS.SYNC` · `FORM.RESET` · `MENTION.DELETE` · `PRESS.START` · `PRESS.END`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `collection` | `readonly MentionNodeMeta[]` |
| `value` | `string` |
| `query` | `string \| null` |
| `activePrefix` | `string \| null` |
| `highlightedValue` | `string \| null` |
| `mentions` | `readonly MentionRange[]` |
| `disabled` | `boolean` |
| `empty` | `boolean` |
| `emptyText` | `string` |
| `loadingText` | `string` |
| `isHighlighted` | `(value: string) => boolean` |
| `setValue` | `(next: string) => void` |
| `close` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['label']` |
| `getInputProps` | `(props?: MentionInputProps) => T['input']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getLoadingProps` | `() => T['element']` |
| `getItemProps` | `(props: MentionItemProps) => T['element']` |
| `getItemPrefixProps` | `(props: MentionItemProps) => T['element']` |
| `getItemTextProps` | `(props: MentionItemProps) => T['element']` |
| `getItemDescriptionProps` | `(props: MentionItemProps) => T['element']` |
| `getItemSuffixProps` | `(props: MentionItemProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| prefix characters | `mention.kbd.trigger` |
| printable characters | `mention.kbd.type` |
| `ArrowDown` | `mention.kbd.next` |
| `ArrowUp` | `mention.kbd.prev` |
| `Enter` | `mention.kbd.commit` |
| `Enter` | `mention.kbd.enter-pass` |
| `Escape` | `mention.kbd.escape` |
| `Tab` / `Shift+Tab` | `mention.kbd.tab` |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | `mention.kbd.caret` |
| `Backspace` / `Delete` | `mention.kbd.delete-mention` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `input` | `aria-activedescendant` | id of the `item` part \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | id of the `content` part |
| `input` | `aria-expanded` | undefined \| 'true' \| 'false' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.ariaLabel |
| `input` | `aria-labelledby` | id of the `label` part \| undefined |
| `input` | `role` | undefined \| 'combobox' |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | translations.content |
| `content` | `role` | 'listbox' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-prefix` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/mention.css` is written against `[data-scope="mention"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-mention` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-disabled` | '' (present only while the condition holds) |
| `input` | `data-invalid` | '' (present only while the condition holds) |
| `input` | `data-readonly` | '' (present only while the condition holds) |
| `input` | `data-state` | 'open' \| 'closed' |
| `input` | `data-variant` | props.variant |
| `input` | `data-xh-field-chrome` | '' |
| `input` | `data-xh-field-layout` | 'textarea' \| 'single-line' |
| `input` | `data-xh-field-size` | props.size |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-readonly` | '' (present only while the condition holds) |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | actual placement computed by the positioning engine |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-xh-material` | 'frosted' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-loading` | '' (present only while the condition holds) |
| `loading` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-xh-loading-ring` | '' |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-highlighted` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-tone` | metaOf.get(item.value)?.tone |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-prefix` | `data-disabled` | '' (present only while the condition holds) |
| `item-prefix` | `data-highlighted` | '' (present only while the condition holds) |
| `item-prefix` | `data-xh-collection-slot` | 'prefix' |
| `item-text` | `data-disabled` | '' (present only while the condition holds) |
| `item-text` | `data-highlighted` | '' (present only while the condition holds) |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-description` | `data-disabled` | '' (present only while the condition holds) |
| `item-description` | `data-highlighted` | '' (present only while the condition holds) |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-suffix` | `data-disabled` | '' (present only while the condition holds) |
| `item-suffix` | `data-highlighted` | '' (present only while the condition holds) |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-mention-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` |
| `--xh-mention-content-bg` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg` |
| `--xh-mention-content-border` | `content` | `border` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border` |
| `--xh-mention-content-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-mention-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-mention-content-highlight` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-highlight` |
| `--xh-mention-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` |
| `--xh-mention-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` |
| `--xh-mention-content-min-h` | `content` | `min-block-size` | `default` | `--xh-_mention-h` |
| `--xh-mention-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-min-w` |
| `--xh-mention-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-mention-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-mention-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-mention-content-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-mention-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-mention-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_mention-font-size` |
| `--xh-mention-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_mention-item-px` |
| `--xh-mention-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-mention-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-canvas` |
| `--xh-mention-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` |
| `--xh-mention-input-bg` | `input` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` |
| `--xh-mention-input-bg-disabled` | `input` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` |
| `--xh-mention-input-bg-hover` | `input` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` |
| `--xh-mention-input-bg-readonly` | `input` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` |
| `--xh-mention-input-border` | `input` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` |
| `--xh-mention-input-border-focus` | `input` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` |
| `--xh-mention-input-border-hover` | `input` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not(:focus-within)`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` |
| `--xh-mention-input-border-invalid` | `input` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` |
| `--xh-mention-input-fg` | `input` | `color` | `xh-field-chrome` | `--xh-fg-default` |
| `--xh-mention-input-font-size` | `input` | `font-size` | `default` | `--xh-_mention-font-size` |
| `--xh-mention-input-h` | `input` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_mention-h` |
| `--xh-mention-input-min-w` | `input`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` |
| `--xh-mention-input-px` | `input` | `padding-inline` | `xh-field-chrome` | `--xh-_mention-px` |
| `--xh-mention-input-radius` | `input` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` |
| `--xh-mention-input-shadow` | `input` | `box-shadow` | `xh-field-chrome` | `none` |
| `--xh-mention-input-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` |
| `--xh-mention-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` |
| `--xh-mention-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` |
| `--xh-mention-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` |
| `--xh-mention-item-font-size` | `item` | `font-size` | `default` | `--xh-_mention-font-size` |
| `--xh-mention-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `default`<br>`xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_mention-gap` |
| `--xh-mention-item-h` | `item` | `min-block-size` | `default` | `--xh-_mention-item-h` |
| `--xh-mention-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-mention-item-px` | `item` | `padding-inline` | `default` | `--xh-_mention-item-px` |
| `--xh-mention-item-py` | `item` | `padding-block` | `default` | `--xh-_mention-item-py` |
| `--xh-mention-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-mention-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-mention-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-mention-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-mention-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-mention-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-mention-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-mention-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` |
| `--xh-mention-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_mention-font-size` |
| `--xh-mention-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_mention-item-px` |
| `--xh-mention-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-mention-placeholder-fg` | `input` | `color` | `placeholder` | `--xh-fg-subtle` |
| `--xh-mention-textarea-py` | `input` | `padding-block` | `xh-field-layout=textarea` | `--xh-space-1` |
