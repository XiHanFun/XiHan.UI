# Alert

Feedback component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/alert).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/alert" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/alert.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/alert" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/alert" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/alert.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="alert"`: **`root`** · `indicator` · **`content`** · `title` · `description` · `action` · `close-trigger`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-alert>` |
| Vue components | `XhAlertAction` `XhAlertCloseTrigger` `XhAlertContent` `XhAlertDescription` `XhAlertIndicator` `XhAlertRoot` `XhAlertTitle` |
| State machine | `alertMachine` |
| Skin | `@xihan-ui/styles/alert.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `tone` | `Tone` |  |
| `closable` | `boolean` |  |
| `banner` | `boolean` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `onOpenChange` | `(details: AlertOpenChangeDetails) => void` |  |
| `parts` | `TitleDescriptionParts` |  |
| `translations` | `Partial<AlertTranslations>` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `open-change` | `AlertOpenChangeDetails` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhAlertRoot` | `children` | `ReactNode` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `open` · `closed`

**Events**: `OPEN` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END` · `ROOT.RENDERED`

**Guards**: `isOpenControlled` · `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `open` | `boolean` |
| `tone` | `string` |
| `closable` | `boolean` |
| `banner` | `boolean` |
| `setOpen` | `(next: boolean) => void` |
| `getRootProps` | `() => T['element']` |
| `getIndicatorProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getActionProps` | `() => T['element']` |
| `getCloseTriggerProps` | `() => T['button']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `alert.kbd.close` |
| `Enter` / `Space` | `alert.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-atomic` | 'true' |
| `root` | `aria-describedby` | id of the `description` part \| undefined |
| `root` | `aria-labelledby` | id of the `title` part \| undefined |
| `root` | `aria-live` | live |
| `root` | `role` | role |
| `indicator` | `aria-hidden` | 'true' |
| `close-trigger` | `aria-label` | translations.close |

## Style reference

### Skin

`@xihan-ui/styles/alert.css` is written against `[data-scope="alert"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-alert` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-banner` | '' (present only while the condition holds) |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `close-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `close-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-alert-action-gap` | `action` | `gap` | `default` | `--xh-space-2` |
| `--xh-alert-bg` | `root` | `background` | `default` | `--xh-_tone-subtle` |
| `--xh-alert-border` | `root` | `border` | `default` | `transparent` |
| `--xh-alert-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_tone-subtle-active` |
| `--xh-alert-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_tone-subtle-hover` |
| `--xh-alert-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` |
| `--xh-alert-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` |
| `--xh-alert-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-alert-close-size` | `close-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` |
| `--xh-alert-content-gap` | `content` | `gap` | `default` | `--xh-space-1` |
| `--xh-alert-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-alert-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-alert-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-alert-font-size` | `root` | `font-size` | `default` | `--xh-text-body-size` |
| `--xh-alert-gap` | `root` | `gap` | `default` | `--xh-space-2` |
| `--xh-alert-icon-size` | `close-trigger`<br>`root` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` |
| `--xh-alert-indicator-fg` | `indicator` | `color` | `default` | `--xh-_tone-fg` |
| `--xh-alert-indicator-p` | `indicator` | `padding` | `default` | `--xh-space-1` |
| `--xh-alert-leading` | `root` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-alert-px` | `root` | `padding-inline` | `default` | `--xh-surface-px-sm` |
| `--xh-alert-py` | `root` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-alert-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-alert-shadow` | `root` | `box-shadow` | `default` | `none` |
| `--xh-alert-title-fg` | `title` | `color` | `default` | `--xh-fg-default` |
| `--xh-alert-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` |
| `--xh-alert-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` |
| `--xh-alert-title-leading` | `title` | `line-height` | `default` | `--xh-leading-tight` |
