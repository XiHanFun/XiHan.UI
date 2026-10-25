# Form

Data entry component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/form).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/form" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/form.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/form" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/form" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/form.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="form"`: **`root`** · `field-group` · `error-summary` · `error-summary-item` · `submit-trigger` · `reset-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-form>` |
| Vue components | `XhFormErrorSummary` `XhFormErrorSummaryItem` `XhFormFieldGroup` `XhFormResetTrigger` `XhFormRoot` `XhFormSubmitTrigger` |
| Composable | `useForm` |
| State machine | `formMachine` |
| Skin | `@xihan-ui/styles/form.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `values` | `TValues` |  |
| `defaultValues` | `TValues` |  |
| `errors` | `FormErrorPatch` |  |
| `defaultErrors` | `FormErrorPatch` |  |
| `validate` | `(values: TValues) => FormErrorPatchOf<TValues> \| Promise<FormErrorPatchOf<TValues>>` |  |
| `schema` | `FormStandardSchema` |  |
| `rules` | `FormRules<TValues>` |  |
| `validateMessages` | `FormValidateMessages` |  |
| `translations` | `Partial<FormTranslations>` |  |
| `validateOn` | `FormValidateOn` |  |
| `layout` | `FormLayout` |  |
| `columns` | `FormColumns` |  |
| `labelWidth` | `number \| string` |  |
| `labelAlign` | `'start' \| 'end'` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `onValuesChange` | `(details: FormValuesChangeDetails<TValues>) => void` |  |
| `onErrorsChange` | `(details: FormErrorsChangeDetails) => void` |  |
| `onSubmit` | `(details: FormSubmitDetails<TValues>) => void \| PromiseLike<unknown>` |  |
| `onSubmitError` | `(details: FormSubmitErrorDetails<TValues>) => void` |  |
| `onInvalid` | `(details: FormInvalidDetails<TValues>) => void` |  |
| `onValidationError` | `(details: FormValidationErrorDetails<TValues>) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `values-change` | `FormValuesChangeDetails` |
| `errors-change` | `FormErrorsChangeDetails` |
| `submit` | `FormSubmitDetails` |
| `submit-error` | `FormSubmitErrorDetails` |
| `invalid` | `FormSubmitDetails` |
| `validation-error` | `FormValidationErrorDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhFormErrorSummary` | `default` | `FormErrorSummarySlotProps` |
| `XhFormErrorSummaryItem` | `default` | `FormErrorSummaryItemSlotProps` |
| `XhFormFieldGroup` | `default` | `FormFieldGroupSlotProps` |
| `XhFormRoot` | `default` | `FormRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhFormErrorSummary` | `children` | `SlotChildren<FormErrorSummarySlotProps>` |  |
| `XhFormErrorSummaryItem` | `name` | `P` | Yes |
| `XhFormErrorSummaryItem` | `children` | `SlotChildren<FormErrorSummaryItemSlotProps<P>>` |  |
| `XhFormFieldGroup` | `name` | `P` | Yes |
| `XhFormFieldGroup` | `span` | `FormFieldSpan` |  |
| `XhFormFieldGroup` | `children` | `SlotChildren<FormFieldGroupSlotProps<TValues, P>>` |  |
| `XhFormRoot` | `children` | `SlotChildren<FormRootSlotProps<TValues>>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'invalid' \| 'idle' |
| `error-summary` | 'invalid' \| 'idle' |

The following names are internal to the state machine.

**States**: `idle` · `invalid`

**Events**: `SUBMIT` · `RESET` · `FIELD.RESET` · `VALIDATE` · `SUBMIT.SETTLED` · `VALIDATION.PASS` · `VALIDATION.FAIL` · `FIELD.SET` · `FIELD.ARRAY.MUTATE` · `FIELD.BLUR` · `ERROR.SET` · `ERRORS.CLEAR` · `ERROR.FOCUS` · `PRESS.START` · `PRESS.END` · `SUMMARY.SNAPSHOT` · `SUMMARY.RENDERED`

**Guards**: `isEnabled` · `isEditable` · `isValidationSnapshotCurrent` · `canPress` · `isSubmitting`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `values` | `TValues` |
| `errors` | `FormErrors` |
| `errorNames` | `FormPath[]` |
| `errorCount` | `number` |
| `invalid` | `boolean` |
| `submitFailed` | `boolean` |
| `validating` | `boolean` |
| `submitting` | `boolean` |
| `dirty` | `boolean` |
| `validationError` | `FormValidationErrorDetails<TValues> \| null` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `validateOn` | `FormValidateOn` |
| `layout` | `FormLayout` |
| `getFieldId` | `(name: FormFieldPath<TValues>) => string` |
| `getFieldValue` | `<P extends FormFieldPath<TValues>>(name: P) => FormPathValue<TValues, P> \| undefined` |
| `getFieldError` | `(name: FormFieldPath<TValues>) => string \| undefined` |
| `summaryErrors` | `FormErrors` |
| `summaryErrorNames` | `FormPath[]` |
| `summaryErrorCount` | `number` |
| `getSummaryError` | `(name: FormFieldPath<TValues>) => string \| undefined` |
| `isFieldInvalid` | `(name: FormFieldPath<TValues>) => boolean` |
| `isFieldDirty` | `(name: FormFieldPath<TValues>) => boolean` |
| `isFieldTouched` | `(name: FormFieldPath<TValues>) => boolean` |
| `isFieldRequired` | `(name: FormFieldPath<TValues>) => boolean` |
| `setFieldValue` | `<P extends FormFieldPath<TValues>>(name: P, value: FormPathValue<TValues, P>) => void` |
| `setFieldError` | `(name: FormFieldPath<TValues>, message?: string) => void` |
| `clearErrors` | `() => void` |
| `submit` | `() => void` |
| `validateAll` | `() => Promise<FormValidateResult>` |
| `validateField` | `(name: FormFieldPath<TValues>) => Promise<FormValidateResult>` |
| `validateFields` | `(names: readonly FormFieldPath<TValues>[]) => Promise<FormValidateResult>` |
| `resetField` | `(name: FormFieldPath<TValues>) => void` |
| `reset` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getFieldGroupProps` | `(props: FormFieldGroupProps<TValues>) => T['element']` |
| `getErrorSummaryProps` | `() => T['element']` |
| `getErrorSummaryItemProps` | `(props: FormErrorSummaryItemProps<TValues>) => T['element']` |
| `getSubmitTriggerProps` | `() => T['button']` |
| `getResetTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `form.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `error-summary` | `aria-atomic` | 'true' |
| `error-summary` | `aria-live` | 'assertive' |
| `error-summary` | `role` | 'alert' |
| `submit-trigger` | `aria-busy` | 'true' \| undefined |
| `submit-trigger` | `aria-disabled` | 'true' \| undefined |

