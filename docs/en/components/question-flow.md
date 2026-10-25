# QuestionFlow <Badge type="info" text="alpha" />

AI chat component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/question-flow).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/question-flow" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/question-flow.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/question-flow" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/question-flow" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/question-flow.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="question-flow"`: **`root`** · `viewport` · **`track`** · **`question`** · `prompt` · `description` · `group` · `item` · `item-indicator` · `item-text` · `item-description` · `note` · `footer` · `prev-trigger` · `counter` · `next-trigger` · `skip-trigger` · **`submit-trigger`** · `result` · `live-region`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-question-flow>` |
| Vue components | `XhQuestionFlowCounter` `XhQuestionFlowDescription` `XhQuestionFlowFooter` `XhQuestionFlowGroup` `XhQuestionFlowItem` `XhQuestionFlowItemDescription` `XhQuestionFlowItemIndicator` `XhQuestionFlowItemText` `XhQuestionFlowLiveRegion` `XhQuestionFlowNextTrigger` `XhQuestionFlowNote` `XhQuestionFlowPrevTrigger` `XhQuestionFlowPrompt` `XhQuestionFlowQuestion` `XhQuestionFlowResult` `XhQuestionFlowRoot` `XhQuestionFlowSkipTrigger` `XhQuestionFlowSubmitTrigger` `XhQuestionFlowTrack` `XhQuestionFlowViewport` |
| Composable | `useQuestionFlow` |
| State machine | `questionFlowMachine` |
| Skin | `@xihan-ui/styles/question-flow.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `questions` | `readonly QuestionFlowQuestion[]` |  |
| `index` | `number` |  |
| `defaultIndex` | `number` |  |
| `answers` | `QuestionFlowAnswers` |  |
| `defaultAnswers` | `QuestionFlowAnswers` |  |
| `notes` | `QuestionFlowNotes` |  |
| `defaultNotes` | `QuestionFlowNotes` |  |
| `status` | `QuestionFlowStatus` |  |
| `defaultStatus` | `QuestionFlowStatus` |  |
| `autoAdvance` | `boolean` |  |
| `autoAdvanceDelay` | `number` |  |
| `allowSkip` | `boolean` |  |
| `loop` | `boolean` |  |
| `variant` | `ControlVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `translations` | `Partial<QuestionFlowTranslations>` |  |
| `onIndexChange` | `(details: QuestionFlowIndexChangeDetails) => void` |  |
| `onAnswersChange` | `(details: QuestionFlowAnswersChangeDetails) => void` |  |
| `onNotesChange` | `(details: QuestionFlowNotesChangeDetails) => void` |  |
| `onSkip` | `(details: QuestionFlowSkipDetails) => void` |  |
| `onSubmit` | `(details: QuestionFlowSubmitDetails) => void` |  |

### QuestionFlowQuestion

Elements of `questions`.

