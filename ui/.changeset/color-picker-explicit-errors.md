---
"@xihan-ui/headless": major
"@xihan-ui/react": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
---

建立 ColorPicker 显式错误合同：非法或越界文本不再静默复原、裁切，格式、输入、颜色解析与屏幕取色异常分别保留状态并发出 `color-error`，同时隔离旧输入与迟到取色结果。
