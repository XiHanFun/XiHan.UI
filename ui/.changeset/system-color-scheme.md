---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': minor
---

**新增** `data-theme="system"`：不跑任何 JS 跟随系统明暗的纯 CSS 路径。HTML 里写 `<html data-theme="system">`，浅色系统下与 `light` 同一套取值；系统切到深色时，`tokens.css` 里紧随深色块的 `@media (prefers-color-scheme: dark)` 块取深色块的全部取值，`color-scheme` 一并翻成 `dark`。皮肤里只在深色下成立的规则（语气、按钮实底、热力图灰阶、分段单选、审批等待指示）由样式包构建时照抄一份系统档副本，全量入口、无层入口与按需子路径都带上。视觉环境控制器照旧只投影 `light` / `dark`。
