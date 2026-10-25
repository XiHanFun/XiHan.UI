# FloatButton

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/float-button).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/float-button" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/float-button.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/float-button" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/float-button" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/float-button.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="float-button"`: **`root`** · **`trigger`** · **`list`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-float-button>` |
| Vue components | `XhFloatButtonList` `XhFloatButtonRoot` `XhFloatButtonTrigger` |
| Composable | `useFloatButton` |
| State machine | `floatButtonMachine` |
| Skin | `@xihan-ui/styles/float-button.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `defaultOpen` | `boolean` |  |
| `defaultPosition` | `FloatButtonPosition` |  |
| `dir` | `Direction` |  |
| `disabled` | `boolean` |  |
| `draggable` | `boolean` |  |
| `expandTrigger` | `FloatButtonExpandTrigger` |  |
| `offset` | `number` |  |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  |
| `onPositionChange` | `(details: FloatButtonPositionChangeDetails) => void` |  |
| `open` | `boolean` |  |
| `placement` | `FloatButtonPlacement` |  |
| `position` | `FloatButtonPosition` |  |
| `size` | `Size` |  |
| `snap` | `FloatButtonSnap` |  |
| `tone` | `Tone` |  |
| `translations` | `Partial<FloatButtonTranslations>` |  |
| `variant` | `ActionVariant` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `CollapsibleOpenChangeDetails` |
| `position-change` | `FloatButtonPositionChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhFloatButtonRoot` | `default` | `FloatButtonRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhFloatButtonRoot` | `children` | `SlotChildren<FloatButtonRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `list` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `CLOSE` · `TOGGLE` · `DISABLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `CLICK.SWALLOW` · `VIEWPORT.RESIZE`

**Guards**: `isDisabled` · `isOpenControlled` · `canPress` · `canDrag`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `position` | `FloatButtonPosition \| null` |
| `setPosition` | `(next: FloatButtonPosition) => void` |
| `dragging` | `boolean` |
| `getRootProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getListProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `float-button.kbd.toggle` |
| `Enter` / `Space` | `float-button.kbd.press` |
| `Escape` | `float-button.kbd.escape` |
| `Tab` / `Shift+Tab` | `float-button.kbd.tab` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `list` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-label` | translations.trigger |
| `list` | `aria-labelledby` | id of the `trigger` part |
| `list` | `role` | 'group' |

## Style reference

### Skin

`@xihan-ui/styles/float-button.css` is written against `[data-scope="float-button"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-float-button` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-draggable` | '' (present only while the condition holds) |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-edge` | edge?.edge |
| `root` | `data-moving` | '' (present only while the condition holds) |
| `root` | `data-placement` | floatButtonPlacementOf(position, context.get('viewpor… \| props.placement |
| `root` | `data-point` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'floating' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | props.variant |
| `trigger` | `data-xh-ink-surface` | '' (present only while the condition holds) |
| `trigger` | `data-xh-liquid` | '' |
| `trigger` | `data-xh-material` | 'frosted' \| undefined |
| `list` | `data-instant` | '' (present only while the condition holds) |
| `list` | `data-placement` | floatButtonPlacementOf(position, context.get('viewpor… \| props.placement |
| `list` | `data-state` | 'open' \| 'closed' |
| `list` | `data-xh-liquid` | '' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-float-button-bg` | `list`<br>`root`<br>`trigger` | `--xh-ink-surface`<br>`background-color` | `@media (forced-colors: none)`<br>`default`<br>`disabled`<br>`focus-visible`<br>`material=liquid`<br>`not([data-scope])`<br>`variant=outline`<br>`variant=subtle`<br>`where([data-material='liquid'])`<br>`xh-ink-surface`<br>`xh-liquid`<br>`xh-liquid-goo` | `--xh-_action-variant-bg-disabled`<br>`--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest`<br>`--xh-_float-button-bg`<br>`--xh-_material-bg`<br>`--xh-_material-bg-focus`<br>`transparent` |
| `--xh-float-button-bg-active` | `list`<br>`root`<br>`trigger` | `background-color` | `@media (forced-colors: none)`<br>`active`<br>`disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`material=liquid`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-scope])`<br>`pressed`<br>`variant=outline`<br>`variant=subtle`<br>`where([data-material='liquid'])`<br>`xh-liquid`<br>`xh-liquid-goo` | `--xh-_action-variant-bg-pressed`<br>`--xh-_float-button-bg-active`<br>`--xh-_material-bg-pressed`<br>`--xh-material-liquid-fg` |
| `--xh-float-button-bg-hover` | `list`<br>`root`<br>`trigger` | `background-color` | `@media (forced-colors: none)`<br>`@media (forced-colors: none) and (hover: hover)`<br>`@media (hover: hover)`<br>`disabled`<br>`hover`<br>`loading`<br>`material=liquid`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-scope])`<br>`variant=outline`<br>`variant=subtle`<br>`where([data-material='liquid'])`<br>`xh-liquid`<br>`xh-liquid-goo` | `--xh-_action-variant-bg-hover`<br>`--xh-_float-button-bg-hover`<br>`--xh-_material-bg-hover`<br>`--xh-material-liquid-fg` |
| `--xh-float-button-border` | `list`<br>`root`<br>`trigger` | `border`<br>`border-color` | `@media (forced-colors: none)`<br>`default`<br>`disabled`<br>`focus-visible`<br>`material=liquid`<br>`not([data-scope])`<br>`variant=outline`<br>`where([data-material='liquid'])`<br>`xh-liquid`<br>`xh-liquid-goo` | `--xh-_action-variant-border-disabled`<br>`--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest`<br>`--xh-_float-button-border`<br>`--xh-_material-border`<br>`transparent` |
| `--xh-float-button-border-hover` | `list`<br>`root`<br>`trigger` | `border-color` | `@media (forced-colors: none)`<br>`@media (forced-colors: none) and (hover: hover)`<br>`@media (hover: hover)`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`material=liquid`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-scope])`<br>`pressed`<br>`variant=outline`<br>`where([data-material='liquid'])`<br>`xh-liquid`<br>`xh-liquid-goo` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed`<br>`--xh-_float-button-border-hover`<br>`--xh-_material-border`<br>`transparent` |
| `--xh-float-button-fg` | `list`<br>`root`<br>`trigger` | `color` | `@media (forced-colors: none)`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`material=liquid`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-scope])`<br>`pressed`<br>`variant=outline`<br>`where([data-material='liquid'])`<br>`xh-liquid-goo` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest`<br>`--xh-_float-button-fg`<br>`--xh-_material-fg`<br>`--xh-material-liquid-fg` |
| `--xh-float-button-gap` | `list`<br>`root` | `gap` | `default` | `--xh-space-2` |
| `--xh-float-button-icon-size` | `root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_float-button-glyph-size` |
| `--xh-float-button-layer` | `root` | `z-index` | `default` | `--xh-_layer` |
| `--xh-float-button-radius` | `list`<br>`trigger` | `border-radius` | `default` | `--xh-_action-profile-radius`<br>`--xh-shape-circle` |
| `--xh-float-button-shadow` | `*`<br>`list`<br>`root`<br>`trigger` | `--xh-_liquid-goo-shadow`<br>`box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-scope])`<br>`pressed`<br>`variant=outline`<br>`xh-liquid-goo-layer` | `--xh-_float-button-shadow`<br>`--xh-_material-shadow`<br>`--xh-material-liquid-shadow`<br>`none` |
| `--xh-float-button-size` | `list`<br>`root`<br>`trigger` | `block-size`<br>`bottom`<br>`inline-size`<br>`inset-block-end`<br>`inset-block-start`<br>`inset-inline-end`<br>`inset-inline-start`<br>`left`<br>`min-inline-size`<br>`top` | `default`<br>`edge=block`<br>`edge=inline`<br>`moving`<br>`placement`<br>`placement=-end`<br>`placement=-start`<br>`placement=bottom`<br>`placement=top`<br>`point`<br>`xh-action-profile=floating` | `--xh-_float-button-size` |
