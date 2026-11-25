---
'@xihan-ui/core': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

**新增** 当前断点：core 的 `observeBreakpoint({ onChange })` 读断点令牌 `--xh-breakpoint-*`、每档按 `min-width` 建一条媒体查询，返回 `current`（`base` / `sm` / `md` / `lg` / `xl`），只在跨档时通知，缺令牌时报错；`@xihan-ui/vue/behavior` 与 `@xihan-ui/react/behavior` 新增 `useBreakpoint()`，挂载前（含服务端渲染）为 `base`。Web Components 与原生脚本直接用 `observeBreakpoint`。
