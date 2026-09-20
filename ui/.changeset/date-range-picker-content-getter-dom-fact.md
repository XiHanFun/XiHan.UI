---
"@xihan-ui/vue": patch
---

**DateRangePicker 交给焦点域的 `getContentEl` 只回答 DOM 事实，不再复核 Portal 配置。**

与 DatePicker 同型：getter 直接按显式 `portalContainer` 或运行时默认落点做包含判断，配置错误仍由渲染读 `portalTarget` 抛出并交给框架上报，不再在机器 flush / rAF 那一路成为未捕获 rejection。
