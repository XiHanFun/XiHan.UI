# Splitter

Layout component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/splitter).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/splitter" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/splitter.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/splitter" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/splitter" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/splitter.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="splitter"`: **`root`** · **`panel`** · **`resize-trigger`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-splitter>` |
| Vue components | `XhSplitterPanel` `XhSplitterResizeTrigger` `XhSplitterRoot` |
| Composable | `useSplitter` |
| State machine | `splitterMachine` |
| Skin | `@xihan-ui/styles/splitter.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `sizes` | `number[]` |  |
| `defaultSizes` | `number[]` |  |
| `panels` | `SplitterPanelProps[]` |  |
| `orientation` | `Orientation` |  |
| `dir` | `Direction` |  |
| `disabled` | `boolean` |  |
| `step` | `number` |  |
| `largeStep` | `number` |  |
| `translations` | `Partial<SplitterTranslations>` |  |
| `onSizesChange` | `(details: SplitterSizesChangeDetails) => void` |  |
| `onSizesChangeEnd` | `(details: SplitterSizesChangeEndDetails) => void` |  |

### SplitterPanelProps

Elements of `panels`.

| Field | Type | Required |
| --- | --- | --- |
| `id` | `string` | Yes |
| `min` | `number` |  |
| `max` | `number` |  |
| `collapsible` | `boolean` |  |
| `collapsedSize` | `number` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `sizes-change` | `SplitterSizesChangeDetails` |
| `sizes-change-end` | `SplitterSizesChangeEndDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhSplitterRoot` | `default` | `SplitterRootSlotProps` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhSplitterPanel` | `index` | `number \| string` |  |
| `XhSplitterResizeTrigger` | `index` | `number \| string` |  |
| `XhSplitterRoot` | `children` | `SlotChildren<SplitterRootSlotProps>` |  |

### State

The following names are internal to the state machine.

**States**: `idle` · `dragging`

**Events**: `SIZES.SET` · `BOUNDARY.STEP` · `BOUNDARY.TO_MIN` · `BOUNDARY.TO_MAX` · `BOUNDARY.SET` · `BOUNDARY.FOCUS` · `PANEL.COLLAPSE` · `PANEL.EXPAND` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `DRAG.CANCEL` · `ANIMATION.END`

**Guards**: `canResize`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `sizes` | `number[]` |
| `panels` | `SplitterPanelState[]` |
| `dragging` | `boolean` |
| `disabled` | `boolean` |
| `setSizes` | `(next: number[]) => void` |
| `setPanelSize` | `(index: number, next: number) => void` |
| `collapsePanel` | `(index: number) => void` |
| `expandPanel` | `(index: number) => void` |
| `togglePanel` | `(index: number) => void` |
| `getRootProps` | `() => T['element']` |
| `getPanelProps` | `(index: number) => T['element']` |
| `getResizeTriggerProps` | `(index: number) => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `ArrowRight` / `ArrowDown` | `splitter.kbd.grow` |
| `ArrowLeft` / `ArrowUp` | `splitter.kbd.shrink` |
| `Shift+ArrowRight` / `Shift+ArrowDown` | `splitter.kbd.large-grow` |
| `Shift+ArrowLeft` / `Shift+ArrowUp` | `splitter.kbd.large-shrink` |
| `Home` | `splitter.kbd.min` |
| `End` | `splitter.kbd.max` |
| `Escape` | `splitter.kbd.cancel` |
| `Enter` | `splitter.kbd.toggle` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-label` | translations.root |
| `root` | `role` | 'group' |
| `resize-trigger` | `aria-controls` | id of the `panel` part |
| `resize-trigger` | `aria-disabled` | 'true' \| 'false' |
| `resize-trigger` | `aria-label` | translations.resizeTrigger(boundary, Math.max(0, last… |
| `resize-trigger` | `aria-orientation` | 'horizontal' \| 'vertical' |
| `resize-trigger` | `aria-valuemax` | String(panel.max) |
| `resize-trigger` | `aria-valuemin` | String(panel.min) |
| `resize-trigger` | `aria-valuenow` | String(panel.size) |
| `resize-trigger` | `role` | 'separator' |

## Style reference

### Skin

`@xihan-ui/styles/splitter.css` is written against `[data-scope="splitter"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-splitter` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-animating` | '' (present only while the condition holds) |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-dragging` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `panel` | `data-collapsed` | '' (present only while the condition holds) |
| `panel` | `data-disabled` | '' (present only while the condition holds) |
| `panel` | `data-dragging` | '' (present only while the condition holds) |
| `panel` | `data-index` | String(panel.index) |
| `panel` | `data-orientation` | props.orientation |
| `resize-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `resize-trigger` | `data-dragging` | '' (present only while the condition holds) |
| `resize-trigger` | `data-index` | String(boundary) |
| `resize-trigger` | `data-orientation` | props.orientation |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-splitter-disabled-opacity` | `root` | `opacity` | `disabled` | `0.6` |
| `--xh-splitter-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` |
| `--xh-splitter-trigger-bg` | `resize-trigger` | `background` | `default` | `--xh-border-default` |
| `--xh-splitter-trigger-bg-disabled` | `resize-trigger` | `background` | `disabled` | `--xh-border-subtle` |
| `--xh-splitter-trigger-bg-dragging` | `resize-trigger` | `background` | `dragging` | `--xh-bg-brand` |
| `--xh-splitter-trigger-bg-hover` | `resize-trigger` | `background` | `hover` | `--xh-border-control` |
| `--xh-splitter-trigger-thickness` | `resize-trigger` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1` |
