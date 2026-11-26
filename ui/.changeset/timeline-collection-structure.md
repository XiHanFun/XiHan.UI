---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Timeline 新增 `collection`（条目字段 `value`（条目身份）、`label`、`time`、`datetime`、`title`、`description`、`tone`），只给它时按标准结构铺出事件流：每条一个 `li`，依次是坐标列、圆点、连线与内容，给了哪项才铺哪一块，`datetime` 写成 `<time>` 的机读时间。headless 新增 `timelineStructure`、`TimelineNode`、`TimelineNodeMeta` 与 api 的 `collection`。
