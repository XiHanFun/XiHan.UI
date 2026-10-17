---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

抽屉（Drawer）的 content 只引用作者渲染了的标题与说明，与对话框同一套写法：没写 title 时不写 `aria-labelledby`，名字由作者在 content 上写 `aria-label`；没写 description、或说明读不出一句话时不写 `aria-describedby`。headless 的 `DrawerSchema` props 新增 `parts`（`TitleDescriptionParts`），由适配器统计，省略即按都在场处理。
