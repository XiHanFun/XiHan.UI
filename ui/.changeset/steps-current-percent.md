---
'@xihan-ui/core': minor
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Steps 新增 `percent`（0–100，越界夹回）：当前这一步报出自己的完成比例，当前步的序号圆点外离一道缝画一圈进度环，从 12 点顺时针走（不随书写方向镜像），已完成那段取强调色、轨道取连接线的底色；环落在触发器的内衬里，不挤版面。比例变化时弧沿数值角色的时长走到新值，首帧直接落位；强制色下弧与轨道改取系统色，打印照原色印出。读屏：可操作时比例作为当前步触发器的描述读出（圆点对读屏隐藏，经 `aria-describedby` 供给「60% complete」），只读展示下当前步的圆点是一个 `progressbar`（`aria-valuenow` / `aria-valuetext`）。新增 `translations.progressLabel` 与 `progressValueText`、圆点的 `data-progress` 状态与覆盖槽 `--xh-steps-indicator-ring-track`。进度环只画在序号圆点上：点状形态给了 `percent`、或取值不是有限数时报新诊断码 `steps.option-ignored` 并按没给处理。
