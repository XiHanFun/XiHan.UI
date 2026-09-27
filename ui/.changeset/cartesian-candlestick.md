---
"@xihan-ui/core": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

`cartesian-chart` 新增 K 线系列 `mark: 'candlestick'`。

- `open` / `high` / `low` / `close` 四个字段，系列 `id` 缺省取收盘字段；自变量轴缺省是类目轴，数值轴盖住最低与最高价、不强制含 0。
- `style` 缺省 `candle`：新部件 `wick`（影线，最低到最高）与 `candle`（实体，开盘到收盘，十字星至少一像素高）；`ohlc` 是美国线，整根线就是 `candle`。标记上写 `data-trend="rise|fall"` 与 `data-style="candle|ohlc"`，取涨跌色；强制色下涨空心、跌实心。
- 实体是可聚焦的数据标记：可及名与提示框按新文案 `ohlcLabel` 写出四个价，数据表开高低收各一列（列名 `ohlcColumns`），锚点落在收盘价。
- 诊断码新增 `chart.ohlc-range`：最低价高于开盘或收盘、最高价低于开盘或收盘。
