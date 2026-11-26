---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

**修复** 步骤条一块面板（`content`）都不写时（只当进度条用、只给 `collection` 的标准结构），触发器不再带指向不存在节点的 `aria-controls`。面板由三端按实际渲染统计后经新的 `parts` 交给连接层，面板挂上之前（服务端直出、首帧）照旧按有面板写。
