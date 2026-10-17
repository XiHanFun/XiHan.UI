---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

浮动面板（FloatingPanel）的 content 只引用作者渲染了的标题，与对话框同一套写法：没写 title 时不写 `aria-labelledby`，名字由作者在 content 上写 aria-label。headless 的 `FloatingPanelSchema` props 新增 `parts`（只有 title 一项），由适配器统计，省略即按在场处理。