| Field | Type | Required |
| --- | --- | --- |
| `id` | `string` | Yes |
| `prompt` | `string` |  |
| `type` | `QuestionFlowType` |  |
| `options` | `readonly QuestionFlowOption[]` | Yes |
| `optional` | `boolean` |  |
| `description` | `string` |  |
| `minSelections` | `number` |  |
| `maxSelections` | `number` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `index-change` | `QuestionFlowIndexChangeDetails` |
| `answers-change` | `QuestionFlowAnswersChangeDetails` |
| `notes-change` | `QuestionFlowNotesChangeDetails` |
| `skip` | `QuestionFlowSkipDetails` |
| `submit` | `QuestionFlowSubmitDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhQuestionFlowItem` | `default` | `QuestionFlowOptionSlotProps` |
| `XhQuestionFlowRoot` | `default` | `QuestionFlowRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhQuestionFlowDescription` | `questionId` | `string` | Yes |
| `XhQuestionFlowGroup` | `questionId` | `string` | Yes |
| `XhQuestionFlowItem` | `questionId` | `string` | Yes |
| `XhQuestionFlowItem` | `optionValue` | `string` | Yes |
| `XhQuestionFlowItem` | `optionDisabled` | `boolean` |  |
| `XhQuestionFlowItem` | `children` | `SlotChildren<QuestionFlowOptionSlotProps>` |  |
| `XhQuestionFlowItemDescription` | `questionId` | `string` | Yes |
| `XhQuestionFlowItemDescription` | `optionValue` | `string` | Yes |
| `XhQuestionFlowItemIndicator` | `questionId` | `string` | Yes |
| `XhQuestionFlowItemIndicator` | `optionValue` | `string` | Yes |
| `XhQuestionFlowItemText` | `questionId` | `string` | Yes |
| `XhQuestionFlowItemText` | `optionValue` | `string` | Yes |
| `XhQuestionFlowNote` | `questionId` | `string` | Yes |
| `XhQuestionFlowPrompt` | `questionId` | `string` | Yes |
| `XhQuestionFlowQuestion` | `questionId` | `string` | Yes |
| `XhQuestionFlowRoot` | `children` | `SlotChildren<QuestionFlowRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'answering' \| 'submitted' |
| `item` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `result` | 'answering' \| 'submitted' |

The following names are internal to the state machine.

**States**: `answering` · `submitted`

**Events**: `OPTION.TOGGLE` · `NOTE.SET` · `GOTO` · `NEXT` · `PREV` · `SKIP` · `SUBMIT` · `VIEWPORT.MEASURE` · `after.autoAdvance` · `CONTROLLED.ANSWERING` · `CONTROLLED.SUBMITTED` · `PRESS.START` · `PRESS.END`

**Guards**: `isStatusControlled` · `canToggle` · `canSkip` · `isFirstQuestion` · `isLastQuestion` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `status` | `QuestionFlowStatus` |
| `submitted` | `boolean` |
| `index` | `number` |
| `count` | `number` |
| `current` | `QuestionFlowQuestion \| undefined` |
| `isFirst` | `boolean` |
| `isLast` | `boolean` |
| `canAdvance` | `boolean` |
| `allowSkip` | `boolean` |
| `counter` | `string` |
| `announcement` | `string` |
| `answers` | `QuestionFlowAnswers` |
| `notes` | `QuestionFlowNotes` |
| `answersOf` | `(questionId: string) => readonly string[]` |
| `noteOf` | `(questionId: string) => string` |
| `isOptionSelected` | `(questionId: string, value: string) => boolean` |
| `isCurrent` | `(questionId: string) => boolean` |
| `selectionLimitsOf` | `(questionId: string) => QuestionFlowSelectionLimits` |
| `descriptionOf` | `(questionId: string) => string` |
| `goTo` | `(index: number) => void` |
| `next` | `() => void` |
| `prev` | `() => void` |
| `skip` | `() => void` |
| `submit` | `() => void` |
| `toggleOption` | `(questionId: string, value: string) => void` |
| `setNote` | `(questionId: string, value: string) => void` |
| `measure` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getTrackProps` | `() => T['element']` |
| `getQuestionProps` | `(props: QuestionFlowQuestionProps) => T['element']` |
| `getPromptProps` | `(props: QuestionFlowQuestionProps) => T['element']` |
| `getDescriptionProps` | `(props: QuestionFlowQuestionProps) => T['element']` |
| `getGroupProps` | `(props: QuestionFlowQuestionProps) => T['element']` |
| `getItemProps` | `(props: QuestionFlowItemProps) => T['button']` |
| `getItemIndicatorProps` | `(props: QuestionFlowItemProps) => T['element']` |
| `getItemTextProps` | `(props: QuestionFlowItemProps) => T['element']` |
| `getItemDescriptionProps` | `(props: QuestionFlowItemProps) => T['element']` |
| `getNoteProps` | `(props: QuestionFlowQuestionProps) => T['input']` |
| `getFooterProps` | `() => T['element']` |
| `getPrevTriggerProps` | `() => T['button']` |
| `getCounterProps` | `() => T['element']` |
| `getNextTriggerProps` | `() => T['button']` |
| `getSkipTriggerProps` | `() => T['button']` |
| `getSubmitTriggerProps` | `() => T['button']` |
| `getResultProps` | `() => T['element']` |
| `getLiveRegionProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowDown` / `ArrowRight` | `question-flow.kbd.next-option` |
| `ArrowUp` / `ArrowLeft` | `question-flow.kbd.prev-option` |
| `Home` | `question-flow.kbd.first-option` |
| `End` | `question-flow.kbd.last-option` |
| `Space` | `question-flow.kbd.toggle` |
| `Enter` | `question-flow.kbd.advance` |
| `Space` | `question-flow.kbd.item-press` |
| `Enter` / `Space` | `question-flow.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `question` | `aria-hidden` | undefined \| 'true' |
| `question` | `aria-label` | undefined \| translations.prompt |
| `question` | `aria-labelledby` | id of the `prompt` part \| undefined |
| `question` | `role` | 'group' |
| `group` | `aria-describedby` | undefined \| id of the `description` part |
| `group` | `aria-label` | undefined \| translations.options |
| `group` | `aria-labelledby` | id of the `prompt` part \| undefined |
| `group` | `role` | 'radiogroup' \| 'group' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'radio' \| 'checkbox' |
| `item-indicator` | `aria-hidden` | 'true' |
| `note` | `aria-label` | translations.note |
| `prev-trigger` | `aria-label` | translations.prev |
| `counter` | `aria-hidden` | 'true' |
| `next-trigger` | `aria-label` | translations.next |
| `skip-trigger` | `aria-label` | translations.skip |
| `submit-trigger` | `aria-label` | translations.send \| translations.continue |
| `result` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |

## Style reference

### Skin

`@xihan-ui/styles/question-flow.css` is written against `[data-scope="question-flow"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-question-flow` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'answering' \| 'submitted' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `question` | `data-current` | '' (present only while the condition holds) |
| `group` | `data-at-max` | '' (present only while the condition holds) |
| `group` | `data-select-mode` | 'single' \| 'multiple' |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-select-mode` | 'single' \| 'multiple' |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'row' |
| `item` | `data-xh-action-size` | props.size |
| `item` | `data-xh-action-variant` | 'ghost' |
| `item-indicator` | `data-select-mode` | 'single' \| 'multiple' |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `item-indicator` | `data-xh-check-mark` | undefined \| 'checked' \| 'unchecked' |
| `item-indicator` | `data-xh-check-mark-profile` | undefined \| 'box' |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-value` | item.value |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-value` | item.value |
| `prev-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `prev-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `prev-trigger` | `data-xh-action-control` | '' |
| `prev-trigger` | `data-xh-action-display` | 'always' |
| `prev-trigger` | `data-xh-action-profile` | 'icon' |
| `prev-trigger` | `data-xh-action-size` | 'xs' |
| `prev-trigger` | `data-xh-action-variant` | 'ghost' |
| `next-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `next-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `next-trigger` | `data-xh-action-control` | '' |
| `next-trigger` | `data-xh-action-display` | 'always' |
| `next-trigger` | `data-xh-action-profile` | 'icon' |
| `next-trigger` | `data-xh-action-size` | 'xs' |
| `next-trigger` | `data-xh-action-variant` | 'ghost' |
| `skip-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `skip-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `skip-trigger` | `data-xh-action-control` | '' |
| `skip-trigger` | `data-xh-action-display` | 'always' |
| `skip-trigger` | `data-xh-action-profile` | 'text' |
| `skip-trigger` | `data-xh-action-size` | props.size |
| `skip-trigger` | `data-xh-action-variant` | 'ghost' |
| `submit-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `submit-trigger` | `data-mode` | 'send' \| 'continue' |
| `submit-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `submit-trigger` | `data-tone` | props.tone |
| `submit-trigger` | `data-xh-action-control` | '' |
| `submit-trigger` | `data-xh-action-display` | 'always' |
| `submit-trigger` | `data-xh-action-profile` | 'text' |
| `submit-trigger` | `data-xh-action-size` | props.size |
| `submit-trigger` | `data-xh-action-variant` | 'solid' |
| `submit-trigger` | `data-xh-ink-surface` | '' |
| `result` | `data-state` | 'answering' \| 'submitted' |
| `result` | `data-tone` | 'success' \| undefined |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-question-flow-action-font-size` | `skip-trigger`<br>`submit-trigger` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-question-flow-action-font-weight` | `skip-trigger`<br>`submit-trigger` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-question-flow-action-gap` | `skip-trigger`<br>`submit-trigger` | `gap` | `default` | `--xh-space-1` |
| `--xh-question-flow-action-h` | `skip-trigger`<br>`submit-trigger` | `block-size`<br>`inline-size`<br>`min-block-size` | `default`<br>`xh-action-profile=icon`<br>`xh-action-profile=row` | `--xh-_question-flow-h` |
| `--xh-question-flow-action-px` | `skip-trigger`<br>`submit-trigger` | `padding-inline` | `default` | `--xh-_question-flow-px` |
| `--xh-question-flow-action-radius` | `skip-trigger`<br>`submit-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-question-flow-bg` | `root` | `background` | `default`<br>`variant=subtle` | `--xh-_tone-subtle`<br>`--xh-bg-surface` |
| `--xh-question-flow-border` | `root` | `border` | `default` | `--xh-border-default` |
| `--xh-question-flow-counter-fg` | `counter` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-question-flow-counter-font-size` | `counter` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-question-flow-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-question-flow-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-question-flow-dot-radius` | `item-indicator` | `border-radius` | `empty`<br>`select-mode=single` | `--xh-shape-circle` |
| `--xh-question-flow-dot-size` | `item-indicator` | `block-size`<br>`inline-size` | `empty`<br>`select-mode=single` | `--xh-question-flow-indicator-size` |
| `--xh-question-flow-footer-gap` | `footer` | `gap` | `default` | `--xh-space-3` |
| `--xh-question-flow-gap` | `root` | `gap` | `default` | `--xh-_question-flow-gap` |
| `--xh-question-flow-group-gap` | `group` | `gap` | `default` | `--xh-space-1` |
| `--xh-question-flow-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=md`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-question-flow-indicator-bg` | `item-indicator` | `background` | `default` | `transparent` |
| `--xh-question-flow-indicator-bg-checked` | `item-indicator` | `background` | `state=checked` | `--xh-_tone` |
| `--xh-question-flow-indicator-border` | `item-indicator` | `border` | `default` | `--xh-border-strong` |
| `--xh-question-flow-indicator-border-checked` | `item-indicator` | `border-color` | `state=checked` | `--xh-_tone` |
| `--xh-question-flow-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone-on` |
| `--xh-question-flow-indicator-icon-size` | `item-indicator` | `--xh-icon-size` | `default` | `--xh-_question-flow-indicator-glyph` |
| `--xh-question-flow-indicator-radius` | `item-indicator` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-question-flow-indicator-radius-single` | `item-indicator` | `border-radius` | `select-mode=single` | `--xh-shape-circle` |
| `--xh-question-flow-indicator-size` | `item-description`<br>`item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size`<br>`padding-inline-start` | `default`<br>`empty`<br>`select-mode=single` | `--xh-_question-flow-indicator` |
| `--xh-question-flow-item-bg` | `item` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-question-flow-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-question-flow-item-description-fg` | `item-description` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-question-flow-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-question-flow-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-muted` |
| `--xh-question-flow-item-fg-checked` | `item` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=checked` | `--xh-fg-default` |
| `--xh-question-flow-item-font-size` | `item` | `font-size` | `default` | `--xh-_question-flow-font-size` |
| `--xh-question-flow-item-gap` | `item`<br>`item-description` | `gap`<br>`padding-inline-start` | `default` | `--xh-space-1_5` |
| `--xh-question-flow-item-px` | `item` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-question-flow-item-py` | `item` | `padding-block` | `xh-action-profile=row` | `--xh-space-1` |
| `--xh-question-flow-item-radius` | `item` | `border-radius` | `default` | `--xh-_action-profile-radius` |
| `--xh-question-flow-note-bg` | `note` | `background` | `default` | `--xh-bg-field` |
| `--xh-question-flow-note-bg-disabled` | `note` | `background` | `disabled` | `--xh-bg-subtle` |
| `--xh-question-flow-note-bg-focus` | `note` | `background` | `focus-within` | `--xh-bg-surface` |
| `--xh-question-flow-note-border` | `note` | `border` | `default` | `--xh-border-control` |
| `--xh-question-flow-note-border-disabled` | `note` | `border-color` | `disabled` | `--xh-border-default` |
| `--xh-question-flow-note-border-focus` | `note` | `border-color` | `focus-within` | `--xh-border-control-focus` |
| `--xh-question-flow-note-border-hover` | `note` | `border-color` | `hover`<br>`invalid`<br>`not(:disabled, :focus, [data-invalid])` | `--xh-border-strong` |
| `--xh-question-flow-note-fg` | `note` | `color` | `default` | `--xh-fg-default` |
| `--xh-question-flow-note-font-size` | `note` | `font-size` | `default` | `--xh-_question-flow-font-size` |
| `--xh-question-flow-note-px` | `note` | `padding-inline` | `default` | `--xh-space-2` |
| `--xh-question-flow-note-py` | `note` | `padding-block` | `default` | `--xh-space-1_5` |
| `--xh-question-flow-note-radius` | `note` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-question-flow-padding` | `root` | `padding` | `default` | `--xh-_question-flow-p` |
| `--xh-question-flow-placeholder-fg` | `note` | `color` | `placeholder` | `--xh-fg-subtle` |
| `--xh-question-flow-prompt-fg` | `prompt` | `color` | `default` | `--xh-fg-default` |
| `--xh-question-flow-prompt-font-size` | `prompt` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-question-flow-prompt-font-weight` | `prompt` | `font-weight` | `default` | `--xh-font-weight-semibold` |
| `--xh-question-flow-question-gap` | `question` | `gap` | `default` | `--xh-space-2` |
| `--xh-question-flow-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-question-flow-result-bg` | `result` | `background` | `default` | `--xh-_tone-subtle` |
| `--xh-question-flow-result-fg` | `result` | `color` | `default` | `--xh-_tone-fg` |
| `--xh-question-flow-result-font-size` | `result` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-question-flow-result-font-weight` | `result` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-question-flow-result-gap` | `result` | `gap` | `default` | `--xh-space-1` |
| `--xh-question-flow-result-h` | `result` | `min-block-size` | `default` | `--xh-chip-h-sm` |
| `--xh-question-flow-result-px` | `result` | `padding-inline` | `default` | `--xh-space-1_5` |
| `--xh-question-flow-result-py` | `result` | `padding-block` | `default` | `0` |
| `--xh-question-flow-result-radius` | `result` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-question-flow-shadow` | `root` | `box-shadow` | `default` | `none` |
| `--xh-question-flow-skip-bg` | `skip-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-question-flow-skip-bg-hover` | `skip-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-question-flow-skip-fg` | `skip-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-question-flow-skip-fg-hover` | `skip-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-question-flow-step-bg` | `next-trigger`<br>`prev-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-question-flow-step-bg-hover` | `next-trigger`<br>`prev-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-question-flow-step-fg` | `next-trigger`<br>`prev-trigger` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-question-flow-step-fg-hover` | `next-trigger`<br>`prev-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-question-flow-step-padding` | `next-trigger`<br>`prev-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-question-flow-step-radius` | `next-trigger`<br>`prev-trigger` | `border-radius` | `default` | `--xh-shape-inset` |
| `--xh-question-flow-step-size` | `next-trigger`<br>`prev-trigger` | `block-size`<br>`inline-size`<br>`min-block-size` | `default`<br>`xh-action-profile=icon`<br>`xh-action-profile=row` | `--xh-_action-profile-visual-size` |
| `--xh-question-flow-submit-bg` | `submit-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-question-flow-submit-bg-active` | `submit-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-question-flow-submit-bg-hover` | `submit-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-question-flow-submit-bg-off` | `submit-trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled` |
| `--xh-question-flow-submit-fg` | `submit-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-question-flow-submit-shadow` | `submit-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_highlight-tone` |
| `--xh-question-flow-track-gap` | `track` | `gap` | `default` | `--xh-_question-flow-gap` |
| `--xh-question-flow-track-y` | `track` | `translate` | `default` | `--xh-_question-flow-track-y` |
| `--xh-question-flow-viewport-h` | `viewport` | `block-size` | `default` | `--xh-_question-flow-viewport-h` |
