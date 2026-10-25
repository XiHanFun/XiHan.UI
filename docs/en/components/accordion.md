# Accordion

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/accordion).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/accordion" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/accordion.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/accordion" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/accordion" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/accordion.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="accordion"`: `root` · `item` · `item-separator` · `header` · **`trigger`** · **`content`** · `indicator`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-accordion>` |
| Vue components | `XhAccordionContent` `XhAccordionHeader` `XhAccordionIndicator` `XhAccordionItem` `XhAccordionItemSeparator` `XhAccordionRoot` `XhAccordionTrigger` |
| Composable | `useAccordion` |
| State machine | `accordionMachine` |
| Skin | `@xihan-ui/styles/accordion.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `AccordionNode[]` |  |
| `value` | `string[]` |  |
| `defaultValue` | `string[]` |  |
| `multiple` | `boolean` |  |
| `collapsible` | `boolean` |  |
| `loop` | `boolean` |  |
| `disabled` | `boolean` |  |
| `variant` | `ControlVariant` |  |
| `orientation` | `Orientation` |  |
| `dir` | `Direction` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `lazyMount` | `boolean` |  |
| `unmountOnExit` | `boolean` |  |
| `contentRole` | `'region' \| 'group'` |  |
| `onValueChange` | `(details: AccordionValueChangeDetails) => void` |  |

### AccordionNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `string` | Yes |
| `label` | `string` |  |
| `content` | `string` |  |
| `disabled` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `AccordionValueChangeDetails` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhAccordionItem` | `value` | `string` | Yes |
| `XhAccordionItem` | `disabled` | `boolean` |  |
| `XhAccordionRoot` | `renderContent` | `(node: AccordionNodeMeta) => ReactNode` |  |
| `XhAccordionRoot` | `children` | `ReactNode` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `item` | 'open' \| 'closed' |
| `header` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `ITEM.TOGGLE` · `VALUE.SET` · `PRESS.START` · `PRESS.END`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `string[]` |
| `collection` | `readonly AccordionNodeMeta[]` |
| `setValue` | `(next: string[]) => void` |
| `isOpen` | `(value: string) => boolean` |
| `getRootProps` | `() => T['element']` |
| `getItemProps` | `(props: AccordionItemProps) => T['element']` |
| `getItemSeparatorProps` | `() => T['element']` |
| `getHeaderProps` | `(props: AccordionItemProps) => T['element']` |
| `getTriggerProps` | `(props: AccordionItemProps) => T['button']` |
| `getContentProps` | `(props: AccordionItemProps) => T['element']` |
| `getIndicatorProps` | `(props: AccordionItemProps) => T['element']` |
| `isContentMounted` | `(props: AccordionItemProps, present: boolean) => boolean` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Space` / `Enter` | `accordion.kbd.toggle` |
| `ArrowDown` / `ArrowRight` | `accordion.kbd.next` |
| `ArrowUp` / `ArrowLeft` | `accordion.kbd.prev` |
| `Home` | `accordion.kbd.first` |
| `End` | `accordion.kbd.last` |
| `Tab` / `Shift+Tab` | `accordion.kbd.tab` |
| `Enter` / `Space` | `accordion.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `item-separator` | `aria-hidden` | 'true' |
| `header` | `aria-level` | 3 |
| `header` | `role` | 'heading' |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `content` | `aria-labelledby` | id of the `trigger` part |
| `content` | `role` | props.contentRole |
| `indicator` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/accordion.css` is written against `[data-scope="accordion"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-accordion` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-state` | 'open' \| 'closed' |
| `header` | `data-disabled` | '' (present only while the condition holds) |
| `header` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'disclosure-trigger' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `content` | `data-instant` | '' |
| `content` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-disabled` | '' (present only while the condition holds) |
| `indicator` | `data-instant` | '' |
| `indicator` | `data-state` | 'open' \| 'closed' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-accordion-border` | `root` | `border` | `variant=outline` | `--xh-border-default` |
| `--xh-accordion-content-bg` | `content`<br>`root` | `background` | `default`<br>`variant=subtle` | `--xh-bg-muted`<br>`transparent` |
| `--xh-accordion-content-border` | `content` | `border-block-start` | `state=open` | `--xh-accordion-item-border` |
| `--xh-accordion-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-accordion-content-font-size` | `content` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-accordion-content-pb` | `content` | `padding-block-end` | `@keyframes xh-disclosure-collapse`<br>`@keyframes xh-disclosure-expand`<br>`default` | `--xh-_accordion-content-pb` |
| `--xh-accordion-content-pt` | `content` | `padding-block-start` | `@keyframes xh-disclosure-collapse`<br>`@keyframes xh-disclosure-expand`<br>`default` | `--xh-_accordion-content-pt` |
| `--xh-accordion-content-px` | `content` | `padding-inline` | `default` | `--xh-_accordion-content-px` |
| `--xh-accordion-icon-size` | `root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-accordion-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-accordion-item-bg` | `root` | `background` | `variant=outline`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-accordion-item-border` | `content`<br>`item`<br>`item-separator`<br>`root` | `background`<br>`border-block-start`<br>`border-inline-start` | `default`<br>`is([data-variant='outline'], [data-variant='subtle'])`<br>`not(:last-child)`<br>`orientation=horizontal`<br>`state=open`<br>`variant=outline`<br>`variant=subtle` | `--xh-border-default` |
| `--xh-accordion-item-radius` | `root` | `border-radius` | `variant=outline`<br>`variant=subtle` | `--xh-shape-surface` |
| `--xh-accordion-item-shadow` | `root` | `box-shadow` | `variant=outline`<br>`variant=subtle` | `none` |
| `--xh-accordion-trigger-bg` | `trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-accordion-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-accordion-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-accordion-trigger-fg-disabled` | `trigger` | `color` | `disabled` | `--xh-_action-variant-fg-disabled` |
| `--xh-accordion-trigger-fg-open` | `trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=open` | `--xh-_accordion-open-fg` |
| `--xh-accordion-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` |
| `--xh-accordion-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-accordion-trigger-font-weight-open` | `trigger` | `font-weight` | `state=open` | `--xh-font-weight-medium` |
| `--xh-accordion-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-accordion-trigger-h` | `trigger` | `block-size`<br>`min-block-size` | `default`<br>`xh-action-profile=disclosure-trigger` | `--xh-_action-profile-visual-size` |
| `--xh-accordion-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_accordion-trigger-px` |
| `--xh-accordion-trigger-py` | `trigger` | `padding-block` | `xh-action-profile=disclosure-trigger` | `--xh-_accordion-trigger-py` |
| `--xh-accordion-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` |
