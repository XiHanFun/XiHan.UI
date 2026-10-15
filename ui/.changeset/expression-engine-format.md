---
'@xihan-ui/expression': minor
---

`@xihan-ui/expression` 新增统一的表达式引擎与格式化，供打印、流程、表单、报表四款设计器共用。

- `createExpressionEngine({ builtins, functions, now, limits })` 返回 `ExpressionEngine`：`compile(source, { identifiers })` 成功时给出 `references`（引用的顶层变量名，按源码顺序去重，不含函数名）与 `evaluate(scope)`，失败时给出全部问题；`evaluate` 的结果是普通 JS 值（数字转 JS 数字、日期转规范文本），从不抛异常。`now` 可以是固定日期，也可以是每次求值时调用的函数。同一个引擎按源码缓存语法树。
- `formatValue(value, spec, { locale, timeZone })` 格式化数字（小数位、千分位、舍入方式）、百分比、日期（模式串加时区）与人民币大写（用「元」不用「圆」，如 `壹仟零壹元伍角`、`壹拾万元整`），数字一律按十进制精确舍入，`1.005` 保留两位得到 `1.01`。
