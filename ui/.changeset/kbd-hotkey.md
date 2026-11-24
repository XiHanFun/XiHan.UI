---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Kbd 的热键事件改成一词写法 `hotkey`，与 `@xihan-ui/core/hotkey` 的 `formatHotkey`、`matchesHotkey`、`HotkeySegment` 一致。

| 旧名 | 新名 |
| --- | --- |
| `onHotKey`（React / headless） | `onHotkey` |
| Vue `@hot-key` | `@hotkey` |
| Web Components 事件 `hot-key` | `hotkey` |
