---
'@xihan-ui/core': minor
---

**新增** `@xihan-ui/core/hotkey` 的 `ariaKeyshortcut` 与 `parseAriaKeyshortcuts`：一组键与 `aria-keyshortcuts` 的规范写法互转。写出时修饰键用 `Alt` / `Control` / `Meta` / `Shift` 排在前面，`Mod` 按平台落成 `Meta`（macOS）或 `Control`，单个字母写大写，空格写 `Space`、加号写 `Plus`；读回来的键可以直接交给 `formatHotkey` 与 `matchesHotkey`。

**新增** `formatHotkeyLabel`：一组键显示成的一串字，macOS 上键帽字连写（⌘⇧Z），其余平台用 + 连（Ctrl+Shift+Z）；键帽字可以换一张表。
