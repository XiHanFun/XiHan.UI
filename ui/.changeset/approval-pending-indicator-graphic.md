---
'@xihan-ui/styles': patch
---

Approval 待决的呼吸点改取图形色，不再借警告文字色：写了语气时取语气层给图形用的那一支（与色条、指示条同一档，六族在亮暗两态对承载面都不低于 3:1），没写语气时与 `warning` 语气同一档（亮色 warning-700，暗色 warning-600）。此前没写语气时借的是 `--xh-fg-warning`，警告文字色加深一档后圆点跟着变深；写了 `warning` 语气时取的是语气主色，亮色白底上只有 2.69:1。覆盖槽 `--xh-approval-pending-indicator-color` 不变。
