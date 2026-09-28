---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Form 错误摘要补上退场：改完最后一处错误或重置时，摘要先淡出（途中仍占位、不可交互，条目与条数停在撤下之前那一版），播完才藏起，下方字段不再在打字时瞬间上跳。摘要的 `data-state` 改为跟摘要自身的显隐走（露面 `invalid`，撤下与退场途中 `idle`）。

`FormApi` 新增 `summaryErrors` / `summaryErrorNames` / `summaryErrorCount` / `getSummaryError`：摘要此刻画的那版错误表；Vue / React 的摘要与摘要条目插槽参数改读它。Web Components 的摘要与条目显隐改照连接层给的 `hidden`。
