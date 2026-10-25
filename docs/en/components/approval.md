# Approval <Badge type="info" text="alpha" />

AI chat component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/approval).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/approval" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/approval.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/approval" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/approval" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/approval.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="approval"`: **`root`** · `pending-indicator` · `title` · `description` · `live-region` · `group` · `item` · `item-indicator` · `item-text` · `note` · `timer` · `result` · `footer` · **`approve-trigger`** · **`deny-trigger`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-approval>` |
| Vue components | `XhApprovalApproveTrigger` `XhApprovalDenyTrigger` `XhApprovalDescription` `XhApprovalFooter` `XhApprovalGroup` `XhApprovalItem` `XhApprovalItemIndicator` `XhApprovalItemText` `XhApprovalLiveRegion` `XhApprovalNote` `XhApprovalPendingIndicator` `XhApprovalResult` `XhApprovalRoot` `XhApprovalTimer` `XhApprovalTitle` |
| Composable | `useApproval` |
| State machine | `approvalMachine` |
| Skin | `@xihan-ui/styles/approval.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `requestId` | `string` |  |
| `status` | `ApprovalStatus` |  |
| `defaultStatus` | `ApprovalStatus` |  |
| `timeoutMs` | `number` |  |
| `scopes` | `readonly ApprovalScope[]` |  |
| `grantedScopes` | `readonly string[]` |  |
| `defaultGrantedScopes` | `readonly string[]` |  |
| `note` | `string` |  |
| `defaultNote` | `string` |  |
| `requireReason` | `boolean` |  |
| `loading` | `boolean` |  |
| `denyOnEscape` | `boolean` |  |
| `denyOnUnmount` | `boolean` |  |
| `live` | `'polite' \| 'assertive'` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `parts` | `TitleDescriptionParts` |  |
| `translations` | `Partial<ApprovalTranslations>` |  |
| `onDecision` | `(details: ApprovalDecisionDetails) => void` |  |
| `onGrantedScopesChange` | `(details: ApprovalScopesChangeDetails) => void` |  |
| `onNoteChange` | `(details: ApprovalNoteChangeDetails) => void` |  |

### ApprovalScope

Elements of `scopes`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `required` | `boolean` |  |
| `disabled` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `decision` | `ApprovalDecisionDetails` |
| `granted-scopes-change` | `ApprovalScopesChangeDetails` |
| `note-change` | `ApprovalNoteChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhApprovalItem` | `default` | `ApprovalScopeSlotProps` |
| `XhApprovalRoot` | `default` | `ApprovalRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhApprovalItem` | `scopeValue` | `string` | Yes |
| `XhApprovalItem` | `scopeLabel` | `string` |  |
| `XhApprovalItem` | `scopeRequired` | `boolean` |  |
| `XhApprovalItem` | `scopeDisabled` | `boolean` |  |
| `XhApprovalItem` | `children` | `SlotChildren<ApprovalScopeSlotProps>` |  |
| `XhApprovalItemIndicator` | `scopeValue` | `string` | Yes |
| `XhApprovalItemText` | `scopeValue` | `string` | Yes |
| `XhApprovalRoot` | `children` | `SlotChildren<ApprovalRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `pending-indicator` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `item` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |
| `note` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `timer` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `result` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `approve-trigger` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `deny-trigger` | 'pending' \| 'approved' \| 'denied' \| 'expired' |

The following names are internal to the state machine.

**States**: `pending` · `approved` · `denied` · `expired`

**Events**: `APPROVE` · `DENY` · `SCOPE.TOGGLE` · `SCOPE.SET` · `NOTE.SET` · `after.timeout` · `CONTROLLED.PENDING` · `CONTROLLED.APPROVE` · `CONTROLLED.DENY` · `CONTROLLED.EXPIRE` · `REQUEST.RESET` · `PRESS.START` · `PRESS.END` · `REASON.PROMPT`

