# Citation <Badge type="info" text="alpha" />

AI chat component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/citation).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/citation" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/citation.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/citation" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/citation" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/citation.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="citation"`: **`root`** · `text` · `trigger` · `positioner` · **`preview`** · `preview-header` · **`preview-title`** · `preview-meta` · `quote` · `preview-link` · `dismiss-trigger` · `prev-trigger` · `next-trigger` · `preview-index` · **`list`** · **`source`** · **`source-link`** · `source-index` · `source-title` · `source-meta`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-citation>` |
| Vue components | `XhCitationList` `XhCitationPositioner` `XhCitationPreview` `XhCitationRoot` `XhCitationSource` `XhCitationSourceIndex` `XhCitationSourceLink` `XhCitationSourceMeta` `XhCitationSourceTitle` `XhCitationText` `XhCitationTrigger` |
| Composable | `useCitation` |
| State machine | `citationMachine` |
| Skin | `@xihan-ui/styles/citation.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `previewMode` | `CitationPreviewMode` |  |
| `openDelay` | `number` |  |
| `closeDelay` | `number` |  |
| `skipDelayDuration` | `number` |  |
| `placement` | `Placement` |  |
| `offset` | `number` |  |
| `sources` | `readonly CitationSource[]` |  |
| `activeSourceId` | `string \| null` |  |
| `defaultActiveSourceId` | `string \| null` |  |
| `open` | `boolean` |  |
| `defaultOpen` | `boolean` |  |
| `disabled` | `boolean` |  |
| `loop` | `boolean` |  |
| `dir` | `Direction` |  |
| `size` | `Size` |  |
| `translations` | `Partial<CitationTranslations>` |  |
| `onActiveSourceChange` | `(details: CitationActiveSourceChangeDetails) => void` |  |
| `onOpenChange` | `(details: CitationOpenChangeDetails) => void` |  |
| `onSourceOpen` | `(details: CitationSourceOpenDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `active-source-change` | `CitationActiveSourceChangeDetails` |
| `open-change` | `CitationOpenChangeDetails` |
| `source-open` | `CitationSourceOpenDetails` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhCitationPositioner` | `container` | `PortalContainer` |  |
| `XhCitationPreview` | `sourceId` | `string` | Yes |
| `XhCitationPreview` | `anchorIndex` | `number` |  |
| `XhCitationRoot` | `children` | `ReactNode` |  |
| `XhCitationSource` | `sourceId` | `string` | Yes |
| `XhCitationSource` | `disabled` | `boolean` |  |
| `XhCitationTrigger` | `sourceId` | `string` |  |
| `XhCitationTrigger` | `sourceIds` | `readonly string[]` |  |
| `XhCitationTrigger` | `citationId` | `string` |  |
| `XhCitationTrigger` | `anchorIndex` | `number` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `preview` | 'open' \| 'closed' |
| `source` | 'active' \| 'inactive' |
| `source-link` | 'active' \| 'inactive' |

The following names are internal to the state machine.

**States**: `idle` · `opening` · `closing`

**Events**: `CITATION.ACTIVATE` · `TRIGGER.ENTER` · `POINTER.LEAVE` · `FLOATING.ENTER` · `TRIGGER.FOCUS` · `FLOATING.FOCUS` · `HOVER.BLUR` · `after.openDelay` · `after.closeDelay` · `GROUP.STEP` · `DISMISS` · `SOURCE.ACTIVATE` · `SOURCE.OPEN` · `SOURCE.FOCUS` · `LIST.BLUR` · `OPEN.SET` · `PREVIEW.MEASURED` · `PREVIEW.LEFT`

**Guards**: `isHoverMode` · `isVisible` · `isWarm` · `isFocusHeld` · `isSameTarget`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `sources` | `readonly CitationSource[]` |
| `activeSource` | `CitationSource \| null` |
| `activeSourceId` | `string \| null` |
| `activeAnchorIndex` | `number \| null` |
| `activeGroup` | `readonly string[] \| null` |
| `previewMode` | `CitationPreviewMode` |
| `open` | `boolean` |
| `focusedSourceId` | `string \| null` |
| `setOpen` | `(next: boolean) => void` |
| `setActiveSource` | `(sourceId: string) => void` |
| `getRootProps` | `() => T['element']` |
| `getTextProps` | `() => T['element']` |
| `getTriggerProps` | `(props: CitationTriggerProps) => T['button']` |
| `getPositionerProps` | `() => T['element']` |
| `getPreviewProps` | `(props: CitationPreviewProps) => T['element']` |
| `getPreviewHeaderProps` | `(props: CitationPreviewProps) => T['element']` |
| `getPreviewTitleProps` | `(props: CitationPreviewProps) => T['element']` |
| `getPreviewMetaProps` | `(props: CitationPreviewProps) => T['element']` |
| `getQuoteProps` | `(props: CitationPreviewProps) => T['element']` |
| `getPreviewLinkProps` | `(props: CitationPreviewProps) => T['element']` |
| `sourceMetaText` | `(source: CitationSource \| undefined) => string` |
| `previewLinkText` | `(props: CitationPreviewProps) => string` |
| `getDismissTriggerProps` | `(props: CitationPreviewProps) => T['button']` |
| `getPrevTriggerProps` | `(props: CitationPreviewProps) => T['button']` |
| `getNextTriggerProps` | `(props: CitationPreviewProps) => T['button']` |
| `getPreviewIndexProps` | `(props: CitationPreviewProps) => T['element']` |
| `getPreviewPosition` | `(props: CitationPreviewProps) => { index: number, total: number } \| null` |
| `getListProps` | `() => T['element']` |
| `getSourceProps` | `(props: CitationSourceItemProps) => T['element']` |
| `getSourceLinkProps` | `(props: CitationSourceItemProps) => T['button']` |
| `getSourceIndexProps` | `(props: CitationSourceItemProps) => T['element']` |
| `getSourceTitleProps` | `(props: CitationSourceItemProps) => T['element']` |
| `getSourceMetaProps` | `(props: CitationSourceItemProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Space` / `Enter` | `citation.kbd.trigger` |
| `ArrowDown` | `citation.kbd.next` |
| `ArrowUp` | `citation.kbd.prev` |
| `Home` | `citation.kbd.first` |
| `End` | `citation.kbd.last` |
| `Space` / `Enter` | `citation.kbd.open` |
| `Tab` | `citation.kbd.hover-focus` |
| `Space` / `Enter` | `citation.kbd.step` |
| `Escape` | `citation.kbd.escape` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `trigger` | `aria-controls` | id of the `preview` part |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-label` | labels.citations(ids.map(sourceId =&gt; indexOf(sourceId… \| labels.citation(indexOf(ids[0]!) + 1, citationSourceT… |
| `preview` | `aria-label` | labels.preview \| undefined |
| `preview` | `aria-labelledby` | context.get('activeTriggerId') \| undefined |
| `preview` | `role` | 'region' |
| `preview-link` | `aria-labelledby` | id of the `preview-link` part id of the `preview-title` part |
| `dismiss-trigger` | `aria-label` | labels.closePreview |
| `preview-index` | `aria-hidden` | 'true' |
| `list` | `aria-label` | labels.sources |
| `list` | `role` | 'list' |
| `source` | `role` | 'listitem' |
| `source-link` | `aria-controls` | id of the `preview` part |
| `source-link` | `aria-current` | 'true' \| undefined |
| `source-link` | `aria-expanded` | 'true' \| 'false' |
| `source-index` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/citation.css` is written against `[data-scope="citation"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-citation` in place of data-scope (same specificity) and sits in the `xihan.components` and `xihan.motion` layers. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-preview-mode` | props.previewMode |
| `root` | `data-size` | props.size |
| `trigger` | `data-disabled` | '' (present only while the condition holds) |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'xs' |
| `trigger` | `data-xh-action-variant` | 'subtle' |
| `positioner` | `data-hidden` | '' (present only while the condition holds) |
| `positioner` | `data-placement` | actual placement computed by the positioning engine \| undefined |
| `positioner` | `data-positioned` | '' (present only while the condition holds) |
| `positioner` | `data-preview-mode` | props.previewMode |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `preview` | `data-instant` | '' (present only while the condition holds) |
| `preview` | `data-preview-mode` | props.previewMode |
| `preview` | `data-state` | 'open' \| 'closed' |
| `preview` | `data-xh-material` | 'frosted' \| undefined |
| `preview-link` | `data-xh-action-control` | '' |
| `preview-link` | `data-xh-action-display` | 'always' \| undefined |
| `preview-link` | `data-xh-action-profile` | 'text' \| undefined |
| `preview-link` | `data-xh-action-size` | 'sm' \| undefined |
| `preview-link` | `data-xh-action-variant` | 'ghost' \| undefined |
| `dismiss-trigger` | `data-xh-action-control` | '' |
| `dismiss-trigger` | `data-xh-action-display` | 'always' |
| `dismiss-trigger` | `data-xh-action-profile` | 'icon' |
| `dismiss-trigger` | `data-xh-action-size` | 'xs' |
| `dismiss-trigger` | `data-xh-action-variant` | 'ghost' |
| `list` | `data-disabled` | '' (present only while the condition holds) |
| `source` | `data-disabled` | '' (present only while the condition holds) |
| `source` | `data-state` | 'active' \| 'inactive' |
| `source-link` | `data-current` | '' (present only while the condition holds) |
| `source-link` | `data-disabled` | '' (present only while the condition holds) |
| `source-link` | `data-state` | 'active' \| 'inactive' |
| `source-link` | `data-xh-action-control` | '' |
| `source-link` | `data-xh-action-display` | 'always' |
| `source-link` | `data-xh-action-profile` | 'row' |
| `source-link` | `data-xh-action-size` | props.size |
| `source-link` | `data-xh-action-variant` | 'ghost' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-citation-card-backdrop` | `preview` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `preview-mode=hover`<br>`xh-material=frosted` | `--xh-_material-backdrop` |
| `--xh-citation-card-bg` | `preview` | `background` | `not([data-xh-action-control])`<br>`preview-mode=hover`<br>`xh-material=frosted` | `--xh-_material-bg` |
| `--xh-citation-card-border` | `preview` | `border` | `not([data-xh-action-control])`<br>`preview-mode=hover`<br>`xh-material=frosted` | `--xh-_material-border` |
| `--xh-citation-card-fg` | `preview` | `color` | `not([data-xh-action-control])`<br>`preview-mode=hover`<br>`xh-material=frosted` | `--xh-_material-fg` |
| `--xh-citation-card-max-h` | `preview` | `max-block-size` | `preview-mode=hover` | `--xh-overlay-max-h` |
| `--xh-citation-card-max-w` | `preview` | `max-inline-size` | `preview-mode=hover` | `--xh-overlay-max-w` |
| `--xh-citation-card-quote-lines` | `preview`<br>`quote` | `-webkit-line-clamp` | `not([hidden])`<br>`preview-mode=hover` | `6` |
| `--xh-citation-card-radius` | `preview` | `border-radius` | `preview-mode=hover` | `--xh-shape-overlay` |
| `--xh-citation-card-shadow` | `preview` | `box-shadow` | `not([data-xh-action-control])`<br>`preview-mode=hover`<br>`xh-material=frosted` | `--xh-_material-shadow` |
| `--xh-citation-dismiss-trigger-radius` | `dismiss-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-citation-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-citation-font-size` | `positioner`<br>`root` | `font-size` | `default`<br>`preview-mode=hover` | `--xh-_citation-font-size` |
| `--xh-citation-gap` | `preview`<br>`root` | `gap`<br>`margin-block-start` | `@keyframes xh-citation-preview-collapse`<br>`@keyframes xh-citation-preview-expand`<br>`default`<br>`not([data-xh-material])`<br>`xh-material` | `--xh-_citation-gap` |
| `--xh-citation-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])` | `--xh-_citation-icon-size` |
| `--xh-citation-index-active-bg` | `source`<br>`source-index` | `background` | `state=active` | `--xh-bg-brand` |
| `--xh-citation-index-active-fg` | `source`<br>`source-index` | `color` | `state=active` | `--xh-fg-on-brand` |
| `--xh-citation-index-bg` | `source-index` | `background` | `default` | `--xh-bg-subtle` |
| `--xh-citation-index-fg` | `source-index` | `color` | `default` | `--xh-fg-muted` |
| `--xh-citation-index-font-size` | `source-index` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-citation-index-radius` | `source-index` | `border-radius` | `default` | `--xh-shape-circle` |
| `--xh-citation-index-size` | `source-index` | `block-size`<br>`min-inline-size` | `default` | `--xh-control-box-sm` |
| `--xh-citation-layer` | `positioner` | `z-index` | `preview-mode=hover` | `--xh-_layer` |
| `--xh-citation-link-fg` | `preview-link` | `color` | `default` | `--xh-fg-brand` |
| `--xh-citation-list-gap` | `list` | `gap` | `default` | `--xh-space-1` |
| `--xh-citation-meta-fg` | `preview-index`<br>`preview-meta`<br>`source-meta` | `color` | `default` | `--xh-fg-muted` |
| `--xh-citation-meta-font-size` | `preview-index`<br>`preview-meta`<br>`source-meta` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-citation-pager-radius` | `next-trigger`<br>`prev-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-citation-preview-bg` | `preview` | `background` | `not([data-xh-material])`<br>`xh-material` | `--xh-bg-surface` |
| `--xh-citation-preview-border` | `preview` | `border` | `not([data-xh-material])`<br>`xh-material` | `--xh-border-default` |
| `--xh-citation-preview-fg` | `preview` | `color` | `not([data-xh-material])`<br>`xh-material` | `--xh-fg-default` |
| `--xh-citation-preview-gap` | `preview` | `gap` | `default` | `--xh-space-3` |
| `--xh-citation-preview-header-content-gap` | `preview-header` | `gap` | `first-child` | `--xh-space-0_5` |
| `--xh-citation-preview-header-gap` | `preview-header` | `gap` | `default` | `--xh-space-3` |
| `--xh-citation-preview-link-radius` | `preview-link` | `border-radius` | `focus-visible` | `--xh-shape-control` |
| `--xh-citation-preview-px` | `preview` | `padding-inline` | `default` | `--xh-_citation-pad` |
| `--xh-citation-preview-py` | `preview` | `padding-block` | `default` | `--xh-_citation-pad` |
| `--xh-citation-preview-radius` | `preview` | `border-radius` | `not([data-xh-material])`<br>`xh-material` | `--xh-shape-surface` |
| `--xh-citation-quote-border` | `quote` | `border-inline-start` | `default` | `--xh-fg-brand` |
| `--xh-citation-quote-fg` | `quote` | `color` | `default` | `--xh-fg-muted` |
| `--xh-citation-quote-font-size` | `quote` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-citation-quote-ps` | `quote` | `padding-inline-start` | `default` | `--xh-space-3` |
| `--xh-citation-source-fg` | `source-link` | `color` | `default` | `--xh-fg-default` |
| `--xh-citation-source-link-content-gap` | `source-link` | `gap` | `last-child` | `--xh-space-0_5` |
| `--xh-citation-source-px` | `source-link` | `padding-inline` | `default` | `--xh-space-3` |
| `--xh-citation-source-py` | `source-link` | `padding-block` | `xh-action-profile=row` | `--xh-space-2` |
| `--xh-citation-source-radius` | `source-link` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-citation-source-title-fg` | `source-title` | `color` | `default` | `--xh-fg-default` |
| `--xh-citation-text-fg` | `text` | `color` | `default` | `--xh-fg-default` |
| `--xh-citation-title-fg` | `preview-title` | `color` | `default` | `--xh-fg-default` |
| `--xh-citation-title-font-size` | `preview-title` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-citation-title-font-weight` | `preview-title` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-citation-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-brand` |
| `--xh-citation-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-text-caption-size` |
| `--xh-citation-trigger-h` | `trigger` | `block-size`<br>`inline-size`<br>`min-block-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon`<br>`xh-action-profile=row` | `--xh-space-6` |
| `--xh-citation-trigger-margin` | `trigger` | `margin-inline` | `default` | `--xh-space-0_5` |
| `--xh-citation-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-space-1` |
| `--xh-citation-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-pill` |
