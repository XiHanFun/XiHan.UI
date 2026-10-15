---
'@xihan-ui/expression': minor
---

`@xihan-ui/expression` 新增依赖排序：对计算字段、联动赋值这类一组「名字 = 表达式」，按相互引用排出求值顺序，并检查循环引用。

- `planExpressions(engine, entries, { identifiers? })`：编译每个条目，按相互引用排序，被引用的排在前面。有问题时一次报出全部，不给步骤，问题分三类：
  - 条目编译不通过：带条目名、问题码与源码区间。给了 `identifiers` 时，引用未知名字也算这一类。
  - 两个条目同名：`XH_EXPR_DUPLICATE_NAME`。
  - 循环引用：`XH_EXPR_CYCLE`，按引用顺序列出环上的名字。
- `checkExpressions(engine, entries, options?)`：只返回问题，供保存模板时校验。
- `evaluatePlan(steps, scope)`：按步骤依次求值。每一步可以引用 `scope` 和此前各步的结果；遇到求值失败即停，返回失败的条目和问题。不抛异常，也不修改 `scope`。
