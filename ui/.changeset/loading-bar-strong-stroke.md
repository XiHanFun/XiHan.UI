---
'@xihan-ui/headless': major
'@xihan-ui/styles': minor
---

LoadingBar 缺省厚度由 2px 改为强调线宽令牌 `--xh-stroke-strong`（3px）：`LOADING_BAR_HEIGHT` 的值改为 `'var(--xh-stroke-strong)'`，`height` 不传时写进内联样式的就是它。进度段露出的前端改为胶囊圆头（行首贴边一端仍是方头），新增组件槽 `--xh-loading-bar-range-radius`。
