# Log

AI chat component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/log).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/log" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/log.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/log" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/log" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/log.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="log"`: **`root`** · **`viewport`** · `content` · `line` · `segment` · `scroll-to-end-trigger` · `live-region`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-log>` |
| Vue components | `XhLogContent` `XhLogLine` `XhLogLiveRegion` `XhLogRoot` `XhLogScrollToEndTrigger` `XhLogSegment` `XhLogViewport` |
| Composable | `useLog` |
| State machine | `logMachine` |
| Skin | `@xihan-ui/styles/log.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `threshold` | `number` |  |
| `virtualizer` | `CollectionVirtualizer` |  |
| `onStickChange` | `(details: LogStickChangeDetails) => void` |  |
| `levels` | `readonly LogLevel[]` |  |
| `loading` | `boolean` |  |
| `rows` | `number` |  |
| `size` | `Size` |  |
| `translations` | `Partial<LogTranslations>` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `stick-change` | `LogStickChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhLogRoot` | `default` | `LogRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhLogLine` | `level` | `LogLevel` |  |
| `XhLogLine` | `ansi` | `string` |  |
| `XhLogRoot` | `children` | `SlotChildren<LogRootSlotProps>` |  |
| `XhLogSegment` | `segment` | `LogAnsiSegment` | Yes |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `scroll-to-end-trigger` | 'visible' \| 'hidden' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `STICK.CHANGE` · `SCROLL_TO_BOTTOM` · `PRESS.START` · `PRESS.END` · `TRIGGER.RENDERED`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `rows` | `number \| undefined` |
| `loading` | `boolean` |
| `atBottom` | `boolean` |
| `sticking` | `boolean` |
| `showScrollToEndTrigger` | `boolean` |
| `virtualized` | `boolean` |
| `isLevelVisible` | `(level?: LogLevel) => boolean` |
| `scrollToBottom` | `() => void` |
| `getRootProps` | `() => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getLineProps` | `(props?: LogLineProps) => T['element']` |
| `getSegmentProps` | `(segment: LogAnsiSegment) => T['element']` |
| `getScrollToEndTriggerProps` | `() => T['button']` |
| `getLiveRegionProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` | `log.kbd.viewport-tab` |
| `Space` / `Enter` | `log.kbd.scroll-to-end-trigger` |
| `Space` / `Enter` | `log.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `viewport` | `aria-busy` | 'true' \| undefined |
| `viewport` | `aria-label` | label.log |
| `viewport` | `aria-live` | 'off' |
| `viewport` | `role` | 'log' |
| `scroll-to-end-trigger` | `aria-label` | label.scrollToBottom |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## Style reference

### Skin

