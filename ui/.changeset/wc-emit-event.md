---
'@xihan-ui/web-components': minor
---

**新增** `emitEvent` 的 `detail` 可以不给（派发出的 `detail` 为 `null`），另加 `bubbles` 选项：缺省冒泡并穿过 shadow 边界，与原生事件同名、冒泡会被祖先误认的事件（如 `submit`）传 `false`。

**变更** 库内元素派发事件全部改经 `emitEvent`，事件名、`detail` 与冒泡语义不变。清单（`custom-elements.json`）里 11 个原先标成笼统 `CustomEvent` 的事件补上了真实的 detail 类型（如 `xh-dialog` 的 `confirm-error` 为 `DialogConfirmErrorDetails`、`xh-scrollbar` 的 `scroll-start` 为 `ScrollbarScrollDetails`），9 个不带 detail 的事件不再标类型。