## Style reference

### Skin

`@xihan-ui/styles/form.css` is written against `[data-scope="form"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-form` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-columns` | columns.base |
| `root` | `data-columns-lg` | columns.lg |
| `root` | `data-columns-md` | columns.md |
| `root` | `data-columns-sm` | columns.sm |
| `root` | `data-columns-xl` | columns.xl |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-label-align` | props.labelAlign |
| `root` | `data-layout` | props.layout |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-state` | 'invalid' \| 'idle' |
| `field-group` | `data-disabled` | '' (present only while the condition holds) |
| `field-group` | `data-invalid` | '' (present only while the condition holds) |
| `field-group` | `data-readonly` | '' (present only while the condition holds) |
| `field-group` | `data-span` | fieldSpan(field.span) |
| `error-summary` | `data-count` | String(summaryErrorNames.length) |
| `error-summary` | `data-state` | 'invalid' \| 'idle' |
| `error-summary-item` | `data-invalid` | '' (present only while the condition holds) |
| `error-summary-item` | `data-pressed` | '' (present only while the condition holds) |
| `submit-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `submit-trigger` | `data-loading` | '' (present only while the condition holds) |
| `submit-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `submit-trigger` | `data-xh-action-control` | '' |
| `submit-trigger` | `data-xh-action-display` | 'always' |
| `submit-trigger` | `data-xh-action-profile` | 'text' |
| `submit-trigger` | `data-xh-action-size` | 'md' |
| `submit-trigger` | `data-xh-action-variant` | 'solid' |
| `submit-trigger` | `data-xh-ink-surface` | '' |
| `submit-trigger` | `data-xh-loading-ring` | 'overlay' |
| `reset-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `reset-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `reset-trigger` | `data-xh-action-control` | '' |
| `reset-trigger` | `data-xh-action-display` | 'always' |
| `reset-trigger` | `data-xh-action-profile` | 'text' |
| `reset-trigger` | `data-xh-action-size` | 'md' |
| `reset-trigger` | `data-xh-action-variant` | 'outline' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-form-field-gap` | `field-group` | `gap` | `default` | `--xh-space-1` |
| `--xh-form-gap` | `root` | `column-gap`<br>`margin-block-end` | `layout=grid`<br>`where(:not(:last-child)`<br>`where([data-scope='form'][data-part='root'])` | `--xh-space-5` |
| `--xh-form-inline-gap` | `root` | `column-gap` | `layout=inline` | `--xh-space-6` |
| `--xh-form-inline-row-gap` | `root` | `margin-block-end` | `layout=inline`<br>`where(:not(:last-child)`<br>`where([data-scope='form'][data-part='root'])` | `--xh-space-2` |
| `--xh-form-label-w` | `root` | `grid-template-columns` | `layout=horizontal` | `calc(100% * 5 / 24)` |
| `--xh-form-loading-duration` | `submit-trigger` | `animation` | `xh-loading-ring` | `--xh-motion-loop-spin` |
| `--xh-form-submit-bg` | `submit-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-form-submit-bg-active` | `submit-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-form-submit-bg-hover` | `submit-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-form-submit-border` | `submit-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` |
| `--xh-form-submit-border-active` | `submit-trigger` | `border-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-pressed` |
| `--xh-form-submit-border-hover` | `submit-trigger` | `border-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-border-hover` |
| `--xh-form-submit-fg` | `submit-trigger` | `border`<br>`border-color`<br>`color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`motion=reduce`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`where([data-motion='reduce'])`<br>`xh-loading-ring`<br>`xh-loading-ring=overlay` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-loading`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-form-submit-shadow` | `submit-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_highlight-brand` |
| `--xh-form-summary-bg` | `error-summary` | `background` | `default` | `--xh-bg-surface` |
| `--xh-form-summary-border` | `error-summary` | `border` | `default` | `--xh-border-invalid` |
| `--xh-form-summary-fg` | `error-summary` | `color` | `default` | `--xh-fg-danger` |
| `--xh-form-summary-font-size` | `error-summary` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-form-summary-gap` | `error-summary` | `gap` | `default` | `--xh-space-1_5` |
| `--xh-form-summary-item-bg` | `error-summary-item` | `background` | `default` | `transparent` |
| `--xh-form-summary-item-bg-hover` | `error-summary-item` | `background` | `hover` | `--xh-bg-subtle` |
| `--xh-form-summary-item-bg-pressed` | `error-summary-item` | `background` | `is(:active, [data-pressed])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-form-summary-item-fg-hover` | `error-summary-item` | `color` | `hover`<br>`is(:active, [data-pressed])`<br>`pressed` | `--xh-fg-danger-hover` |
| `--xh-form-summary-item-font-size` | `error-summary-item` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-form-summary-item-px` | `error-summary-item` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-form-summary-item-radius` | `error-summary-item` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-form-summary-item-underline-offset` | `error-summary-item` | `text-underline-offset` | `default` | `--xh-space-0_5` |
| `--xh-form-summary-px` | `error-summary` | `padding-inline` | `default` | `--xh-control-px-md` |
| `--xh-form-summary-py` | `error-summary` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-form-summary-radius` | `error-summary` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-form-summary-shadow` | `error-summary` | `box-shadow` | `default` | `none` |
| `--xh-form-trigger-bg` | `reset-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-form-trigger-bg-active` | `reset-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-form-trigger-bg-disabled` | `reset-trigger`<br>`submit-trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled` |
| `--xh-form-trigger-bg-hover` | `reset-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-form-trigger-border` | `reset-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` |
| `--xh-form-trigger-border-disabled` | `reset-trigger`<br>`submit-trigger` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` |
| `--xh-form-trigger-border-hover` | `reset-trigger` | `border-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-border-hover` |
| `--xh-form-trigger-fg` | `reset-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-form-trigger-font-size` | `reset-trigger`<br>`submit-trigger` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-form-trigger-h` | `reset-trigger`<br>`submit-trigger` | `block-size` | `default` | `--xh-_action-profile-visual-size` |
| `--xh-form-trigger-px` | `reset-trigger`<br>`submit-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-form-trigger-radius` | `reset-trigger`<br>`submit-trigger` | `border-radius` | `default` | `--xh-shape-control` |
