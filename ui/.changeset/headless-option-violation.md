---
'@xihan-ui/headless': minor
---

`@xihan-ui/headless` 新增 `findOptionViolation(collection, options?)`。选项来自模板或宿主数据时，用它先校验结构。它返回第一处问题的 `{ pointer, code }`，`pointer` 是 JSON Pointer；没有问题时返回 `undefined`。

- 节点形状与选择、单选组、复选组、组合框、树选择、级联吃的一致：`{ value: string, label?, disabled?, tone?, description? }`。选项树还可以带 `children` 和 `hasChildren`。
- 选项：
  - `tree`：允许出现 `children` 与 `hasChildren`。
  - `unique`：`value` 不得重复的范围。缺省 `'level'`，即同一层内不重复；按值单选的树选择用 `'tree'`，即整棵树内不重复。
  - `maxDepth`：缺省 32。
  - `requireLabel`：要求每个选项都有 `label`。
  - `strict`：出现多余的键时报错。
- 问题码：`not-array`、`not-object`、`invalid-value`、`invalid-label`、`invalid-disabled`、`invalid-description`、`invalid-tone`、`invalid-has-children`、`unknown-key`、`duplicate-value`、`too-deep`。
