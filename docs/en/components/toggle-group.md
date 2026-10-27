# ToggleGroup

General component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/toggle-group).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toggle-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toggle-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toggle-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toggle-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toggle-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="toggle-group"`: **`root`** · `item` · `hidden-input`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-toggle-group>` |
| Vue components | `XhToggleGroupHiddenInput` `XhToggleGroupItem` `XhToggleGroupRoot` |
| Composable | `useToggleGroup` |
| State machine | `toggleGroupMachine` |
| Skin | `@xihan-ui/styles/toggle-group.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `collection` | `ToggleGroupNode<V>[]` |  |
| `valueKey` | `SelectionValueKey<V>` |  |
| `value` | `ToggleGroupValue<V>` |  |
| `defaultValue` | `ToggleGroupValue<V>` |  |
| `multiple` | `boolean` |  |
| `ariaLabel` | `string` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `disallowEmpty` | `boolean` |  |
| `variant` | `ActionVariant` |  |
| `tone` | `Tone` |  |
| `size` | `Size` |  |
| `fullWidth` | `boolean` |  |
| `separators` | `boolean` |  |
| `name` | `string` |  |
| `orientation` | `Orientation` |  |
| `dir` | `Direction` |  |
| `loop` | `boolean` |  |
| `rovingFocus` | `boolean` |  |
| `onValueChange` | `(details: ToggleGroupValueChangeDetails<V>) => void` |  |

### ToggleGroupNode

Elements of `collection`.

| Field | Type | Required |
| --- | --- | --- |
| `value` | `V` | Yes |
| `label` | `string` |  |
| `disabled` | `boolean` |  |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `value-change` | `ToggleGroupValueChangeDetails` |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhToggleGroupItem` | `value` | `unknown` | Yes |
| `XhToggleGroupItem` | `disabled` | `boolean` |  |
| `XhToggleGroupRoot` | `renderItem` | `(node: ToggleGroupNodeMeta<V>) => ReactNode` |  |
| `XhToggleGroupRoot` | `children` | `ReactNode` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `item` | 'on' \| 'off' |

The following names are internal to the state machine.

**States**: `idle`

**Events**: `VALUE.SET` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `GROUP.BLUR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**Guards**: `canPress` · `canToggle`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `value` | `V[]` |
| `collection` | `readonly ToggleGroupNodeMeta<V>[]` |
| `focusedValue` | `V \| null` |
| `multiple` | `boolean` |
| `disabled` | `boolean` |
| `readOnly` | `boolean` |
| `invalid` | `boolean` |
| `required` | `boolean` |
| `orientation` | `Orientation` |
| `separators` | `boolean` |
| `isSelected` | `(value: V) => boolean` |
| `setValue` | `(next: ToggleGroupValue<V>) => void` |
| `getRootProps` | `() => T['element']` |
| `getItemProps` | `(props: ToggleGroupItemProps<V>) => T['button']` |
| `getHiddenInputProps` | `() => T['input']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | `toggle-group.kbd.tab` |
| `ArrowRight` / `ArrowDown` | `toggle-group.kbd.next` |
| `ArrowLeft` / `ArrowUp` | `toggle-group.kbd.prev` |
| `Home` | `toggle-group.kbd.first` |
| `End` | `toggle-group.kbd.last` |
| `Enter` / `Space` | `toggle-group.kbd.toggle` |
| `Enter` / `Space` | `toggle-group.kbd.press` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-invalid` | undefined \| 'true' \| 'false' |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `aria-orientation` | undefined \| props.orientation |
| `root` | `aria-readonly` | undefined \| 'true' \| 'false' |
| `root` | `aria-required` | undefined \| 'true' \| 'false' |
| `root` | `role` | 'group' \| 'radiogroup' |
| `item` | `aria-checked` | undefined \| 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-pressed` | 'true' \| 'false' \| undefined |
| `item` | `role` | undefined \| 'radio' |
| `hidden-input` | `aria-hidden` | 'true' |

## Style reference

### Skin

