---
"@xihan-ui/vue": patch
---

日期选择器初始展开时，等正文实际进入目标 Portal 后再交给焦点域，避免原地挂载时取得的焦点在 Teleport 搬运后丢失。覆盖默认及显式 iframe 目标、受控展开和 SSR 水合。
