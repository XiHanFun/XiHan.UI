---
'@xihan-ui/core': minor
'@xihan-ui/headless': major
---

快捷键工具移到 core 的新子入口 `@xihan-ui/core/hotkey`：`formatHotkey`、`matchesHotkey`、`detectKbdPlatform`、`resolveKbdPlatform` 与类型 `KbdPlatform`、`KbdResolvedPlatform`、`HotkeySegment` 从 `@xihan-ui/headless` 移过去，headless 不再导出它们，改从 `@xihan-ui/core/hotkey` 引入。子入口另有键名表的查法 `keyText` / `KeyTextTable`、英文键名与键帽字 `HOTKEY_TEXT_EN_US` 与类型 `HotkeyText`。`matchesHotkey` 只读按键的 `key`、`code` 与四个修饰键（类型 `HotkeyEvent`），不要求是 `KeyboardEvent`。
