---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**ImageViewer 十个 chrome 按钮接入 Action Control。** 连接层的 `prev-trigger` / `next-trigger` 新增稳定属性
`data-xh-action-control` / `data-xh-action-profile="floating"` / `data-xh-action-display="always"` /
`data-xh-action-size="md"`，`close-trigger` 投影 icon 档 `lg`，控件带七个按钮投影 icon 档 `xs`；均不投影
`data-xh-action-variant`，面由皮肤桥接到取景器自己的深色半透明 chrome。

视觉默认变化：翻页按钮由 40px 胶囊改为 48px 正圆（floating 档 md，compact 44px；正方盒取 circle），
图标由随文 1em 改为随档（翻页 24px、关闭 24px、控件带 16px）；控件带外壳圆角由 pill 改为
`--xh-shape-surface`、计数气泡由 pill 改为 `--xh-shape-control`（`--xh-image-viewer-overlay-radius` 仍是两者与
翻页按钮共用的使用者入口，新增 `--xh-image-viewer-toolbar-radius-outer` / `--xh-image-viewer-counter-radius`
分别覆盖）；遮罩 blur 变体补 `-webkit-backdrop-filter`；关闭按钮新增前景槽 `--xh-image-viewer-close-fg`。
皮肤删除十个按钮自写的盒型、hover / active 规则，`--xh-image-viewer-chrome-bg / -action-bg-hover /
-action-bg-active / -close-bg-hover / -close-bg-active / -close-size / -close-radius / -toolbar-radius /
-icon-size` 改为桥接到配方之前。
