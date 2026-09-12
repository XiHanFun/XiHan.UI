---
'@xihan-ui/core': patch
'@xihan-ui/headless': patch
---

`hostLocale` 与 `resolveLocale` 现在把不可用的 Scope Window 或 navigator 明确视为“宿主未提供语言”，按既有解析链落到 `en-US`，不会在 SSR 阶段要求伪造 DOM，也不会借用其他页面的 ambient Window。

Calendar、DateField、DatePicker 与 Heatmap 因此可以在未显式配置 locale 时完成服务端渲染。
