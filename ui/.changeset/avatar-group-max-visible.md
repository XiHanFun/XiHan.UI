---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** AvatarGroup 的展示上限从 `max` 改叫 `maxVisible`，与 Notification 的 `maxVisible` 同名；根上照旧写 `data-max`，裁剪与计数仍由作者完成。

| 旧名 | 新名 |
| --- | --- |
| `max`（WC attribute `max`） | `maxVisible`（Vue 模板与 WC attribute `max-visible`） |
