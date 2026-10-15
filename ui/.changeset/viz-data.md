---
'@xihan-ui/viz': minor
---

新增表格数据处理函数，报表、表格汇总与列表筛选共用同一套缺失值与比较语义：

- `isMissing(value)`：`null`、`undefined`、`NaN` 与无效 Date 是缺失值；空字符串、0、false 不是。
- `compareMixed(a, b, { collate? })`：跨类型全序，boolean < number < Date < string < 其它，缺失值大于一切；字符串可传排序规则。
- `valueKey(value)` / `tupleKey(keys)`：分组、去重与 in 匹配用的身份编码；-0 与 0 同键，Date 按时刻，`'1'` 与 `1` 不同键。
- `createAccumulator(kind, { collate? })` / `aggregate(kind, values)`：按 `AGGREGATE_KINDS`（sum、avg、count、min、max、distinctCount）逐值聚合。sum / avg 与 `sum`、`mean` 结果相同；空集时 sum / avg / min / max 为 null，count / distinctCount 为 0；min / max 也可用于字符串与日期。
- `sortBy(items, keys, { collate? })`：多键稳定排序，每个键各有 `direction` 与 `nulls`（缺失值排最前或最后，与方向无关）。
- `compileFilter(tree, options)`：把 and / or 条件树编译成行谓词，运算符见 `FILTER_OPERATORS`。否定运算符（neq、notIn、notContains）匹配缺失值，操作数为空的条件不参与筛选；`read`、`operand`、`normalize` 可替换取值、操作数解析与比较前的换算。操作数形状不对时抛新错误码 `XH_VIZ_FILTER_OPERAND`。
