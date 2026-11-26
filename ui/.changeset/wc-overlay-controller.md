---
'@xihan-ui/web-components': patch
---

**变更** 浮层元素各写一份的运行时配置、消隐层登记、退场闸门与断开时的结清收进内部的 `OverlayController`，与 Vue / React 的 `useOverlay` 同一套，26 个元素改用它，公开 API 与行为不变；滚动锁统一按全局配置的 `scrollRoot` 找真正在滚的那层（原先只有模态的几个浮层传了它，其余浮层不加滚动锁，不受影响）。清单（`custom-elements.json`）里随之少了各元素的私有字段 `config`、`exit` 与私有方法 `ensureConfig`、`ensureExit`、`registerLayer`。
