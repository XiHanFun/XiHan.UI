# Popconfirm

Overlays component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/popconfirm).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/popconfirm" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/popconfirm.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/popconfirm" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/popconfirm" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/popconfirm.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="popconfirm"`: **`root`** · **`trigger`** · `positioner` · **`content`** · `title` · `description` · **`confirm-trigger`** · **`cancel-trigger`** · `arrow`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-popconfirm>` |
| Vue components | `XhPopconfirmArrow` `XhPopconfirmCancelTrigger` `XhPopconfirmConfirmTrigger` `XhPopconfirmContent` `XhPopconfirmDescription` `XhPopconfirmPositioner` `XhPopconfirmRoot` `XhPopconfirmTitle` `XhPopconfirmTrigger` |
| Composable | `usePopconfirm` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/popconfirm.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `closeOnEscape` | `boolean` |  |
| `closeOnInteractOutside` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `dir` | `Direction` |  |
| `disabled` | `boolean` |  |
| `offset` | `number` |  |
| `onCancelPress` | `() => void` |  |
| `onConfirm` | `() => void \| PromiseLike<unknown>` |  |
| `onConfirmError` | `(details: PopconfirmConfirmErrorDetails) => void` |  |
| `onOpenChange` | `(details: PopoverOpenChangeDetails) => void` |  |
| `open` | `boolean` |  |
| `parts` | `TitleDescriptionParts` |  |
| `placement` | `Placement` |  |
| `size` | `Size` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `PopoverOpenChangeDetails` |
| `confirm` | `` |
| `confirm-error` | `PopconfirmConfirmErrorDetails` |
| `cancel-press` | `` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhPopconfirmRoot` | `default` | `PopconfirmRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhPopconfirmPositioner` | `container` | `() => Element \| null` |  |
| `XhPopconfirmRoot` | `children` | `SlotChildren<PopconfirmRootSlotProps>` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `pending` | `boolean` |
| `actionError` | `PopconfirmConfirmErrorDetails \| null` |
| `setOpen` | `(next: boolean) => void` |
| `confirm` | `() => void` |
| `cancel` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getTriggerProps` | `() => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getConfirmTriggerProps` | `() => T['button']` |
| `getCancelTriggerProps` | `() => T['button']` |
| `getArrowProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/TR/wai-aria-1.2/#dialog). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `popconfirm.kbd.toggle-on-trigger` |
| `Enter` / `Space` | `popconfirm.kbd.confirm` |
| `Enter` / `Space` | `popconfirm.kbd.cancel` |
| `Escape` | `popconfirm.kbd.escape` |
| `Enter` / `Space` | `popconfirm.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `content` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | id of the `description` part \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | id of the `title` part \| undefined |
| `content` | `role` | 'dialog' |
| `confirm-trigger` | `aria-busy` | 'true' \| undefined |
| `confirm-trigger` | `aria-disabled` | 'true' \| undefined |
| `arrow` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/popconfirm.css` is written against `[data-scope="popconfirm"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-popconfirm` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-pressed` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-instant` | '' (present only while the condition holds) |
| `content` | `data-placement` | actual placement computed by the positioning engine |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-xh-material` | 'frosted' |
| `confirm-trigger` | `data-loading` | '' (present only while the condition holds) |
| `confirm-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `confirm-trigger` | `data-xh-action-control` | '' |
| `confirm-trigger` | `data-xh-action-display` | 'always' |
| `confirm-trigger` | `data-xh-action-profile` | 'text' |
| `confirm-trigger` | `data-xh-action-size` | 'sm' |
| `confirm-trigger` | `data-xh-action-variant` | 'solid' |
| `confirm-trigger` | `data-xh-ink-surface` | '' |
| `confirm-trigger` | `data-xh-loading-ring` | 'overlay' |
| `cancel-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `cancel-trigger` | `data-xh-action-control` | '' |
| `cancel-trigger` | `data-xh-action-display` | 'always' |
| `cancel-trigger` | `data-xh-action-profile` | 'text' |
| `cancel-trigger` | `data-xh-action-size` | 'sm' |
| `cancel-trigger` | `data-xh-action-variant` | 'outline' |
| `arrow` | `data-placement` | actual placement computed by the positioning engine |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-popconfirm-action-font-weight` | `cancel-trigger`<br>`confirm-trigger` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-popconfirm-action-mt` | `cancel-trigger`<br>`confirm-trigger` | `margin-block-start` | `default` | `--xh-space-3` |
| `--xh-popconfirm-action-px` | `cancel-trigger`<br>`confirm-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` |
| `--xh-popconfirm-action-radius` | `cancel-trigger`<br>`confirm-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-popconfirm-action-shadow` | `cancel-trigger`<br>`confirm-trigger` | `box-shadow` | `default` | `none` |
| `--xh-popconfirm-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` |
| `--xh-popconfirm-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` |
| `--xh-popconfirm-bg` | `arrow`<br>`content` | `background` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg`<br>`--xh-material-frosted-bg` |
| `--xh-popconfirm-border` | `arrow`<br>`content` | `border` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border`<br>`--xh-material-frosted-border` |
| `--xh-popconfirm-cancel-bg` | `cancel-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `transparent` |
| `--xh-popconfirm-cancel-bg-active` | `cancel-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-popconfirm-cancel-bg-focus` | `cancel-trigger` | `background-color` | `focus-visible` | `--xh-popconfirm-cancel-bg` |
| `--xh-popconfirm-cancel-bg-hover` | `cancel-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` |
| `--xh-popconfirm-cancel-border` | `cancel-trigger` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-border-control` |
| `--xh-popconfirm-cancel-border-hover` | `cancel-trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-control-hover` |
| `--xh-popconfirm-cancel-fg` | `cancel-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-popconfirm-cancel-fg-focus` | `cancel-trigger` | `color` | `focus-visible` | `--xh-popconfirm-cancel-fg` |
| `--xh-popconfirm-column-gap` | `content` | `column-gap` | `default` | `--xh-popconfirm-gap` |
| `--xh-popconfirm-confirm-bg` | `confirm-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`loading`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-loading`<br>`--xh-_action-variant-bg-rest` |
| `--xh-popconfirm-confirm-fg` | `confirm-trigger` | `border`<br>`border-color`<br>`color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`motion=reduce`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`where([data-motion='reduce'])`<br>`xh-loading-ring`<br>`xh-loading-ring=overlay` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-loading`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` |
| `--xh-popconfirm-confirm-shadow` | `confirm-trigger` | `box-shadow` | `default` | `--xh-popconfirm-action-shadow` |
| `--xh-popconfirm-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-popconfirm-description-font-size` | `description` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-popconfirm-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-popconfirm-gap` | `content` | `column-gap`<br>`gap` | `default` | `--xh-space-1`<br>`--xh-space-2` |
| `--xh-popconfirm-icon-size` | `cancel-trigger`<br>`confirm-trigger`<br>`content`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` |
| `--xh-popconfirm-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` |
| `--xh-popconfirm-loading-duration` | `confirm-trigger` | `animation` | `xh-loading-ring` | `--xh-motion-loop-spin` |
| `--xh-popconfirm-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` |
| `--xh-popconfirm-max-w` | `content` | `max-inline-size` | `default` | `--xh-_popconfirm-max-w` |
| `--xh-popconfirm-px` | `content` | `padding-inline` | `default` | `--xh-_popconfirm-px` |
| `--xh-popconfirm-py` | `content` | `padding-block` | `default` | `--xh-_popconfirm-py` |
| `--xh-popconfirm-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` |
| `--xh-popconfirm-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-popconfirm-title-fg` | `title` | `color` | `default` | `--xh-material-frosted-fg` |
| `--xh-popconfirm-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-popconfirm-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-medium` |
