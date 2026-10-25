# EmptyState

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/empty-state).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/empty-state" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/empty-state.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/empty-state" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/empty-state" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/empty-state.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="empty-state"`: **`root`** · `media` · `indicator` · `title` · `description` · `action`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-empty-state>` |
| Vue components | `XhEmptyStateAction` `XhEmptyStateDescription` `XhEmptyStateIndicator` `XhEmptyStateMedia` `XhEmptyStateRoot` `XhEmptyStateTitle` |
| State machine | `emptyStateMachine` |
| Skin | `@xihan-ui/styles/empty-state.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `live` | `EmptyStateLive` |  |
| `size` | `Size` |  |
| `status` | `EmptyStateStatus` |  |
| `tone` | `Tone` |  |

### State

The following names are internal to the state machine.

**States**: `idle`

**Events**: `APPEARANCE.RELEASE`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `live` | `EmptyStateLive` |
| `getRootProps` | `() => T['element']` |
| `getMediaProps` | `() => T['element']` |
| `getIndicatorProps` | `() => T['element']` |
| `getTitleProps` | `() => T['element']` |
| `getDescriptionProps` | `() => T['element']` |
| `getActionProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `role` | undefined \| 'status' |
| `media` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/empty-state.css` is written against `[data-scope="empty-state"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-empty-state` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-status` | props.status |
| `root` | `data-tone` | props.tone |
| `media` | `data-instant` | '' (present only while the condition holds) |
| `indicator` | `data-instant` | '' (present only while the condition holds) |
| `title` | `data-instant` | '' (present only while the condition holds) |
| `description` | `data-instant` | '' (present only while the condition holds) |
| `action` | `data-instant` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-empty-state-action-gap` | `action` | `gap` | `default` | `--xh-space-2` |
| `--xh-empty-state-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` |
| `--xh-empty-state-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-empty-state-description-leading` | `description` | `line-height` | `default` | `--xh-leading-normal` |
| `--xh-empty-state-description-max-w` | `description` | `max-inline-size` | `default` | `--xh-measure-prose` |
| `--xh-empty-state-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-empty-state-gap` | `description`<br>`root`<br>`title` | `gap`<br>`margin-block-start` | `default` | `--xh-_empty-state-gap` |
| `--xh-empty-state-icon-size` | `indicator`<br>`root` | `--xh-icon-size`<br>`block-size`<br>`font-size`<br>`inline-size` | `default`<br>`tone` | `--xh-_empty-state-icon-size`<br>`--xh-glyph-size-md` |
| `--xh-empty-state-indicator-bg` | `indicator`<br>`root` | `background` | `tone` | `--xh-_tone-subtle` |
| `--xh-empty-state-indicator-box` | `indicator`<br>`root` | `block-size`<br>`inline-size` | `tone` | `--xh-control-box-lg` |
| `--xh-empty-state-indicator-fg` | `indicator` | `color` | `default` | `--xh-_empty-state-accent` |
| `--xh-empty-state-indicator-font-size` | `indicator` | `font-size` | `default` | `--xh-_empty-state-icon-size` |
| `--xh-empty-state-indicator-radius` | `indicator`<br>`root` | `border-radius` | `tone` | `--xh-shape-circle` |
| `--xh-empty-state-media-fg` | `media` | `color` | `default` | `--xh-_empty-state-accent` |
| `--xh-empty-state-media-size` | `media` | `block-size` | `default` | `--xh-_empty-state-icon-size` |
| `--xh-empty-state-px` | `root` | `padding-inline` | `default` | `--xh-space-6` |
| `--xh-empty-state-py` | `root` | `padding-block` | `default` | `--xh-_empty-state-py` |
| `--xh-empty-state-title-fg` | `title` | `color` | `default` | `--xh-fg-default` |
| `--xh-empty-state-title-font-size` | `title` | `font-size` | `default` | `--xh-_empty-state-title-size` |
| `--xh-empty-state-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-empty-state-title-leading` | `title` | `line-height` | `default` | `--xh-leading-normal` |
