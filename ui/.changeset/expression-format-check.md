---
'@xihan-ui/expression': minor
---

`@xihan-ui/expression` 新增 `checkFormatSpec`，在保存模板时就能报出 `formatValue` 会拒绝的格式说明，不必等到格式化时抛错。同时导出格式说明的常量。

- `checkFormatSpec(spec, { kinds? })` 不抛异常，返回全部问题 `{ code, path }[]`，`path` 是出问题那一项的键路径。问题码：
  - `XH_EXPR_FORMAT_INVALID_SPEC`：不是普通对象。
  - `XH_EXPR_FORMAT_INVALID_KIND`：种类缺失、不认识，或不在 `kinds` 里。
  - `XH_EXPR_FORMAT_INVALID_OPTION`：取值不合法，或必填项缺失。
  - `XH_EXPR_FORMAT_CONFLICT`：`decimals` 与 `minDecimals` / `maxDecimals` 同时给出，或 `minDecimals` 大于 `maxDecimals`。
  - `XH_EXPR_FORMAT_UNKNOWN_KEY`：该种类没有这个键。`formatValue` 本身不理会多余的键。
- `kinds` 用于只收数字的位置，例如图表数值传 `['number', 'percent']`。
- 常量：`FORMAT_KINDS`、`FORMAT_ROUNDINGS`（第一个是缺省）、`FORMAT_DECIMALS_LIMIT`（34）、`NUMERAL_STYLES`，供属性面板列选项。
