---
'@xihan-ui/headless': major
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Spinner 新增 `delay`（毫秒，默认 0）：挂载后等够时长才露面，请求在这之前回来、转圈被卸掉时它从头到尾不出现。等待期间 root 投影 `data-state="hidden"`，皮肤以 `visibility: hidden` 藏起整块并保留位置、读屏读不到；露面后为 `data-state="visible"`，不再回到等待，等待途中把 `delay` 改成 0 即刻露面。

破坏性（Headless）：Spinner 改由状态机驱动，新增 `spinnerMachine`、`SpinnerSchema`、`SpinnerState`，`connectSpinner(props, normalize)` 改为 `connectSpinner(service, normalize)`；`SpinnerApi` 新增 `visible`。直接调用 `connectSpinner` 的使用者先用 `spinnerMachine` 建 service 再接线。三个适配器的公开 props 只多了 `delay`。
