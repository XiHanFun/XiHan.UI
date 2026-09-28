---
'@xihan-ui/headless': minor
'@xihan-ui/styles': major
---

ImageViewer 的占位态与禁用按设计真源补齐：
- 取图时画面正中改转一枚加载环（`viewport` 投影 `data-xh-loading-ring`，环走加载环家族配方，随 `data-loading` 淡入淡出），不再垫一块抬起占位面；环与警示字形的尺由新增的 `--xh-image-viewer-status-size` 给，缺省 `--xh-glyph-size-lg`。
- 取图失败此前没有画面：机器已置 `imageStatus: 'error'`，连接层却只投影 `data-loading`。`viewport` 与 `image` 新增 `data-error`，皮肤在画面正中画一枚取 `--xh-fg-danger` 的警示字形，破图整张让位（替代文字仍在可及树里）；新增 `--xh-image-viewer-error-fg`。
- 禁用的翻页、缩放钮此前只压低不透明度：改为前景换 `--xh-fg-disabled`（看片层的白墨域里取深色档的禁用色），不再改不透明度。
破坏性：移除 `--xh-image-viewer-loading-size`、`--xh-image-viewer-loading-radius` 与 `--xh-image-viewer-loading-bg`（占位面已撤，环径改由 `--xh-image-viewer-status-size` 给）。
