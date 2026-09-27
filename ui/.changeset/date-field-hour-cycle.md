---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

DateField 新增 `hourCycle`（`12 | 24`，缺省 24，不随 locale 推断）：12 时按 granularity 铺段的时刻段收 1-12，分秒之后多出上下午段（按 a / p 或上下键切换），年月日仍按 locale 排；值仍是 24 小时制的 ISO 串。给了 `segments` 时由段集里有没有 `dayPeriod` 决定，`hourCycle` 不插手。Web Components 的 attribute 是 `hour-cycle`。

`dateSegmentOrder`、`resolveSegmentSet` 多收一个 `hourCycle` 参数，`DateSegmentOptions` 多出 `hourCycle`；新增类型 `DateHourCycle`。
