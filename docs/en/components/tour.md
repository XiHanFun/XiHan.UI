# Tour

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/tour).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tour" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tour.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tour" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tour" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tour.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="tour"`: **`root`** · `backdrop` · `spotlight` · `positioner` · **`content`** · `title` · `description` · `progress-text` · `progress-indicator` · `progress-dot` · `prev-trigger` · `next-trigger` · `skip-trigger` · `close-trigger` · `arrow`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-tour>` |
| Vue components | `XhTourArrow` `XhTourBackdrop` `XhTourCloseTrigger` `XhTourContent` `XhTourDescription` `XhTourNextTrigger` `XhTourPositioner` `XhTourPrevTrigger` `XhTourProgressDot` `XhTourProgressIndicator` `XhTourProgressText` `XhTourRoot` `XhTourSkipTrigger` `XhTourSpotlight` `XhTourTitle` |
| Composable | `useTour` |
| State machine | `tourMachine` |
| Skin | `@xihan-ui/styles/tour.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `steps` | `TourStep[]` |  |
| `value` | `number` |  |
| `defaultValue` | `number` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `placement` | `Placement` |  |
| `dir` | `Direction` |  |
| `offset` | `number` |  |
| `closeOnEscape` | `boolean` |  |
| `closeOnInteractOutside` | `boolean` |  |
| `showBackdrop` | `boolean` |  |
| `spotlightPadding` | `number` |  |
| `boundary` | `TourTarget \| null` |  |
| `autoScroll` | `boolean` |  |
| `targetTimeout` | `number` |  |
| `parts` | `TitleDescriptionParts` |  |
| `translations` | `Partial<TourTranslations>` |  |
| `onValueChange` | `(details: TourValueChangeDetails) => void` |  |
| `onOpenChange` | `(details: TourOpenChangeDetails) => void` |  |
| `onComplete` | `(details: TourCompleteDetails) => void` |  |
| `onSkip` | `(details: TourSkipDetails) => void` |  |

### TourStep

Elements of `steps`.

| Field | Type | Required |
| --- | --- | --- |
| `id` | `string` | Yes |
| `target` | `TourTarget \| null` |  |
| `title` | `string` |  |
| `description` | `string` |  |
| `placement` | `Placement` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `TourOpenChangeDetails` |
| `value-change` | `TourValueChangeDetails` |
| `complete` | `TourCompleteDetails` |
| `skip` | `TourSkipDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTourRoot` | `default` | `TourRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTourProgressDot` | `index` | `number \| string` | Yes |
| `XhTourRoot` | `container` | `() => Element \| null` |  |
| `XhTourRoot` | `children` | `SlotChildren<TourRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `spotlight` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `prev-trigger` | 'open' \| 'closed' |
| `next-trigger` | 'open' \| 'closed' |
| `skip-trigger` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `CLOSE` · `VALUE.SET` · `STEP.PREV` · `STEP.NEXT` · `SKIP` · `GEOMETRY.SYNC` · `TARGET.FOUND` · `TARGET.MISSING` · `STEP.SETTLED` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

