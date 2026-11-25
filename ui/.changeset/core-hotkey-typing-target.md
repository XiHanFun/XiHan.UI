---
'@xihan-ui/core': minor
'@xihan-ui/headless': major
---

**破坏性** `isTypingTarget`（按键落点是不是正在打字的地方）从 `@xihan-ui/headless` 挪到 `@xihan-ui/core/hotkey`，与 `matchesHotkey`、`formatHotkey` 同一个子入口：自己装快捷键监听时这几个总是一起用，不必为了它再引 headless。判据不变。

| 旧写法 | 新写法 |
| --- | --- |
| `import { isTypingTarget } from '@xihan-ui/headless'` | `import { isTypingTarget } from '@xihan-ui/core/hotkey'` |
