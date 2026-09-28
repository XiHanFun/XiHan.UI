---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Reasoning 在思考中显示已经想了多久：

- 知道开始时刻（`startTime`）时，思考中的状态文案把已用的整秒数代入新增的 `translations.thinkingFor`（缺省 `Thinking for {seconds}s`），每秒跟着走；想完照旧代入 `thoughtFor`。只换了 `thinking` 没给 `thinkingFor` 时照旧显示 `thinking`。API 新增 `elapsedMs`（思考中是已用时、想完即时长）。
- 表走在 tool-call 机器里：机器新增 `clock` 属性与 `context.now`，只在运行时每秒记一次当前时刻，停下即拆掉计时器；三端的 Reasoning 打开它，ToolCall 不开。
