---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** LoadingBar 的起步值从 `minimum` 改叫 `startValue`：它是开始加载时先跳到的那个进度（缺省 8），不是下限，`minimum` 读起来像全库通用的 `min`。命令式服务的入参同名改。

| 旧名 | 新名 |
| --- | --- |
| `minimum`（WC attribute `minimum`） | `startValue`（Vue 模板与 WC attribute `start-value`） |
| `createLoadingBarService({ minimum })` | `createLoadingBarService({ startValue })` |
| 常量 `LOADING_BAR_MINIMUM`、函数 `resolveLoadingBarMinimum` | `LOADING_BAR_START_VALUE`、`resolveLoadingBarStartValue` |
