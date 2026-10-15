---
'@xihan-ui/expression': minor
---

`@xihan-ui/expression` 新增 `evaluateSource` 与 `conditionOf`，这是表达式以源码字符串保存的宿主在求值处都要做的两步。

- `evaluateSource(engine, source, scope, cache?)`：编译后求值。编译失败时，以第一条问题作为求值失败返回，结果形状与引擎的 `evaluate` 相同。传入 `cache`（一个 `Map`）时，同一段源码只编译一次。`ExpressionEngine` 接口不变。
- `conditionOf(evaluation)`：把求值结果解释成条件。`true` 成立，`false` 与 `null` 不成立；其余结果为 `'not-boolean'`，求值失败为 `'failed'`。打印、流程、表单、报表四款设计器的条件位置都按这一条判定。
