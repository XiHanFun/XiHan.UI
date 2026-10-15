---
'@xihan-ui/expression': minor
---

`formatValue` 新增数字字形格式 `{ kind: 'numeral', style }`，只接受整数。

- `roman-upper` / `roman-lower`：罗马数字，取值 1 至 3999，例如 `1994` 得 `MCMXCIV`。
- `cn-lower` / `cn-upper`：中文小写 / 大写数字，零的写法与人民币大写相同。小写以「一十」开头时省去「一」，例如 `15` 得 `十五`、`100000` 得 `十万`；大写保留，得 `壹拾伍`、`壹拾万`。`0` 得 `零`，负数前加「负」，绝对值须小于一亿亿。
- 小数报 `XH_EXPR_FORMAT_INVALID_VALUE`；超出范围报 `XH_EXPR_FORMAT_OUT_OF_RANGE`；`style` 不认识报 `XH_EXPR_FORMAT_INVALID_SPEC`。

新增类型 `NumeralFormatSpec` 与 `NumeralStyle`，`FormatSpec` 联合随之扩大：对 `FormatSpec` 做穷尽分支的代码需要补上 `numeral`。
