# SignaturePad

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/signature-pad).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/signature-pad" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/signature-pad.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/signature-pad" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/signature-pad" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/signature-pad.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="signature-pad"`: **`root`** · `label` · **`control`** · `guide` · **`path`** · `undo-trigger` · `redo-trigger` · `clear-trigger` · `status` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-signature-pad>` |
| Vue components | `XhSignaturePadClearTrigger` `XhSignaturePadControl` `XhSignaturePadGuide` `XhSignaturePadHiddenInput` `XhSignaturePadLabel` `XhSignaturePadPath` `XhSignaturePadRedoTrigger` `XhSignaturePadRoot` `XhSignaturePadStatus` `XhSignaturePadUndoTrigger` |
| Composable | `useSignaturePad` |
| State machine | `signaturePadMachine` |
| Skin | `@xihan-ui/styles/signature-pad.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `labelled` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `invalid` | `boolean` |  |
| `name` | `string` |  |
| `value` | `SignaturePadValue` |  |
| `defaultValue` | `SignaturePadValue` |  |
| `drawing` | `SignaturePadDrawingOptions` |  |
| `translations` | `Partial<SignaturePadTranslations>` |  |
| `onDraw` | `(details: SignaturePadDrawDetails) => void` |  |
| `onDrawEnd` | `(details: SignaturePadDrawEndDetails) => void` |  |
| `onValueChange` | `(details: SignaturePadValueChangeDetails) => void` |  |
| `onClear` | `() => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `draw` | `SignaturePadDrawDetails` |
| `draw-end` | `SignaturePadDrawEndDetails` |
| `value-change` | `SignaturePadValueChangeDetails` |
| `clear` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhSignaturePadRoot` | `default` | `SignaturePadRootSlotProps` |
| `XhSignaturePadRoot` | `label` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhSignaturePadRoot` | `label` | `ReactNode` |  |
| `XhSignaturePadRoot` | `children` | `SlotChildren<SignaturePadRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `drawing` · `idle`

**Events**: `DRAW.START` · `DRAW.MOVE` · `DRAW.END` · `STROKES.CLEAR` · `HISTORY.UNDO` · `HISTORY.REDO` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `canDraw` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `SignaturePadValue` |
| `paths` | `readonly string[]` |
| `empty` | `boolean` |
| `drawing` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `canUndo` | `boolean` |
| `canRedo` | `boolean` |
| `statusText` | `string` |
| `translations` | `SignaturePadTranslations` |
| `toSvg` | `() => string` |
| `clear` | `() => void` |
| `undo` | `() => void` |
| `redo` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getControlProps` | `() => T['element']` |
| `getGuideProps` | `() => T['element']` |
| `getPathProps` | `() => T['element']` |
| `getClearTriggerProps` | `() => T['button']` |
| `getUndoTriggerProps` | `() => T['button']` |
| `getRedoTriggerProps` | `() => T['button']` |
| `getStatusProps` | `() => T['element']` |
| `getHiddenInputProps` | `() => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `signature-pad.kbd.clear` |
| `Enter` / `Space` | `signature-pad.kbd.undo` |
| `Enter` / `Space` | `signature-pad.kbd.redo` |
| `Enter` / `Space` | `signature-pad.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `control` | `aria-label` | props.ariaLabel |
| `control` | `aria-labelledby` | id of the `label` part \| undefined |
| `control` | `role` | 'img' |
| `guide` | `aria-hidden` | 'true' |
| `undo-trigger` | `aria-disabled` | 'true' \| undefined |
| `undo-trigger` | `aria-label` | translations.undoTrigger |
| `redo-trigger` | `aria-disabled` | 'true' \| undefined |
| `redo-trigger` | `aria-label` | translations.redoTrigger |
| `clear-trigger` | `aria-label` | translations.clearTrigger |
| `status` | `aria-atomic` | 'true' |
| `status` | `aria-live` | 'polite' |
| `status` | `role` | 'status' |
| `hidden-input` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-invalid` | 'true' \| 'false' |

## Style reference

### Skin

`@xihan-ui/styles/signature-pad.css` is written against `[data-scope="signature-pad"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-signature-pad` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-drawing` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `label` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-disabled` | '' (present only while the condition holds) |
| `control` | `data-drawing` | '' (present only while the condition holds) |
| `control` | `data-empty` | '' (present only while the condition holds) |
| `control` | `data-invalid` | '' (present only while the condition holds) |
| `control` | `data-readonly` | '' (present only while the condition holds) |
| `guide` | `data-disabled` | '' (present only while the condition holds) |
| `path` | `data-empty` | '' (present only while the condition holds) |
| `undo-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `undo-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `undo-trigger` | `data-xh-action-control` | '' |
| `undo-trigger` | `data-xh-action-display` | 'always' |
| `undo-trigger` | `data-xh-action-profile` | 'text' |
| `undo-trigger` | `data-xh-action-size` | 'sm' |
| `undo-trigger` | `data-xh-action-variant` | 'outline' |
| `redo-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `redo-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `redo-trigger` | `data-xh-action-control` | '' |
| `redo-trigger` | `data-xh-action-display` | 'always' |
| `redo-trigger` | `data-xh-action-profile` | 'text' |
| `redo-trigger` | `data-xh-action-size` | 'sm' |
| `redo-trigger` | `data-xh-action-variant` | 'outline' |
| `clear-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `clear-trigger` | `data-empty` | '' (present only while the condition holds) |
| `clear-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'always' |
| `clear-trigger` | `data-xh-action-profile` | 'text' |
| `clear-trigger` | `data-xh-action-size` | 'sm' |
| `clear-trigger` | `data-xh-action-variant` | 'outline' |
| `status` | `data-empty` | '' (present only while the condition holds) |
| `hidden-input` | `data-disabled` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-signature-pad-aspect-ratio` | `control` | `aspect-ratio` | `default` | `5 / 2` |
| `--xh-signature-pad-bg` | `control` | `background` | `default` | `--xh-bg-field` |
| `--xh-signature-pad-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` |
| `--xh-signature-pad-bg-drawing` | `control` | `background` | `drawing` | `--xh-bg-surface` |
| `--xh-signature-pad-bg-invalid` | `control` | `background` | `invalid` | `--xh-bg-field-invalid` |
| `--xh-signature-pad-bg-readonly` | `control` | `background` | `disabled`<br>`not([data-disabled])`<br>`readonly` | `--xh-bg-subtle` |
| `--xh-signature-pad-border` | `control` | `border` | `default` | `--xh-border-control` |
| `--xh-signature-pad-border-disabled` | `control` | `border-color` | `disabled` | `--xh-border-default` |
| `--xh-signature-pad-border-drawing` | `control` | `border-color` | `drawing` | `--xh-border-control-focus` |
| `--xh-signature-pad-border-hover` | `control` | `border-color` | `disabled`<br>`drawing`<br>`hover`<br>`invalid`<br>`not([data-disabled])`<br>`not([data-drawing])`<br>`not([data-invalid])`<br>`not([data-readonly])`<br>`readonly` | `--xh-border-strong` |
| `--xh-signature-pad-clear-bg` | `clear-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` |
| `--xh-signature-pad-clear-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-signature-pad-clear-bg-disabled` | `clear-trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled` |
| `--xh-signature-pad-clear-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-signature-pad-clear-border` | `clear-trigger` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest` |
| `--xh-signature-pad-clear-border-hover` | `clear-trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` |
| `--xh-signature-pad-clear-fg` | `clear-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-signature-pad-clear-fg-empty` | `clear-trigger` | `color` | `empty` | `--xh-fg-muted` |
| `--xh-signature-pad-clear-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` |
| `--xh-signature-pad-clear-gap` | `clear-trigger` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-signature-pad-clear-h` | `clear-trigger` | `block-size` | `default` | `--xh-_action-profile-visual-size` |
| `--xh-signature-pad-clear-icon-size` | `clear-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-signature-pad-clear-px` | `clear-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-signature-pad-clear-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-signature-pad-clear-shadow-hover` | `clear-trigger` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` |
| `--xh-signature-pad-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` |
| `--xh-signature-pad-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-2` |
| `--xh-signature-pad-guide-stroke` | `guide` | `stroke` | `default` | `--xh-border-control` |
| `--xh-signature-pad-ink` | `path` | `fill` | `default` | `--xh-fg-default` |
| `--xh-signature-pad-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-signature-pad-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-muted` |
| `--xh-signature-pad-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-signature-pad-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-signature-pad-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-2` |
| `--xh-signature-pad-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-signature-pad-status-fg` | `status` | `color` | `default` | `--xh-fg-muted` |
| `--xh-signature-pad-status-font-size` | `status` | `font-size` | `default` | `--xh-text-secondary-size` |