**Guards**: `isStatusControlled` · `canApprove` · `isEditable` · `canApproveControlled` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `status` | `ApprovalStatus` |
| `settled` | `boolean` |
| `loading` | `boolean` |
| `grantedScopes` | `string[]` |
| `note` | `string` |
| `canApprove` | `boolean` |
| `reasonMissing` | `boolean` |
| `announcement` | `string` |
| `approve` | `() => void` |
| `deny` | `() => void` |
| `setGrantedScopes` | `(next: string[]) => void` |
| `setNote` | `(next: string) => void` |
| `isScopeGranted` | `(value: string) => boolean` |
| `getRootProps` | `() => T['element']` |
| `getPendingIndicatorProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getLiveRegionProps` | `() => T['element']` |
| `getGroupProps` | `() => T['element']` |
| `getItemProps` | `(scope: ApprovalScope) => T['element']` |
| `getItemIndicatorProps` | `(scope: ApprovalScope) => T['element']` |
| `getItemTextProps` | `(scope: ApprovalScope) => T['element']` |
| `getNoteProps` | `() => T['input']` |
| `getTimerProps` | `() => T['element']` |
| `getResultProps` | `() => T['element']` |
| `getFooterProps` | `() => T['element']` |
| `getApproveTriggerProps` | `() => T['button']` |
| `getDenyTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `approval.kbd.approve` |
| `Enter` / `Space` | `approval.kbd.deny` |
| `Space` | `approval.kbd.scope-toggle` |
| `Enter` / `Space` | `approval.kbd.press` |
| `Space` | `approval.kbd.item-press` |
| `Escape` | `approval.kbd.escape` |
| `Enter` / `Space` / `Escape` | `approval.kbd.deny-reason` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-describedby` | id of the `description` part \| undefined |
| `root` | `aria-labelledby` | id of the `title` part \| undefined |
| `root` | `role` | 'group' |
| `pending-indicator` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | props.live |
| `group` | `aria-label` | translations.scopes |
| `group` | `role` | 'group' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-required` | 'true' \| 'false' |
| `item` | `role` | 'checkbox' |
| `item-indicator` | `aria-hidden` | 'true' |
| `note` | `aria-invalid` | 'true' \| undefined |
| `note` | `aria-label` | translations.reason \| translations.note |
| `note` | `aria-required` | 'true' \| undefined |
| `timer` | `aria-hidden` | 'true' |
| `result` | `aria-hidden` | 'true' |
| `approve-trigger` | `aria-busy` | 'true' \| undefined |
| `approve-trigger` | `aria-disabled` | 'true' \| 'false' |
| `approve-trigger` | `aria-label` | translations.approve |
| `deny-trigger` | `aria-busy` | 'true' \| undefined |
| `deny-trigger` | `aria-disabled` | 'true' \| 'false' |
| `deny-trigger` | `aria-label` | translations.deny |

## Style reference

### Skin

`@xihan-ui/styles/approval.css` is written against `[data-scope="approval"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-approval` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `pending-indicator` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-value` | item.value |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'row' |
| `item` | `data-xh-action-size` | props.size |
| `item` | `data-xh-action-variant` | 'ghost' |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-value` | item.value |
| `note` | `data-invalid` | '' (present only while the condition holds) |
| `note` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `timer` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `result` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `result` | `data-tone` | 'success' \| 'danger' \| undefined |
| `footer` | `data-loading` | '' (present only while the condition holds) |
| `footer` | `data-xh-loading-ring` | '' |
| `approve-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `approve-trigger` | `data-loading` | '' (present only while the condition holds) |
| `approve-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `approve-trigger` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `approve-trigger` | `data-tone` | props.tone |
| `approve-trigger` | `data-xh-action-control` | '' |
| `approve-trigger` | `data-xh-action-display` | 'always' |
| `approve-trigger` | `data-xh-action-profile` | 'text' |
| `approve-trigger` | `data-xh-action-size` | props.size |
| `approve-trigger` | `data-xh-action-variant` | 'solid' |
| `approve-trigger` | `data-xh-ink-surface` | '' |
| `deny-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `deny-trigger` | `data-loading` | '' (present only while the condition holds) |
| `deny-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `deny-trigger` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `deny-trigger` | `data-xh-action-control` | '' |
| `deny-trigger` | `data-xh-action-display` | 'always' |
| `deny-trigger` | `data-xh-action-profile` | 'text' |
| `deny-trigger` | `data-xh-action-size` | props.size |
| `deny-trigger` | `data-xh-action-variant` | 'outline' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-approval-action-font-size` | `approve-trigger`<br>`deny-trigger` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-approval-action-font-weight` | `approve-trigger`<br>`deny-trigger` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-approval-action-h` | `approve-trigger`<br>`deny-trigger` | `block-size`<br>`min-block-size` | `default`<br>`xh-action-profile=row` | `--xh-_approval-action-h` |
| `--xh-approval-action-px` | `approve-trigger`<br>`deny-trigger` | `padding-inline` | `default` | `--xh-_approval-action-px` |
| `--xh-approval-action-radius` | `approve-trigger`<br>`deny-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-approval-approve-bg` | `approve-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`loading`<br>`xh-ink-surface` | `--xh-_action-variant-bg-loading`<br>`--xh-_action-variant-bg-rest` |
| `--xh-approval-approve-bg-hover` | `approve-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-approval-approve-bg-off` | `approve-trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled` |
| `--xh-approval-approve-fg` | `approve-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-loading`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-approval-approve-shadow` | `approve-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_highlight-tone` |
| `--xh-approval-bg` | `root` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-approval-border` | `root` | `border`<br>`border-color` | `default`<br>`tone` | `--xh-_tone`<br>`--xh-border-default` |
| `--xh-approval-border-settled` | `root` | `border-color` | `not([data-state='pending'])`<br>`state=pending` | `--xh-border-default` |
| `--xh-approval-deny-bg` | `deny-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-approval-deny-bg-hover` | `deny-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-approval-deny-bg-off` | `deny-trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled` |
| `--xh-approval-deny-border` | `deny-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` |
| `--xh-approval-deny-border-off` | `deny-trigger` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` |
| `--xh-approval-deny-fg` | `deny-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-approval-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-approval-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-approval-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` |
| `--xh-approval-gap` | `root` | `gap` | `default` | `--xh-_approval-gap` |
| `--xh-approval-group-gap` | `group` | `gap` | `default` | `--xh-space-1` |
| `--xh-approval-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_approval-icon-size` |
| `--xh-approval-indicator-bg-checked` | `item-indicator` | `background` | `state=checked` | `--xh-bg-brand` |
| `--xh-approval-indicator-border` | `item-indicator` | `border` | `default` | `--xh-border-control` |
| `--xh-approval-indicator-border-checked` | `item-indicator` | `border-color` | `state=checked` | `--xh-bg-brand` |
| `--xh-approval-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-fg-on-brand` |
| `--xh-approval-indicator-icon-size` | `item-indicator` | `--xh-icon-size` | `default` | `--xh-_approval-indicator-glyph` |
| `--xh-approval-indicator-radius` | `item-indicator` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-approval-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-approval-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-approval-item-font-size` | `item` | `font-size` | `default` | `--xh-_approval-item-font-size` |
| `--xh-approval-item-gap` | `item` | `gap` | `default` | `--xh-space-1_5` |
| `--xh-approval-item-px` | `item` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-approval-item-py` | `item` | `padding-block` | `xh-action-profile=row` | `--xh-space-1` |
| `--xh-approval-item-radius` | `item` | `border-radius` | `default` | `--xh-_action-profile-radius` |
| `--xh-approval-item-text-fg` | `item-text` | `color` | `default` | `--xh-fg-muted` |
| `--xh-approval-item-text-fg-checked` | `item`<br>`item-text` | `color` | `state=checked` | `--xh-fg-default` |
| `--xh-approval-loading-duration` | `footer` | `animation` | `xh-loading-ring` | `--xh-motion-loop-spin` |
| `--xh-approval-note-bg` | `note` | `background` | `default` | `--xh-bg-field` |
| `--xh-approval-note-bg-disabled` | `note` | `background` | `disabled` | `--xh-bg-subtle` |
| `--xh-approval-note-bg-focus` | `note` | `background` | `focus-within` | `--xh-bg-surface` |
| `--xh-approval-note-bg-invalid` | `note` | `background` | `invalid` | `--xh-bg-field-invalid` |
| `--xh-approval-note-border` | `note` | `border` | `default` | `--xh-border-control` |
| `--xh-approval-note-border-disabled` | `note` | `border-color` | `disabled` | `--xh-border-default` |
| `--xh-approval-note-border-focus` | `note` | `border-color` | `focus-within` | `--xh-border-control-focus` |
| `--xh-approval-note-border-hover` | `note` | `border-color` | `hover`<br>`invalid`<br>`not(:disabled, :focus, [data-invalid])` | `--xh-border-strong` |
| `--xh-approval-note-border-invalid` | `note` | `border-color` | `invalid` | `--xh-border-invalid` |
| `--xh-approval-note-fg` | `note` | `color` | `default` | `--xh-fg-default` |
| `--xh-approval-note-font-size` | `note` | `font-size` | `default` | `--xh-_approval-note-font-size` |
| `--xh-approval-note-px` | `note` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-approval-note-py` | `note` | `padding-block` | `default` | `--xh-space-1_5` |
| `--xh-approval-note-radius` | `note` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-approval-p` | `pending-indicator`<br>`root` | `inset-block-start`<br>`inset-inline-end`<br>`padding` | `default` | `--xh-_approval-p` |
| `--xh-approval-pending-indicator-color` | `pending-indicator` | `background` | `default` | `--xh-_tone-soft` |
| `--xh-approval-pending-indicator-radius` | `pending-indicator` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-approval-pending-indicator-size` | `pending-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-space-2` |
| `--xh-approval-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-approval-result-bg` | `result` | `background` | `default` | `--xh-_tone-subtle` |
| `--xh-approval-result-bg-denied` | `result` | `background` | `is([data-state='denied'], [data-state='expired'])`<br>`state=denied`<br>`state=expired` | `--xh-_tone-subtle` |
| `--xh-approval-result-fg` | `result` | `color` | `default` | `--xh-_tone-fg` |
| `--xh-approval-result-fg-denied` | `result` | `color` | `is([data-state='denied'], [data-state='expired'])`<br>`state=denied`<br>`state=expired` | `--xh-_tone-fg` |
| `--xh-approval-result-font-size` | `result` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-approval-result-font-weight` | `result` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-approval-result-gap` | `result` | `gap` | `default` | `--xh-space-1` |
| `--xh-approval-result-h` | `result` | `min-block-size` | `default` | `--xh-chip-h-sm` |
| `--xh-approval-result-px` | `result` | `padding-inline` | `default` | `--xh-space-1_5` |
| `--xh-approval-result-py` | `result` | `padding-block` | `default` | `0` |
| `--xh-approval-result-radius` | `result` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-approval-shadow` | `root` | `box-shadow` | `default` | `none` |
| `--xh-approval-timer-fg` | `timer` | `color` | `default` | `--xh-fg-muted` |
| `--xh-approval-timer-font-size` | `timer` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-approval-title-fg` | `title` | `color` | `default` | `--xh-fg-default` |
| `--xh-approval-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-approval-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-medium` |
