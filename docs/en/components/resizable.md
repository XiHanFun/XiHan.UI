# Resizable

Layout component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/resizable).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/resizable" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/resizable.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/resizable" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/resizable" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/resizable.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="resizable"`: **`root`** · `handle`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-resizable>` |
| Vue components | `XhResizableHandle` `XhResizableRoot` |
| Composable | `useResizable` |
| State machine | `resizableMachine` |
| Skin | `@xihan-ui/styles/resizable.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `dimensions` | `ResizableDimensions` |  |
| `defaultDimensions` | `ResizableDimensions` |  |
| `minWidth` | `number` |  |
| `minHeight` | `number` |  |
| `maxWidth` | `number` |  |
| `maxHeight` | `number` |  |
| `aspectRatio` | `number` |  |
| `step` | `number` |  |
| `keyboardStep` | `number` |  |
| `keyboardLargeStep` | `number` |  |
| `edges` | `ResizeEdge[]` |  |
| `disabled` | `boolean` |  |
| `dir` | `Direction` |  |
| `translations` | `Partial<ResizableTranslations>` |  |
| `onDimensionsChange` | `(details: ResizableDimensionsChangeDetails) => void` |  |
| `onDimensionsChangeEnd` | `(details: ResizableDimensionsChangeEndDetails) => void` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `dimensions-change` | `ResizableDimensionsChangeDetails` |
| `dimensions-change-end` | `ResizableDimensionsChangeEndDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhResizableHandle` | `default` | — |
| `XhResizableRoot` | `default` | `ResizableRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhResizableHandle` | `edge` | `ResizeEdge` | Yes |
| `XhResizableRoot` | `children` | `SlotChildren<ResizableRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle` · `resizing`

**Events**: `RESIZE.START` · `RESIZE.MOVE` · `RESIZE.END` · `RESIZE.CANCEL` · `RESIZE.NUDGE` · `RESIZE.TO_BOUND` · `DIMENSIONS.SET`

**Guards**: `canResize`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `dimensions` | `ResizableDimensions` |
| `offset` | `ResizableOffset` |
| `resizing` | `boolean` |
| `activeEdge` | `ResizeEdge \| null` |
| `disabled` | `boolean` |
| `edgeEnabled` | `(edge: ResizeEdge) => boolean` |
| `setDimensions` | `(dimensions: ResizableDimensions) => void` |
| `getRootProps` | `() => T['element']` |
| `getHandleProps` | `(props: { edge: ResizeEdge }) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowRight` / `ArrowDown` | `resizable.kbd.push` |
| `ArrowLeft` / `ArrowUp` | `resizable.kbd.pull` |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+ArrowUp` / `Shift+ArrowDown` | `resizable.kbd.large` |
| `Home` | `resizable.kbd.min` |
| `End` | `resizable.kbd.max` |
| `Escape` | `resizable.kbd.cancel` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | translations.root |
| `root` | `role` | 'group' |
| `handle` | `aria-disabled` | 'false' \| 'true' |
| `handle` | `aria-label` | translations.handle(edge) |
| `handle` | `aria-orientation` | 'horizontal' \| 'vertical' |
| `handle` | `aria-valuenow` | Math.round(edge === 'n' \|\| edge === 's' ? dimensions.… |
| `handle` | `role` | 'separator' |

## Style reference

### Skin

`@xihan-ui/styles/resizable.css` is written against `[data-scope="resizable"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-resizable` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-edge` | context.get('activeEdge') |
| `root` | `data-resizing` | '' (present only while the condition holds) |
| `handle` | `data-disabled` | '' (present only while the condition holds) |
| `handle` | `data-edge` | edge |
| `handle` | `data-resizing` | '' (present only while the condition holds) |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-resizable-corner` | `handle` | `block-size`<br>`inline-size` | `edge=ne`<br>`edge=nw`<br>`edge=se`<br>`edge=sw` | `--xh-space-4` |
| `--xh-resizable-corner-inset` | `handle` | `inset-block-end`<br>`inset-block-start`<br>`inset-inline-end`<br>`inset-inline-start` | `edge=ne`<br>`edge=nw`<br>`edge=se`<br>`edge=sw` | `0` |
| `--xh-resizable-grip` | `handle` | `block-size`<br>`inline-size`<br>`inset-block`<br>`inset-inline` | `edge=e`<br>`edge=n`<br>`edge=s`<br>`edge=w` | `--xh-space-2` |
| `--xh-resizable-handle-bg` | `handle` | `background`<br>`border` | `default`<br>`edge=ne`<br>`edge=nw`<br>`edge=se`<br>`edge=sw`<br>`is([data-edge='ne'], [data-edge='nw'], [data-edge='se'], [data-edge='sw'])` | `--xh-fg-default` |
| `--xh-resizable-handle-bg-active` | `handle` | `background`<br>`border` | `edge=ne`<br>`edge=nw`<br>`edge=se`<br>`edge=sw`<br>`is([data-edge='ne'], [data-edge='nw'], [data-edge='se'], [data-edge='sw'])`<br>`resizing` | `--xh-bg-brand` |
| `--xh-resizable-handle-bg-hover` | `handle` | `background`<br>`border` | `edge=ne`<br>`edge=nw`<br>`edge=se`<br>`edge=sw`<br>`hover`<br>`is([data-edge='ne'], [data-edge='nw'], [data-edge='se'], [data-edge='sw'])` | `--xh-fg-default` |
| `--xh-resizable-handle-radius` | `handle` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-resizable-indicator-inset` | `handle` | `inset-block-end`<br>`inset-block-start`<br>`inset-inline-end`<br>`inset-inline-start` | `edge=e`<br>`edge=n`<br>`edge=s`<br>`edge=w` | `0` |
| `--xh-resizable-indicator-length` | `handle` | `block-size`<br>`inline-size` | `edge=e`<br>`edge=n`<br>`edge=s`<br>`edge=w`<br>`is([data-edge='e'], [data-edge='w'])`<br>`is([data-edge='n'], [data-edge='s'])` | `--xh-space-8` |
| `--xh-resizable-indicator-thickness` | `handle` | `block-size`<br>`border-block-end-width`<br>`border-block-start-width`<br>`border-inline-end-width`<br>`border-inline-start-width`<br>`inline-size` | `edge=e`<br>`edge=n`<br>`edge=ne`<br>`edge=nw`<br>`edge=s`<br>`edge=se`<br>`edge=sw`<br>`edge=w`<br>`is([data-edge='e'], [data-edge='w'])`<br>`is([data-edge='n'], [data-edge='s'])` | `--xh-stroke-strong` |
