# GridList <Badge type="tip" text="new" />

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/grid-list).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/grid-list" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/grid-list.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/grid-list" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/grid-list" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/grid-list.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="grid-list"`: **`root`** · `label` · `row` · `row-selection-indicator` · `row-content` · `row-text` · `row-description` · `row-actions` · `row-action` · `empty` · `loading`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-grid-list>` |
| Vue components | `XhGridListEmpty` `XhGridListLabel` `XhGridListLoading` `XhGridListRoot` `XhGridListRow` `XhGridListRowAction` `XhGridListRowActions` `XhGridListRowContent` `XhGridListRowDescription` `XhGridListRowSelectionIndicator` `XhGridListRowText` |
| Composable | `useGridList` |
| State machine | `gridListMachine` |
| Skin | `@xihan-ui/styles/grid-list.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `collection` | `GridListNode[]` |  |
| `value` | `string \| string[]` |  |
| `defaultValue` | `string \| string[]` |  |
| `selectionMode` | `GridListSelectionMode` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `loading` | `boolean` |  |
| `loop` | `boolean` |  |
| `typeahead` | `boolean` |  |
| `dir` | `Direction` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<GridListTranslations>` |  |
| `onValueChange` | `(details: GridListValueChangeDetails) => void` |  |
| `onAction` | `(details: GridListActionDetails) => void` |  |

### GridListNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `description` | `string` |  |
| `disabled` | `boolean` |  |
| `tone` | `Tone` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `GridListValueChangeDetails` |
| `action` | `GridListActionDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhGridListRoot` | `default` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhGridListRoot` | `children` | `ReactNode` |  |
| `XhGridListRow` | `value` | `string` | Yes |
| `XhGridListRow` | `disabled` | `boolean` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `row` | 'checked' \| 'unchecked' |
| `row-selection-indicator` | 'checked' \| 'unchecked' |
| `row-content` | 'checked' \| 'unchecked' |
| `row-text` | 'checked' \| 'unchecked' |
| `row-description` | 'checked' \| 'unchecked' |
| `row-actions` | 'checked' \| 'unchecked' |
| `row-action` | 'checked' \| 'unchecked' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `ROW.SELECT` · `ROW.TOGGLE` · `ROW.EXTEND` · `ROW.ACTION` · `ROW.FOCUS` · `GRID.BLUR` · `PRESS.START` · `PRESS.END`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string[]` |
| `collection` | `readonly GridListNodeMeta[]` |
| `selectionMode` | `GridListSelectionMode` |
| `focusedValue` | `string \| null` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `loading` | `boolean` |
| `isSelected` | `(value: string) => boolean` |
| `setValue` | `(next: string[]) => void` |
| `select` | `(value: string) => void` |
| `toggle` | `(value: string) => void` |
| `action` | `(value: string) => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getRowProps` | `(props: GridListRowProps) => T['element']` |
| `getRowSelectionIndicatorProps` | `(props: GridListRowProps) => T['element']` |
| `getRowContentProps` | `(props: GridListRowProps) => T['element']` |
| `getRowTextProps` | `(props: GridListRowProps) => T['element']` |
| `getRowDescriptionProps` | `(props: GridListRowProps) => T['element']` |
| `getRowActionsProps` | `(props: GridListRowProps) => T['element']` |
| `getRowActionProps` | `(props: GridListRowProps) => T['button']` |
| `getEmptyProps` | `() => T['element']` |
| `getLoadingProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteractionforlayoutgrids). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `grid-list.kbd.tab` |
| `ArrowDown` | `grid-list.kbd.next` |
| `ArrowUp` | `grid-list.kbd.prev` |
| `Home` | `grid-list.kbd.first` |
| `End` | `grid-list.kbd.last` |
| `Space` | `grid-list.kbd.select` |
| `Shift+ArrowDown` / `Shift+ArrowUp` / `Shift+Home` / `Shift+End` | `grid-list.kbd.extend` |
| `Shift+Space` | `grid-list.kbd.extend-select` |
| `Enter` | `grid-list.kbd.action` |
| `Ctrl+A` / `Cmd+A` | `grid-list.kbd.select-all` |
| any single printable character | `grid-list.kbd.typeahead` |
| `Enter` / `Space` | `grid-list.kbd.inline-action` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-label` | translations.root |
| `root` | `aria-labelledby` | id of the `label` part \| undefined |
| `root` | `aria-multiselectable` | 'true' \| undefined |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `role` | 'grid' |
| `row` | `aria-disabled` | 'true' \| 'false' |
| `row` | `aria-selected` | 'true' \| 'false' \| undefined |
| `row` | `role` | 'row' |
| `row-selection-indicator` | `aria-hidden` | 'true' |
| `row-content` | `role` | 'gridcell' |
| `row-actions` | `role` | 'gridcell' |

## Style reference

### Skin

