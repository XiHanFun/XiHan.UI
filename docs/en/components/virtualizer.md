# Virtualizer

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/virtualizer).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/virtualizer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/virtualizer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/virtualizer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/virtualizer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/virtualizer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="virtualizer"`: **`root`** · **`viewport`** · **`content`** · `item`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-virtualizer>` |
| Vue components | `XhVirtualizerContent` `XhVirtualizerItem` `XhVirtualizerRoot` `XhVirtualizerViewport` |
| Composable | `useVirtualizer` |
| State machine | `virtualizerMachine` |
| Skin | `@xihan-ui/styles/virtualizer.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `count` | `number` |  |
| `estimateSize` | `number \| ((index: number) => number)` |  |
| `overscan` | `number` |  |
| `horizontal` | `boolean` |  |
| `gap` | `number` |  |
| `getItemKey` | `(index: number) => string \| number` |  |
| `onRangeChange` | `(details: VirtualizerRangeChangeDetails) => void` |  |
| `scrollMargin` | `number` |  |
| `paddingStart` | `number` |  |
| `paddingEnd` | `number` |  |
| `lanes` | `number` |  |
| `viewportTabIndex` | `number` |  |
| `scrollContainer` | `VirtualizerScrollContainer` |  |
| `anchor` | `VirtualizerAnchor` |  |
| `stickyIndices` | `number[]` |  |
| `estimateFromMeasured` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `range-change` | `VirtualizerRangeChangeDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhVirtualizerRoot` | `default` | `VirtualizerRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhVirtualizerItem` | `value` | `number \| string` | Yes |
| `XhVirtualizerItem` | `measure` | `boolean` |  |
| `XhVirtualizerRoot` | `children` | `SlotChildren<VirtualizerRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle` · `scrolling`

**Events**: `SCROLL.START` · `SCROLL.END` · `MEASURE`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `virtualItems` | `readonly VirtualizerItemState[]` |
| `totalSize` | `number` |
| `startIndex` | `number \| null` |
| `endIndex` | `number \| null` |
| `horizontal` | `boolean` |
| `lanes` | `number` |
| `scrolling` | `boolean` |
| `collectionVirtualizer` | `CollectionVirtualizer` |
| `scrollToIndex` | `(index: number, options?: VirtualizerScrollToOptions) => void` |
| `measureElement` | `(element: HTMLElement \| null) => void` |
| `measure` | `() => void` |
| `registerItemElement` | `(index: number, element: HTMLElement \| null) => void` |
| `getRootProps` | `() => T['element']` |
| `getViewportProps` | `() => T['element']` |
| `getContentProps` | `() => T['element']` |
| `getItemProps` | `(props: VirtualizerItemProps) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/virtualizer.css` is written against `[data-scope="virtualizer"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-virtualizer` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-orientation` | 'horizontal' \| 'vertical' |
| `root` | `data-scroll-container` | undefined \| props.scrollContainer |
| `root` | `data-scrolling` | '' (present only while the condition holds) |
| `viewport` | `data-anchor` | 'end' \| undefined |
| `viewport` | `data-orientation` | 'horizontal' \| 'vertical' |
| `viewport` | `data-scroll-container` | undefined \| props.scrollContainer |
| `content` | `data-orientation` | 'horizontal' \| 'vertical' |
| `item` | `data-fixed` | '' (present only while the condition holds) |
| `item` | `data-index` | props.index |
| `item` | `data-lane` | item.lane \| undefined |
| `item` | `data-orientation` | 'horizontal' \| 'vertical' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-virtualizer-sticky-bg` | `item` | `background` | `fixed` | `--xh-bg-surface` |
| `--xh-virtualizer-sticky-layer` | `item` | `z-index` | `fixed` | `--xh-layer-sticky` |