**Guards**: `isOpenControlled` · `isLastStep` · `isLastStepOpenControlled` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `value` | `number` |
| `count` | `number` |
| `currentStep` | `TourStep \| null` |
| `firstStep` | `boolean` |
| `lastStep` | `boolean` |
| `anchored` | `boolean` |
| `progressText` | `string` |
| `setOpen` | `(next: boolean) => void` |
| `setValue` | `(next: number) => void` |
| `goToNextStep` | `() => void` |
| `goToPrevStep` | `() => void` |
| `skip` | `() => void` |
| `remeasure` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getBackdropProps` | `() => T['element']` |
| `getSpotlightProps` | `() => T['element']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getProgressTextProps` | `() => T['element']` |
| `getProgressIndicatorProps` | `() => T['element']` |
| `getProgressDotProps` | `(props: TourProgressDotProps) => T['element']` |
| `getPrevTriggerProps` | `() => T['button']` |
| `getNextTriggerProps` | `() => T['button']` |
| `getSkipTriggerProps` | `() => T['button']` |
| `getCloseTriggerProps` | `() => T['button']` |
| `getArrowProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `tour.kbd.next` |
| `Escape` | `tour.kbd.escape` |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | `tour.kbd.arrows` |
| `Tab` / `Shift+Tab` | `tour.kbd.trap` |
| `Enter` / `Space` | `tour.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `backdrop` | `aria-hidden` | 'true' |
| `spotlight` | `aria-hidden` | 'true' |
| `content` | `aria-describedby` | id of the `description` part \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | id of the `title` part \| undefined |
| `content` | `aria-modal` | 'true' \| undefined |
| `content` | `role` | 'dialog' |
| `progress-text` | `aria-live` | 'polite' |
| `progress-indicator` | `aria-hidden` | 'true' |
| `next-trigger` | `aria-label` | translations.finish \| translations.next |
| `close-trigger` | `aria-label` | translations.close |
| `arrow` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/tour.css` is written against `[data-scope="tour"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-tour` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-step` | String(value) |
| `backdrop` | `data-instant` | '' (present only while the condition holds) |
| `backdrop` | `data-position` | 'anchored' \| 'center' |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `spotlight` | `data-animating` | '' (present only while the condition holds) |
| `spotlight` | `data-dimmed` | '' (present only while the condition holds) |
| `spotlight` | `data-instant` | '' (present only while the condition holds) |
| `spotlight` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-animating` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-position` | 'anchored' \| 'center' |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-placement` | actual placement computed by the positioning engine |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-step` | String(value) |
| `progress-text` | `data-step` | String(value) |
| `progress-indicator` | `data-count` | String(count) |
| `progress-indicator` | `data-step` | String(value) |
| `progress-dot` | `data-complete` | '' (present only while the condition holds) |
| `progress-dot` | `data-current` | '' (present only while the condition holds) |
| `progress-dot` | `data-index` | String(index) |
| `prev-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `prev-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `prev-trigger` | `data-state` | 'open' \| 'closed' |
| `prev-trigger` | `data-xh-action-control` | '' |
| `prev-trigger` | `data-xh-action-display` | 'always' |
| `prev-trigger` | `data-xh-action-profile` | 'text' |
| `prev-trigger` | `data-xh-action-size` | 'sm' |
| `prev-trigger` | `data-xh-action-variant` | 'outline' |
| `next-trigger` | `data-last` | '' (present only while the condition holds) |
| `next-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `next-trigger` | `data-state` | 'open' \| 'closed' |
| `next-trigger` | `data-xh-action-control` | '' |
| `next-trigger` | `data-xh-action-display` | 'always' |
| `next-trigger` | `data-xh-action-profile` | 'text' |
| `next-trigger` | `data-xh-action-size` | 'sm' |
| `next-trigger` | `data-xh-action-variant` | 'solid' |
| `next-trigger` | `data-xh-ink-surface` | '' |
| `skip-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `skip-trigger` | `data-state` | 'open' \| 'closed' |
| `skip-trigger` | `data-xh-action-control` | '' |
| `skip-trigger` | `data-xh-action-display` | 'always' |
| `skip-trigger` | `data-xh-action-profile` | 'text' |
| `skip-trigger` | `data-xh-action-size` | 'sm' |
| `skip-trigger` | `data-xh-action-variant` | 'ghost' |
| `close-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |
| `arrow` | `data-placement` | actual placement computed by the positioning engine |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-tour-action-radius` | `next-trigger`<br>`prev-trigger`<br>`skip-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-tour-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` |
| `--xh-tour-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` |
| `--xh-tour-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` |
| `--xh-tour-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-elevated-bg` |
| `--xh-tour-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-elevated-border` |
| `--xh-tour-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-tour-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-tour-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tour-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed` |
| `--xh-tour-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-tour-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='tour'][data-part='close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` |
| `--xh-tour-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-tour-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-tour-fg` | `content`<br>`root` | `color` | `default` | `--xh-fg-default`<br>`--xh-material-elevated-fg` |
| `--xh-tour-gap` | `content`<br>`description`<br>`title` | `gap`<br>`margin-block-start` | `default` | `--xh-space-2` |
| `--xh-tour-icon-size` | `close-trigger`<br>`content`<br>`next-trigger`<br>`prev-trigger`<br>`root`<br>`skip-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` |
| `--xh-tour-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` |
| `--xh-tour-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w-lg` |
| `--xh-tour-next-bg` | `next-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` |
| `--xh-tour-next-bg-hover` | `next-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-tour-next-fg` | `next-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-tour-next-shadow` | `next-trigger` | `box-shadow` | `default` | `none` |
| `--xh-tour-positioner-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-tour-positioner-padding` | `positioner` | `padding` | `position=center` | `--xh-space-4` |
| `--xh-tour-progress-dot-bg` | `progress-dot` | `background` | `default` | `--xh-border-default` |
| `--xh-tour-progress-dot-bg-complete` | `progress-dot` | `background` | `complete` | `--xh-border-strong` |
| `--xh-tour-progress-dot-bg-current` | `progress-dot` | `background` | `current` | `--xh-bg-brand` |
| `--xh-tour-progress-fg` | `progress-text` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-tour-progress-font-size` | `progress-text` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-tour-progress-indicator-gap` | `progress-indicator` | `gap` | `default` | `--xh-space-2` |
| `--xh-tour-px` | `content` | `padding-inline` | `default` | `--xh-surface-px-md` |
| `--xh-tour-py` | `content` | `padding-block` | `default` | `--xh-surface-py-sm` |
| `--xh-tour-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-tour-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` |
| `--xh-tour-skip-trigger-px` | `next-trigger`<br>`prev-trigger`<br>`skip-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-tour-spotlight-layer` | `spotlight` | `z-index` | `default` | `--xh-_layer` |
| `--xh-tour-spotlight-radius` | `spotlight` | `border-radius` | `default` | `--xh-_tour-spotlight-radius` |
| `--xh-tour-spotlight-ring` | `spotlight` | `box-shadow` | `default` | `--xh-_tour-spotlight-ring` |
| `--xh-tour-spotlight-shroud` | `spotlight` | `box-shadow` | `dimmed` | `--xh-bg-overlay` |
| `--xh-tour-title-fg` | `title` | `color` | `default` | `--xh-fg-default` |
| `--xh-tour-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` |
| `--xh-tour-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` |
