---
"@xihan-ui/vue": patch
"@xihan-ui/react": patch
"@xihan-ui/web-components": patch
---

DialogService 队列改由当前请求对应的真实退出完成通知推进，不再固定等待 250ms。自定义长退场会完整播放，无动画或减动效则立即进入下一项；重复关闭和旧请求的迟到完成不会跳过新请求。
