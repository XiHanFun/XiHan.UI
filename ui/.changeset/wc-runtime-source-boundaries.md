---
'@xihan-ui/web-components': patch
---

将 FormControlHost 选择器从元素目录移到 Web Components 运行时目录，并扩展升级前浮层门禁对
`querySelector('[data-xh-part]')` 局部绑定的识别。非元素运行时文件不再被误要求声明自定义标签，
SideNav 的真实 branch-content 收起仍受 undefined.css 清单约束。
