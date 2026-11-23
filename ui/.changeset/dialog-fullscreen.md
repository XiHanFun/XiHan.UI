---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 对话框的全屏形态 `fullscreen`：面板铺满视口——定位层只留安全区那一段内衬，面板撑满它；贴住视口的边不取圆角、不画描边与投影，进退场只淡变。分了 header / body / footer 三段时头尾定在原处、正文吃掉剩下的高度。宽度档 `size` 与 `draggable` 在这一档不生效。面板靠 `positioner` 拉满：Vue / React 的 Content 自带这一层，Web Components 要写 `positioner` 部件。`positioner` 与 `content` 新增状态属性 `data-fullscreen`。
