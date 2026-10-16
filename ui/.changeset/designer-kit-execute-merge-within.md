---
'@xihan-ui/designer-kit': minor
---

历史栈的 `execute` 选项新增 `mergeWithin`：单次执行可以带自己的合并时限，缺省仍取 `createHistory` 的 `mergeWithin`。属性面板的输入传 `Infinity`，不论停顿多久都并成一步、只等失焦时 `seal()` 封口；同一个历史里的方向键微移照旧按历史的时限合并。传入负数或 NaN 时抛 `RangeError`，文档与两个栈都不变。
