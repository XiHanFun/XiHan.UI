---
'@xihan-ui/headless': minor
'@xihan-ui/react': patch
'@xihan-ui/vue': patch
'@xihan-ui/web-components': patch
---

将 DatePicker 公开部件的面板下标、起止字段身份和字段投影归一逻辑下沉到 Headless。

三适配器复用同一组纯函数，非法下标回到真实父面板，非区间模式的终点继续如实缺席；
适配器只保留各框架上下文与 DOM 接线。
