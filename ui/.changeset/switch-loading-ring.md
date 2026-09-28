---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Switch 提交中滑块里的环改接加载环家族配方：`thumb` 投影 `data-xh-loading-ring`，环画在滑块的 `::before` 上（此前在 `::after`，是 1px、无轨道的细环），画法与 Spinner 环档一致，起始边取强调色；提交开始与落定时按 `micro` 淡入淡出。`--xh-switch-loading-fg` 与 `--xh-switch-loading-duration` 照旧可用。
