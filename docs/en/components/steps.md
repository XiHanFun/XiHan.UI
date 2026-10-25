# Steps

Navigation component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/steps).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/steps" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/steps.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/steps" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/steps" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/steps.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="steps"`: **`root`** · **`list`** · **`item`** · **`trigger`** · `indicator` · `title` · `description` · `separator` · `content`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-steps>` |
| Vue components | `XhStepsContent` `XhStepsDescription` `XhStepsIndicator` `XhStepsItem` `XhStepsList` `XhStepsRoot` `XhStepsSeparator` `XhStepsTitle` `XhStepsTrigger` |
| Composable | `useSteps` |
| State machine | `stepsMachine` |
| Skin | `@xihan-ui/styles/steps.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `value` | `number` |  |
| `defaultValue` | `number` |  |
| `collection` | `StepNode[]` |  |
| `statuses` | `Record<number, StepStatus>` |  |
| `tones` | `Record<number, Tone>` |  |
| `count` | `number` |  |
| `orientation` | `Orientation` |  |
| `linear` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `translations` | `Partial<StepsTranslations>` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `variant` | `StepsVariant` |  |
| `percent` | `number` |  |
| `onValueChange` | `(details: StepsValueChangeDetails) => void` |  |

### StepNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `title` | `string` |  |
| `description` | `string` |  |
| `status` | `StepStatus` |  |
| `tone` | `Tone` |  |
| `disabled` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `StepsValueChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhStepsRoot` | `default` | `StepsRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhStepsContent` | `value` | `number \| string` | Yes |
| `XhStepsItem` | `value` | `number \| string` | Yes |
| `XhStepsItem` | `disabled` | `boolean` |  |
| `XhStepsRoot` | `children` | `SlotChildren<StepsRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `item` | s.status |
| `trigger` | s.status |
| `indicator` | s.status |
| `title` | getItemState(item).status |
| `description` | getItemState(item).status |
| `separator` | getItemState(item).status |
| `content` | getItemState(item).status |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `STEP.PREV` · `STEP.NEXT` · `TRIGGER.FOCUS` · `LIST.BLUR` · `PRESS.START` · `PRESS.END`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `number` |
| `count` | `number` |
| `collection` | `readonly StepNodeMeta[]` |
| `complete` | `boolean` |
| `focusedStep` | `number \| null` |
| `readOnly` | `boolean` |
| `getItemState` | `(props: StepsItemProps) => StepsItemState` |
| `setValue` | `(next: number) => void` |
| `goToNextStep` | `() => void` |
| `goToPrevStep` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getListProps` | `() => T['element']` |
| `getItemProps` | `(props: StepsItemProps) => T['element']` |
| `getTriggerProps` | `(props: StepsItemProps) => T['button']` |
| `getIndicatorProps` | `(props: StepsItemProps) => T['element']` |
| `getTitleProps` | `(props: StepsItemProps) => T['element']` |
| `getDescriptionProps` | `(props: StepsItemProps) => T['element']` |
| `getSeparatorProps` | `(props: StepsItemProps) => T['element']` |
| `getContentProps` | `(props: StepsItemProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowRight` / `ArrowDown` | `steps.kbd.next` |
| `ArrowLeft` / `ArrowUp` | `steps.kbd.prev` |
| `Home` | `steps.kbd.first` |
| `End` | `steps.kbd.last` |
| `Enter` / `Space` | `steps.kbd.activate` |
| `Enter` / `Space` | `steps.kbd.press` |
| `Tab` / `Shift+Tab` | `steps.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-label` | translations.list |
| `list` | `aria-orientation` | props.orientation |
| `list` | `role` | 'list' |
| `item` | `aria-current` | 'step' \| undefined |
| `item` | `role` | 'listitem' \| undefined |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-current` | 'step' \| undefined |
| `trigger` | `aria-describedby` | id of the `indicator` part \| undefined |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-posinset` | item.index + 1 \| undefined |
| `trigger` | `aria-selected` | 'true' \| 'false' |
| `trigger` | `aria-setsize` | normalizeStepCount(prop('count') ?? (collection.lengt… \| undefined |
| `trigger` | `role` | 'tab' |
| `indicator` | `aria-hidden` | 'true' |
| `indicator` | `aria-label` | translations.progressLabel |
| `indicator` | `aria-valuemax` | '100' |
| `indicator` | `aria-valuemin` | '0' |
| `indicator` | `aria-valuenow` | String(percent) |
| `indicator` | `aria-valuetext` | progressValueText(Math.round(percent)) |
| `indicator` | `role` | 'progressbar' |
| `separator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | undefined \| id of the `trigger` part |
| `content` | `role` | undefined \| 'tabpanel' |

## Style reference

### Skin

`@xihan-ui/styles/steps.css` is written against `[data-scope="steps"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-steps` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-complete` | '' (present only while the condition holds) |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `list` | `data-orientation` | props.orientation |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-orientation` | props.orientation |
| `item` | `data-state` | s.status |
| `item` | `data-tone` | s.tone |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-readonly` | '' |
| `trigger` | `data-state` | s.status |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'row' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `indicator` | `data-instant` | '' (present only while the condition holds) |
| `indicator` | `data-progress` | '' (present only while the condition holds) |
| `indicator` | `data-state` | s.status |
| `indicator` | `data-variant` | props.variant |
| `title` | `data-state` | getItemState(item).status |
| `description` | `data-state` | getItemState(item).status |
| `separator` | `data-orientation` | props.orientation |
| `separator` | `data-state` | getItemState(item).status |
| `content` | `data-state` | getItemState(item).status |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-steps-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-steps-content-min-inline-size` | `content`<br>`root` | `flex` | `orientation=vertical` | `--xh-measure-prose` |
| `--xh-steps-content-py` | `content` | `padding-block` | `default` | `--xh-stack-gap-md` |
| `--xh-steps-description-fg` | `description` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-steps-description-font-size` | `description` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-steps-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` |
| `--xh-steps-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-steps-indicator-bg` | `indicator` | `background` | `default`<br>`variant=dot` | `--xh-bg-subtle`<br>`transparent` |
| `--xh-steps-indicator-bg-completed` | `indicator`<br>`trigger` | `background`<br>`border-color` | `not([data-state='incomplete'])`<br>`state=completed`<br>`state=incomplete`<br>`variant=dot` | `--xh-_steps-accent-mark`<br>`--xh-_steps-accent-subtle` |
| `--xh-steps-indicator-bg-completed-hover` | `indicator`<br>`trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`not([data-variant='dot'])`<br>`readonly`<br>`state=completed`<br>`variant=dot` | `--xh-_steps-accent-subtle-hover` |
| `--xh-steps-indicator-bg-completed-pressed` | `indicator`<br>`trigger` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled], [data-readonly])`<br>`not([data-variant='dot'])`<br>`pressed`<br>`readonly`<br>`state=completed`<br>`variant=dot` | `--xh-_steps-accent-subtle-active` |
| `--xh-steps-indicator-bg-current` | `indicator`<br>`trigger` | `background`<br>`border-color` | `not([data-state='incomplete'])`<br>`state=current`<br>`state=incomplete`<br>`variant=dot` | `--xh-_steps-accent` |
| `--xh-steps-indicator-bg-current-pressed` | `indicator`<br>`item`<br>`trigger` | `background`<br>`border-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled], [data-readonly])`<br>`not([data-state='incomplete'])`<br>`not([data-variant='dot'])`<br>`pressed`<br>`readonly`<br>`state=current`<br>`state=incomplete`<br>`tone`<br>`variant=dot` | `--xh-_tone-active` |
| `--xh-steps-indicator-bg-disabled` | `indicator`<br>`item`<br>`trigger` | `background`<br>`border-color` | `disabled`<br>`not([data-state='incomplete'])`<br>`state=incomplete`<br>`variant=dot` | `--xh-bg-muted`<br>`--xh-fg-disabled` |
| `--xh-steps-indicator-bg-hover` | `indicator`<br>`trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly`<br>`state=incomplete` | `--xh-_steps-host-bg-hover` |
| `--xh-steps-indicator-bg-pressed` | `indicator`<br>`trigger` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled], [data-readonly])`<br>`pressed`<br>`readonly`<br>`state=incomplete` | `--xh-_steps-host-bg-pressed` |
| `--xh-steps-indicator-bg-toned` | `indicator`<br>`item`<br>`trigger` | `background` | `not([data-variant='dot'])`<br>`state=incomplete`<br>`tone`<br>`variant=dot` | `--xh-_steps-accent`<br>`--xh-_tone-subtle` |
| `--xh-steps-indicator-border` | `indicator` | `border`<br>`border-color` | `default`<br>`variant=dot` | `--xh-fg-muted`<br>`transparent` |
| `--xh-steps-indicator-border-completed` | `indicator` | `border-color` | `state=completed` | `transparent` |
| `--xh-steps-indicator-border-current` | `indicator` | `border-color` | `state=current` | `--xh-_steps-accent` |
| `--xh-steps-indicator-border-disabled` | `indicator`<br>`item` | `border-color` | `disabled`<br>`variant=dot` | `--xh-border-default`<br>`--xh-fg-disabled` |
| `--xh-steps-indicator-border-toned` | `indicator`<br>`item`<br>`trigger` | `border-color` | `not([data-variant='dot'])`<br>`state=incomplete`<br>`tone`<br>`variant=dot` | `--xh-_steps-accent` |
| `--xh-steps-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` |
| `--xh-steps-indicator-fg-completed` | `indicator` | `color` | `state=completed` | `--xh-_steps-accent-mark` |
| `--xh-steps-indicator-fg-current` | `indicator` | `color` | `state=current` | `--xh-_steps-on-accent` |
| `--xh-steps-indicator-fg-disabled` | `indicator`<br>`item` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-steps-indicator-fg-hover` | `indicator`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly`<br>`state=incomplete` | `--xh-fg-default` |
| `--xh-steps-indicator-fg-toned` | `indicator`<br>`item`<br>`trigger` | `color` | `not([data-variant='dot'])`<br>`state=incomplete`<br>`tone`<br>`variant=dot` | `--xh-_steps-on-accent` |
| `--xh-steps-indicator-font-size` | `indicator` | `font-size` | `default` | `--xh-_steps-indicator-font-size` |
| `--xh-steps-indicator-mark-size` | `indicator` | `--xh-icon-size` | `default` | `--xh-control-indicator-size` |
| `--xh-steps-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-steps-indicator-ring-bg` | `indicator` | `background` | `default` | `--xh-_steps-accent` |
| `--xh-steps-indicator-ring-bg-disabled` | `indicator`<br>`item` | `background` | `disabled` | `--xh-fg-disabled` |
| `--xh-steps-indicator-ring-track` | `indicator` | `background` | `progress` | `--xh-border-default` |
| `--xh-steps-indicator-shadow` | `indicator` | `box-shadow` | `state=current` | `none` |
| `--xh-steps-indicator-size` | `indicator`<br>`separator` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-_steps-indicator-size` |
| `--xh-steps-item-gap` | `item` | `gap` | `default` | `--xh-space-2` |
| `--xh-steps-item-min-inline-size` | `item` | `min-inline-size` | `not(:last-child)`<br>`orientation=horizontal` | `--xh-space-0` |
| `--xh-steps-list-gap` | `list` | `gap` | `default` | `--xh-space-0` |
| `--xh-steps-separator-bg` | `separator` | `background` | `default` | `--xh-border-default` |
| `--xh-steps-separator-bg-completed` | `separator` | `background` | `default` | `--xh-_steps-accent` |
| `--xh-steps-separator-min-length` | `separator` | `block-size`<br>`min-inline-size` | `default`<br>`orientation=vertical` | `--xh-space-4`<br>`--xh-space-7` |
| `--xh-steps-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-steps-separator-thickness` | `separator` | `block-size`<br>`inline-size`<br>`margin-inline-start`<br>`min-inline-size` | `default`<br>`orientation=vertical` | `--xh-stroke-thin` |
| `--xh-steps-title-fg` | `title` | `color` | `default` | `--xh-fg-muted` |
| `--xh-steps-title-fg-active` | `title` | `color` | `is([data-state='current'], [data-state='completed'])`<br>`state=completed`<br>`state=current` | `--xh-fg-default` |
| `--xh-steps-title-fg-toned` | `item`<br>`title` | `color` | `tone` | `--xh-fg-default` |
| `--xh-steps-title-font-size` | `title` | `font-size` | `default` | `--xh-_steps-title-font-size` |
| `--xh-steps-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-steps-title-font-weight-current` | `title` | `font-weight` | `state=current` | `--xh-text-heading-3-weight` |
| `--xh-steps-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` |
| `--xh-steps-trigger-bg-pressed` | `trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-steps-trigger-gap` | `trigger` | `column-gap` | `default` | `--xh-control-gap-md` |
| `--xh-steps-trigger-p` | `separator`<br>`trigger` | `margin-inline-start`<br>`padding-block`<br>`padding-inline` | `default`<br>`orientation=vertical`<br>`readonly`<br>`xh-action-profile=row` | `--xh-control-px-sm`<br>`--xh-space-1` |
| `--xh-steps-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` |
