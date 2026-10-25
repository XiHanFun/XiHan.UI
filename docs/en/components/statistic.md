# Statistic

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/statistic).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/statistic" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/statistic.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/statistic" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/statistic" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/statistic.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="statistic"`: **`root`** · `label` · `value` · `prefix` · `suffix` · `trend`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-statistic>` |
| Vue components | `XhStatisticLabel` `XhStatisticPrefix` `XhStatisticRoot` `XhStatisticSuffix` `XhStatisticTrend` `XhStatisticValue` |
| State machine | None: `connect` computes attributes from props directly |
| Skin | `@xihan-ui/styles/statistic.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `size` | `Size` |  |
| `tone` | `Tone` |  |
| `trend` | `StatisticTrend` |  |

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `trend` | `StatisticTrend` |
| `getRootProps` | `() => T['element']` |
| `getLabelProps` | `() => T['element']` |
| `getValueProps` | `() => T['element']` |
| `getPrefixProps` | `() => T['element']` |
| `getSuffixProps` | `() => T['element']` |
| `getTrendProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

No keyboard interaction: the component takes no focus, or focus behavior comes entirely from native elements.

## Style reference

### Skin

`@xihan-ui/styles/statistic.css` is written against `[data-scope="statistic"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-statistic` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `trend` | `data-direction` | props.trend |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-statistic-affix-fg` | `prefix`<br>`suffix` | `color` | `default` | `--xh-_tone-fg` |
| `--xh-statistic-affix-font-size` | `prefix`<br>`suffix` | `font-size` | `default` | `--xh-_statistic-affix-size` |
| `--xh-statistic-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-statistic-gap` | `root` | `column-gap` | `default` | `--xh-space-0` |
| `--xh-statistic-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_statistic-icon-size` |
| `--xh-statistic-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` |
| `--xh-statistic-label-font-size` | `label` | `font-size` | `default` | `--xh-_statistic-label-size` |
| `--xh-statistic-row-gap` | `root` | `row-gap` | `default` | `--xh-_statistic-row-gap` |
| `--xh-statistic-trend-fg` | `trend` | `color` | `default` | `--xh-_tone-fg` |
| `--xh-statistic-trend-font-size` | `trend` | `font-size` | `default` | `--xh-_statistic-affix-size` |
| `--xh-statistic-trend-gap` | `trend` | `gap` | `default` | `--xh-space-0_5` |
| `--xh-statistic-trend-offset` | `trend` | `margin-inline-start` | `default` | `--xh-space-2` |
| `--xh-statistic-value-fg` | `value` | `color` | `default` | `--xh-_tone-fg` |
| `--xh-statistic-value-font-size` | `value` | `font-size` | `default` | `--xh-_statistic-value-size` |
