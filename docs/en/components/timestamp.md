# Timestamp

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/timestamp).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/timestamp" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/timestamp.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/timestamp" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/timestamp" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/timestamp.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="timestamp"`: **`root`**

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-timestamp>` |
| Vue components | `XhTimestamp` |
| State machine | `timestampMachine` |
| Skin | `@xihan-ui/styles/timestamp.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `format` | `string` |  |
| `locale` | `string` |  |
| `now` | `TimestampValue` |  |
| `refreshInterval` | `number` |  |
| `timeZone` | `string` |  |
| `translations` | `Partial<TimestampTranslations>` |  |
| `type` | `TimestampType` |  |
| `value` | `TimestampValue` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `root` | 'empty' |

The following names are internal to the state machine.

**States**: `idle` · `live`

**Events**: `REFRESH.SYNC` · `TICK`

**Guards**: `shouldRefresh`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `date` | `Date \| undefined` |
| `text` | `string` |
| `stamp` | `string \| undefined` |
| `state` | `TimestampState` |
| `relative` | `boolean` |
| `refreshing` | `boolean` |
| `getRootProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/timestamp.css` is written against `[data-scope="timestamp"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-timestamp` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-format` | props.type |
| `root` | `data-relative` | '' (present only while the condition holds) |
| `root` | `data-state` | 'empty' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-timestamp-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-timestamp-placeholder-fg` | `root` | `color` | `state=empty`<br>`state=invalid` | `--xh-fg-muted` |
