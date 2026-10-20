---
"@xihan-ui/core": minor
"@xihan-ui/headless": minor
---

**新增** `@xihan-ui/core` 子入口 `./options`：选项与选项树的结构校验 `findOptionViolation` 与类型 `OptionViolation`、`OptionViolationCode`、`OptionViolationOptions`。这几个名字本周期先加在 `@xihan-ui/headless`，发版前挪到 core，headless 不再导出（4.2.0 没有发过它们，没有要迁移的写法）。
