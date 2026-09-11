---
"@xihan-ui/headless": patch
"@xihan-ui/vue": patch
"@xihan-ui/react": patch
"@xihan-ui/web-components": patch
---

Popover 的 `modal` 现在由无头状态机统一兑现完整模态约束：锁住页面滚动、让背景失活，并保留后开的嵌套 Portal 层。

展开期间可动态切换模态策略；关闭内容立即退出焦点与交互树，滚动锁、背景失活和层登记会保留到实际 CSS 退场完成。退场中重开与组件卸载不会遗留资源。
