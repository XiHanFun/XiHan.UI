# Timeline

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/timeline).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/timeline" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/timeline.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/timeline" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/timeline" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/timeline.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="timeline"`: **`root`** · **`item`** · `label` · `indicator` · `connector` · `content` · `title` · `description` · `time`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-timeline>` |
| Vue components | `XhTimelineConnector` `XhTimelineContent` `XhTimelineDescription` `XhTimelineIndicator` `XhTimelineItem` `XhTimelineLabel` `XhTimelineRoot` `XhTimelineTime` `XhTimelineTitle` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/timeline.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `orientation` | `Orientation` |  |
| `placement` | `TimelinePlacement` |  |
| `size` | `Size` |  |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTimelineItem` | `tone` | `Tone` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `getRootProps` | `() => T['element']` |
| `getItemProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getIndicatorProps` | `(props: TimelineItemProps) => T['element']` |
| `getConnectorProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getTimeProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `role` | 'list' |
| `item` | `role` | 'listitem' |
| `indicator` | `aria-hidden` | 'true' |
| `connector` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/timeline.css` is written against `[data-scope="timeline"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-timeline` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-placement` | props.placement |
| `root` | `data-size` | props.size |
| `item` | `data-orientation` | props.orientation |
| `item` | `data-placement` | props.placement |
| `label` | `data-orientation` | props.orientation |
| `label` | `data-placement` | props.placement |
| `indicator` | `data-tone` | item.tone |
| `connector` | `data-orientation` | props.orientation |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-timeline-connector-bg` | `connector` | `background` | `default` | `--xh-border-default` |
| `--xh-timeline-connector-min-length` | `connector`<br>`item` | `min-block-size`<br>`min-inline-size` | `@media (min-width: 768px)`<br>`default`<br>`has(> [data-scope='timeline'][data-part='label'])`<br>`orientation=horizontal` | `--xh-space-4` |
| `--xh-timeline-connector-radius` | `connector` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-timeline-connector-thickness` | `connector`<br>`item` | `block-size`<br>`inline-size` | `@media (min-width: 768px)`<br>`default`<br>`has(> [data-scope='timeline'][data-part='label'])`<br>`orientation=horizontal` | `--xh-stroke-thin` |
| `--xh-timeline-content-gap` | `content` | `gap` | `default` | `--xh-space-1` |
| `--xh-timeline-content-pb` | `content`<br>`item` | `padding-block-end` | `@media (min-width: 768px)`<br>`nth-child(even)`<br>`orientation=horizontal`<br>`placement=alternate`<br>`placement=start` | `--xh-space-4` |
| `--xh-timeline-content-pt` | `content`<br>`item` | `padding-block-start` | `@media (min-width: 768px)`<br>`has(> [data-scope='timeline'][data-part='label'])`<br>`orientation=horizontal` | `--xh-space-4` |
| `--xh-timeline-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-timeline-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-timeline-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-timeline-gutter` | `item` | `column-gap` | `default` | `--xh-_timeline-gutter` |
| `--xh-timeline-indicator-bg` | `indicator` | `background` | `default` | `--xh-_tone-soft` |
| `--xh-timeline-indicator-fg` | `indicator` | `color` | `default` | `--xh-_tone-on` |
| `--xh-timeline-indicator-font-size` | `indicator` | `font-size` | `default` | `--xh-_timeline-caption-font-size` |
| `--xh-timeline-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-timeline-indicator-size` | `indicator`<br>`item` | `block-size`<br>`inline-size`<br>`margin-block-start` | `default` | `--xh-_timeline-dot-size` |
| `--xh-timeline-item-gap` | `content`<br>`item` | `padding-block-end`<br>`padding-inline-end` | `@media (min-width: 768px)`<br>`default`<br>`has(> [data-scope='timeline'][data-part='label'])`<br>`orientation=horizontal` | `--xh-_timeline-item-gap` |
| `--xh-timeline-label-fg` | `label` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-timeline-label-font-size` | `label` | `font-size` | `default` | `--xh-_timeline-caption-font-size` |
| `--xh-timeline-time-fg` | `time` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-timeline-time-font-size` | `time` | `font-size` | `default` | `--xh-_timeline-caption-font-size` |
| `--xh-timeline-title-fg` | `title` | `color` | `default` | `--xh-fg-default` |
| `--xh-timeline-title-font-size` | `indicator`<br>`item`<br>`label`<br>`root`<br>`title` | `font-size`<br>`line-height`<br>`margin-block-start` | `default` | `--xh-_timeline-title-font-size` |
| `--xh-timeline-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-label-weight` |
