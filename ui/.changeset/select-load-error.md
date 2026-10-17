---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

选择器（Select）新增整表取数失败的状态，与级联选择、树选择分支级的取数失败同一套命名和行为：

- `error`：为真时浮层里露出 `error` 部件（role=alert，没写内容时显示 `translations.loadError`）与 `retry-trigger` 重试钮（没写内容时显示 `translations.retry`），空态占位让位；`loading` 同时为真时在途占位优先。
- 重试：点 `retry-trigger`，或浮层里没有高亮条目时按 Enter / Space，派发重试。Vue 为 `retry` 事件，React 为 `onRetry`，Web Components 为 `retry` 事件与 `error` 属性。重试钮不占 Tab 位，与浮层底部操作区一样。
- 新部件：Vue / React 的 `XhSelectError`、`XhSelectRetryTrigger`，Web Components 的 `error`、`retry-trigger` 角色节点；两者与空态、在途占位一样不进标准结构，由作者手写结构时摆放。
- 新增读屏文案 `loadError`、`retry`（十种语言）与覆盖槽 `--xh-select-error-*`。