`@xihan-ui/styles/toggle-group.css` is written against `[data-scope="toggle-group"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-toggle-group` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-disabled` | '' (present only while the condition holds) |
| `root` | `data-full-width` | '' (present only while the condition holds) |
| `root` | `data-invalid` | '' (present only while the condition holds) |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | '' (present only while the condition holds) |
| `root` | `data-required` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `item` | `data-disabled` | '' (present only while the condition holds) |
| `item` | `data-invalid` | '' (present only while the condition holds) |
| `item` | `data-pressed` | '' (present only while the condition holds) |
| `item` | `data-readonly` | '' (present only while the condition holds) |
| `item` | `data-state` | 'on' \| 'off' |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'text' |
| `item` | `data-xh-action-size` | props.size |
| `item` | `data-xh-action-variant` | props.variant |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-toggle-group-border-invalid` | `root` | `border` | `invalid` | `--xh-border-invalid` |
| `--xh-toggle-group-item-bg` | `item` | `--xh-ink-surface`<br>`background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`xh-ink-surface` | `--xh-_toggle-group-item-bg` |
| `--xh-toggle-group-item-bg-active` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_toggle-group-item-bg-active` |
| `--xh-toggle-group-item-bg-disabled` | `item` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-bg-muted` |
| `--xh-toggle-group-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_toggle-group-item-bg-hover` |
| `--xh-toggle-group-item-bg-on` | `item` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`readonly`<br>`state=on`<br>`xh-ink-surface` | `--xh-_toggle-group-item-bg-on` |
| `--xh-toggle-group-item-bg-on-active` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-_toggle-group-item-bg-on-active` |
| `--xh-toggle-group-item-bg-on-disabled` | `item` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`state=on`<br>`xh-ink-surface` | `--xh-_toggle-group-item-bg-on` |
| `--xh-toggle-group-item-bg-on-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=on` | `--xh-_toggle-group-item-bg-on-hover` |
| `--xh-toggle-group-item-border` | `item` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_toggle-group-item-border` |
| `--xh-toggle-group-item-border-disabled` | `item` | `border-color` | `disabled` | `--xh-border-subtle` |
| `--xh-toggle-group-item-border-on` | `item` | `border`<br>`border-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-_toggle-group-item-border-on` |
| `--xh-toggle-group-item-border-on-disabled` | `item` | `border-color` | `disabled`<br>`state=on` | `--xh-_toggle-group-item-border-on` |
| `--xh-toggle-group-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_toggle-group-item-fg` |
| `--xh-toggle-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-toggle-group-item-fg-on` | `item` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-_toggle-group-item-fg-on` |
| `--xh-toggle-group-item-fg-on-disabled` | `item` | `color` | `disabled`<br>`state=on` | `--xh-_toggle-group-item-fg-on` |
| `--xh-toggle-group-item-font-size` | `item` | `font-size` | `default` | `--xh-_toggle-group-font-size` |
| `--xh-toggle-group-item-font-weight` | `item` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-toggle-group-item-gap` | `item` | `gap` | `default` | `--xh-_toggle-group-gap` |
| `--xh-toggle-group-item-h` | `item` | `block-size` | `default` | `--xh-_toggle-group-h` |
| `--xh-toggle-group-item-px` | `item` | `padding-inline` | `default` | `--xh-_toggle-group-px` |
| `--xh-toggle-group-item-radius` | `item`<br>`root` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `first-child`<br>`first-of-type`<br>`invalid`<br>`last-child`<br>`last-of-type`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`variant=outline` | `--xh-shape-control` |
| `--xh-toggle-group-item-shadow` | `item` | `box-shadow` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:hover, [data-loading])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-_toggle-group-item-highlight-on` |
| `--xh-toggle-group-outline-color` | `root` | `border` | `variant=outline` | `--xh-_tone-border-control` |
| `--xh-toggle-group-separator-color` | `root` | `background` | `xh-toggle-group-separator` | `--xh-fg-default` |
| `--xh-toggle-group-separator-color-disabled` | `root` | `background` | `disabled`<br>`xh-toggle-group-separator` | `--xh-border-subtle` |
| `--xh-toggle-group-separator-opacity` | `root` | `opacity` | `xh-toggle-group-separator` | `--xh-control-separator-opacity` |
| `--xh-toggle-group-separator-opacity-disabled` | `root` | `opacity` | `disabled`<br>`xh-toggle-group-separator` | `--xh-control-separator-disabled-opacity` |
| `--xh-toggle-group-separator-radius` | `root` | `border-radius` | `xh-toggle-group-separator` | `--xh-shape-pill` |
| `--xh-toggle-group-separator-size` | `root` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical`<br>`xh-toggle-group-separator` | `--xh-_group-separator-size` |
| `--xh-toggle-group-separator-thickness` | `root` | `block-size`<br>`inline-size`<br>`margin-block-start`<br>`margin-inline-start` | `orientation=horizontal`<br>`orientation=vertical`<br>`xh-toggle-group-separator` | `--xh-stroke-thin` |
