---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Scrollbar 与 ScrollArea 的显示时机从 `type` 改叫 `revealMode`，与它投影的 `data-reveal-mode` 同名：`type` 在 Button、TextField 里是原生含义，这里一名多义。取值不变（`auto`、`always`、`scroll`、`hover`、`scroll-hover`）。

| 旧名 | 新名 |
| --- | --- |
| `type`（WC attribute `type`） | `revealMode`（Vue 模板与 WC attribute `reveal-mode`） |
| `api.type` | `api.revealMode` |
| 类型 `ScrollbarType` | `ScrollbarRevealMode` |
| 常量 `SCROLLBAR_DEFAULT_TYPE` | `SCROLLBAR_DEFAULT_REVEAL_MODE` |
