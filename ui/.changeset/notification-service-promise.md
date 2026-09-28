---
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

通知服务 `createNotificationService` 新增 `loading(title, options)` 与 `promise(input, options)`，与轻提示服务同形：`loading` 以加载态弹出一条并返回 id，之后用 `update` 收尾；`promise` 先弹出 loading，落定后就地改写为 `success` / `danger`，三段文案落在标题上，`description` 等其余字段三态共用，结果与拒绝原样交回调用方。新增导出类型 `NotificationPromiseOptions`。
