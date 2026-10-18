---
"@xihan-ui/core": minor
"@xihan-ui/headless": major
---

**调整** 选项与选项树的结构校验 `findOptionViolation` 挪到 `@xihan-ui/core` 的新子入口 `./options`。

- `@xihan-ui/core/options` 导出 `findOptionViolation` 与类型 `OptionViolation`、`OptionViolationCode`、`OptionViolationOptions`，用法与判定都不变。
- `@xihan-ui/headless` 不再导出这几个名字。升级时把 `import { findOptionViolation } from '@xihan-ui/headless'` 改成从 `@xihan-ui/core/options` 引入。
