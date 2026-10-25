# Collapsible

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/collapsible).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/collapsible" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/collapsible.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/collapsible" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/collapsible" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/collapsible.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="collapsible"`: `root` · `header` · `trigger` · **`content`** · `indicator`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-collapsible>` |
| Vue components | `XhCollapsibleContent` `XhCollapsibleHeader` `XhCollapsibleIndicator` `XhCollapsibleRoot` `XhCollapsibleTrigger` |
| Composable | `useCollapsible` |
| State machine | `collapsibleMachine` |
| Skin | `@xihan-ui/styles/collapsible.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `disabled` | `boolean` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `dir` | `Direction` |  |
| `lazyMount` | `boolean` |  |
| `unmountOnExit` | `boolean` |  |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `CollapsibleOpenChangeDetails` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhCollapsibleRoot` | `children` | `ReactNode` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `header` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `CLOSE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

**Guards**: `isOpenControlled` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `getRootProps` | `() => T['element']` |
| `getHeaderProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getContentProps` | `() => T['element']` |
| `getIndicatorProps` | `() => T['element']` |
| `isContentMounted` | `(present: boolean) => boolean` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Space` / `Enter` | `collapsible.kbd.toggle` |
| `Enter` / `Space` | `collapsible.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `indicator` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/collapsible.css` is written against `[data-scope="collapsible"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-collapsible` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
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
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-disabled` | '' (present only while the condition holds) |
| `indicator` | `data-instant` | '' (present only while the condition holds) |
| `indicator` | `data-state` | 'open' \| 'closed' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-collapsible-content-fg` | `content` | `color` | `default` | `--xh-fg-default` |
| `--xh-collapsible-content-font-size` | `content` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-collapsible-content-pb` | `content` | `padding-block-end` | `@keyframes xh-disclosure-collapse`<br>`@keyframes xh-disclosure-expand`<br>`default` | `--xh-_collapsible-content-pb` |
| `--xh-collapsible-content-pt` | `content` | `padding-block-start` | `@keyframes xh-disclosure-collapse`<br>`@keyframes xh-disclosure-expand`<br>`default` | `--xh-_collapsible-content-pt` |
| `--xh-collapsible-content-px` | `content` | `padding-inline` | `default` | `--xh-_collapsible-content-px` |
| `--xh-collapsible-header-gap` | `header` | `gap` | `default` | `--xh-_collapsible-trigger-gap` |
| `--xh-collapsible-icon-size` | `root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-collapsible-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-collapsible-trigger-bg` | `trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` |
| `--xh-collapsible-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-collapsible-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-collapsible-trigger-fg-disabled` | `trigger` | `color` | `disabled` | `--xh-_action-variant-fg-disabled` |
| `--xh-collapsible-trigger-fg-open` | `trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=open` | `--xh-_collapsible-open-fg` |
| `--xh-collapsible-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` |
| `--xh-collapsible-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-collapsible-trigger-font-weight-open` | `trigger` | `font-weight` | `state=open` | `--xh-font-weight-medium` |
| `--xh-collapsible-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_action-profile-gap` |
| `--xh-collapsible-trigger-h` | `trigger` | `block-size`<br>`min-block-size` | `default`<br>`xh-action-profile=disclosure-trigger` | `--xh-_action-profile-visual-size` |
| `--xh-collapsible-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_collapsible-trigger-px` |
| `--xh-collapsible-trigger-py` | `trigger` | `padding-block` | `xh-action-profile=disclosure-trigger` | `--xh-_collapsible-trigger-py` |
| `--xh-collapsible-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` |