`@xihan-ui/styles/log.css` is written against `[data-scope="log"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-log` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-at-bottom` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-sticking` | '' (present only while the condition holds) |
| `viewport` | `data-virtualized` | '' (present only while the condition holds) |
| `line` | `data-level` | line?.level |
| `segment` | `data-bold` | '' (present only while the condition holds) |
| `segment` | `data-bright` | '' (present only while the condition holds) |
| `segment` | `data-dim` | '' (present only while the condition holds) |
| `segment` | `data-fg` | segment.fg |
| `segment` | `data-italic` | '' (present only while the condition holds) |
| `segment` | `data-underline` | '' (present only while the condition holds) |
| `scroll-to-end-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `scroll-to-end-trigger` | `data-state` | 'visible' \| 'hidden' |
| `scroll-to-end-trigger` | `data-xh-action-control` | '' |
| `scroll-to-end-trigger` | `data-xh-action-display` | 'always' |
| `scroll-to-end-trigger` | `data-xh-action-profile` | 'floating' |
| `scroll-to-end-trigger` | `data-xh-action-size` | floatingSizeBelow(props.size) |
| `scroll-to-end-trigger` | `data-xh-action-variant` | 'ghost' |
| `scroll-to-end-trigger` | `data-xh-liquid` | '' |
| `scroll-to-end-trigger` | `data-xh-material` | 'frosted' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-log-ansi-black` | `segment` | `color` | `fg=black` | `--xh-fg-default` |
| `--xh-log-ansi-blue` | `segment` | `color` | `fg=blue` | `--xh-fg-info` |
| `--xh-log-ansi-bold-weight` | `segment` | `font-weight` | `bold` | `--xh-font-weight-semibold` |
| `--xh-log-ansi-cyan` | `segment` | `color` | `fg=cyan` | `--xh-syntax-string` |
| `--xh-log-ansi-dim-fg` | `segment` | `color` | `dim`<br>`fg`<br>`not([data-fg])` | `--xh-fg-subtle` |
| `--xh-log-ansi-green` | `segment` | `color` | `fg=green` | `--xh-fg-success` |
| `--xh-log-ansi-magenta` | `segment` | `color` | `fg=magenta` | `--xh-syntax-keyword` |
| `--xh-log-ansi-red` | `segment` | `color` | `fg=red` | `--xh-fg-danger` |
| `--xh-log-ansi-white` | `segment` | `color` | `fg=white` | `--xh-fg-muted` |
| `--xh-log-ansi-yellow` | `segment` | `color` | `fg=yellow` | `--xh-fg-warning` |
| `--xh-log-bg` | `root` | `background` | `default` | `--xh-bg-surface` |
| `--xh-log-border` | `root` | `border` | `default` | `--xh-border-default` |
| `--xh-log-content-px` | `content`<br>`line`<br>`viewport` | `padding-inline` | `default`<br>`virtualized` | `--xh-_log-content-px` |
| `--xh-log-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-log-font` | `content`<br>`viewport` | `font-family` | `default`<br>`virtualized` | `--xh-font-family-mono` |
| `--xh-log-font-size` | `content`<br>`viewport` | `font-size` | `default`<br>`virtualized` | `--xh-_log-font-size` |
| `--xh-log-icon-size` | `scroll-to-end-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` |
| `--xh-log-level-debug-fg` | `line` | `color` | `level=debug` | `--xh-fg-subtle` |
| `--xh-log-level-error-fg` | `line` | `color` | `level=error` | `--xh-fg-danger` |
| `--xh-log-level-info-fg` | `line` | `color` | `level=info` | `--xh-fg-default` |
| `--xh-log-level-warn-fg` | `line` | `color` | `level=warn` | `--xh-fg-warning` |
| `--xh-log-line-height` | `line`<br>`root`<br>`viewport` | `block-size`<br>`line-height` | `default` | `--xh-text-code-leading` |
| `--xh-log-line-px` | `line`<br>`viewport` | `padding-inline` | `virtualized` | `--xh-log-content-px` |
| `--xh-log-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-log-rows` | `viewport` | `block-size` | `default` | `16` |
| `--xh-log-scroll-to-end-trigger-bg` | `scroll-to-end-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_material-bg`<br>`--xh-_material-bg-focus` |
| `--xh-log-scroll-to-end-trigger-bg-hover` | `scroll-to-end-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_material-bg-hover` |
| `--xh-log-scroll-to-end-trigger-border` | `scroll-to-end-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-border` |
| `--xh-log-scroll-to-end-trigger-fg` | `scroll-to-end-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-fg` |
| `--xh-log-scroll-to-end-trigger-inset` | `scroll-to-end-trigger` | `inset-block-end`<br>`inset-inline-end` | `default` | `--xh-space-3` |
| `--xh-log-scroll-to-end-trigger-radius` | `scroll-to-end-trigger` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-log-scroll-to-end-trigger-shadow` | `scroll-to-end-trigger` | `box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_material-shadow` |
| `--xh-log-scroll-to-end-trigger-size` | `scroll-to-end-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=floating` | `--xh-_action-profile-visual-size` |
| `--xh-log-shadow` | `root` | `box-shadow` | `default` | `none` |
| `--xh-log-tab-size` | `line` | `tab-size` | `default` | `4` |
