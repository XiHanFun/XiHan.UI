---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Tag 关闭补上退场：点关闭钮后标签原地淡出（途中仍占位、不可交互），播完才写 `hidden`，不再瞬间消失。可关闭的标签根节点带上 scope 派生的稳定 `id`；Web Components 的显隐改照连接层给的 `hidden`。
