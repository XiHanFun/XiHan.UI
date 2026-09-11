---
"@xihan-ui/headless": patch
"@xihan-ui/vue": patch
"@xihan-ui/react": patch
"@xihan-ui/web-components": patch
---

Drawer 在 `modal=false` 时不再创建或激活遮罩，定位层继续允许指针穿透到页面；展开期间切换 `modal` 会同步更新焦点陷阱、滚动锁、背景失活和遮罩。