`@xihan-ui/styles/grid-list.css` is written against `[data-scope="grid-list"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-grid-list` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `row` | `data-disabled` | '' (present only while the condition holds) |
| `row` | `data-highlighted` | '' (present only while the condition holds) |
| `row` | `data-pressed` | '' (present only while the condition holds) |
| `row` | `data-state` | 'checked' \| 'unchecked' |
| `row` | `data-tone` | metaOf.get(row.value)?.tone |
| `row` | `data-xh-collection-context` | 'page' |
| `row` | `data-xh-collection-item` | '' |
| `row` | `data-xh-collection-size` | props.size |
| `row-selection-indicator` | `data-disabled` | '' (present only while the condition holds) |
| `row-selection-indicator` | `data-highlighted` | '' (present only while the condition holds) |
| `row-selection-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `row-selection-indicator` | `data-xh-check-mark` | 'checked' \| 'unchecked' |
| `row-selection-indicator` | `data-xh-check-mark-profile` | 'box' |
| `row-selection-indicator` | `data-xh-collection-slot` | 'prefix' |
| `row-content` | `data-disabled` | '' (present only while the condition holds) |
| `row-content` | `data-highlighted` | '' (present only while the condition holds) |
| `row-content` | `data-state` | 'checked' \| 'unchecked' |
| `row-text` | `data-disabled` | '' (present only while the condition holds) |
| `row-text` | `data-highlighted` | '' (present only while the condition holds) |
| `row-text` | `data-state` | 'checked' \| 'unchecked' |
| `row-text` | `data-xh-collection-slot` | 'text' |
| `row-description` | `data-disabled` | '' (present only while the condition holds) |
| `row-description` | `data-highlighted` | '' (present only while the condition holds) |
| `row-description` | `data-state` | 'checked' \| 'unchecked' |
| `row-description` | `data-xh-collection-slot` | 'description' |
| `row-actions` | `data-disabled` | '' (present only while the condition holds) |
| `row-actions` | `data-highlighted` | '' (present only while the condition holds) |
| `row-actions` | `data-state` | 'checked' \| 'unchecked' |
| `row-action` | `data-disabled` | '' (present only while the condition holds) |
| `row-action` | `data-highlighted` | '' (present only while the condition holds) |
| `row-action` | `data-state` | 'checked' \| 'unchecked' |
| `row-action` | `data-xh-action-control` | '' |
| `row-action` | `data-xh-action-display` | 'always' |
| `row-action` | `data-xh-action-profile` | 'text' |
| `row-action` | `data-xh-action-size` | 'xs' |
| `row-action` | `data-xh-action-variant` | 'ghost' |
| `loading` | `data-loading` | '' (present only while the condition holds) |
| `loading` | `data-xh-loading-ring` | '' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-grid-list-bg` | `root` | `background` | `default`<br>`variant=outline`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface`<br>`transparent` |
| `--xh-grid-list-border` | `root` | `border-color` | `variant=outline` | `--xh-border-default` |
| `--xh-grid-list-border-invalid` | `root` | `border-color` | `invalid` | `--xh-border-invalid` |
| `--xh-grid-list-gap` | `root` | `gap` | `default` | `--xh-list-option-gap` |
| `--xh-grid-list-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-grid-list-label-fg` | `label` | `color` | `default` | `--xh-fg-default` |
| `--xh-grid-list-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-grid-list-label-font-weight` | `label` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-grid-list-label-px` | `label` | `padding-inline` | `default` | `--xh-control-px-md` |
| `--xh-grid-list-label-py` | `label` | `padding-block` | `default` | `--xh-space-1` |
| `--xh-grid-list-p` | `root` | `padding` | `default` | `--xh-space-1` |
| `--xh-grid-list-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-grid-list-row-action-font-size` | `row-action` | `font-size` | `default` | `--xh-control-font-sm` |
| `--xh-grid-list-row-actions-gap` | `row-actions` | `gap` | `default` | `--xh-space-1` |
| `--xh-grid-list-row-actions-ms` | `row-actions` | `margin-inline-start` | `default` | `--xh-control-gap-md` |
| `--xh-grid-list-row-bg-selected` | `row` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not(:focus-visible)`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` |
| `--xh-grid-list-row-content-gap` | `row-content` | `gap` | `default` | `--xh-space-1` |
| `--xh-grid-list-row-description-fg` | `row-description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-grid-list-row-description-font-size` | `row-description` | `font-size` | `default` | `--xh-control-caption-md` |
| `--xh-grid-list-row-fg-selected` | `row` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` |
| `--xh-grid-list-row-indicator-bg` | `row-selection-indicator` | `background` | `default` | `transparent` |
| `--xh-grid-list-row-indicator-bg-selected` | `row-selection-indicator` | `background` | `state=checked` | `--xh-_grid-list-indicator-accent` |
| `--xh-grid-list-row-indicator-border` | `row-selection-indicator` | `border` | `default` | `--xh-border-control` |
| `--xh-grid-list-row-indicator-border-selected` | `row-selection-indicator` | `border-color` | `state=checked` | `--xh-_grid-list-indicator-accent` |
| `--xh-grid-list-row-indicator-fg-selected` | `row-selection-indicator` | `color` | `default` | `--xh-_grid-list-indicator-on-accent` |
| `--xh-grid-list-row-indicator-glyph-size` | `row-selection-indicator` | `--xh-icon-size` | `default` | `--xh-_grid-list-indicator-glyph` |
| `--xh-grid-list-row-indicator-me` | `row-selection-indicator` | `margin-inline-end` | `default` | `--xh-control-gap-md` |
| `--xh-grid-list-row-indicator-radius` | `row-selection-indicator` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-grid-list-row-indicator-size` | `row-selection-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-_grid-list-indicator` |
| `--xh-grid-list-row-loading-opacity` | `root`<br>`row` | `opacity` | `loading` | `--xh-state-disabled-opacity` |
| `--xh-grid-list-row-radius` | `row` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-grid-list-state-fg` | `empty`<br>`loading` | `color` | `default` | `--xh-fg-muted` |
| `--xh-grid-list-state-font-size` | `empty`<br>`loading` | `font-size` | `default` | `--xh-_grid-list-state-font-size` |
| `--xh-grid-list-state-gap` | `empty`<br>`loading` | `gap` | `default` | `--xh-control-gap-md` |
| `--xh-grid-list-state-px` | `empty`<br>`loading` | `padding-inline` | `default` | `--xh-_grid-list-state-px` |
| `--xh-grid-list-state-py` | `empty`<br>`loading` | `padding-block` | `default` | `--xh-space-3` |
