---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

**修复** 日志（Log）的 `threshold` 三端都没接到状态机上：类型与文档里有这一项，适配器的属性表里却没有，写多少都按缺省的 64px 判「是否在底部」。现在 `XhLogRoot` 与 `<xh-log>` 都收 `threshold`（距底部多少 px 仍算在底部），与消息流（MessageFeed）的同名属性一致。
