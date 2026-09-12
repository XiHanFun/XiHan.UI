---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

Select 现在以 Headless Presence 租约管理真实退出：逻辑关闭会立即令 content `inert` 并退出可访问树，Layer、DismissableLayer 与焦点域保留到 content 的全部有限 CSS 退场完成。退场期间不再接受重复消解；重开撤销旧视觉租约、复用 Layer 并重新激活焦点域，卸载立即清理。
