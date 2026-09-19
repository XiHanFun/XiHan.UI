---
'@xihan-ui/core': patch
'@xihan-ui/web-components': patch
---

`createPortalLease` 在搬迁与归位 roots 时保住落在 roots 里的焦点：节点摘下再插回会失焦，
物理 Portal 只是换个父节点，不该改变文档的焦点。Web Components 的 `<xh-popconfirm default-open>`
首轮渲染把 positioner 搬进 portal 壳后，焦点域已放到取消按钮上的焦点不再丢回 body；
Popover 与 Popconfirm 以打开态挂载时，焦点域放进内容区的初始焦点同样得以保住。
