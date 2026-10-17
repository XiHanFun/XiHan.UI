---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

通知（Notification）的每张卡片只引用作者渲染了的 item-title 与 item-description，与对话框同一套写法：没写 item-title 时不写 `aria-labelledby`；没写 item-description、或说明读不出一句话（记录没写 description 时就是这样）时不写 `aria-describedby`。headless 的 `NotificationItemSchema` props 新增 `parts`（`TitleDescriptionParts`），由适配器统计，省略即按都在场处理。
