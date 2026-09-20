---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**ImageViewer 的关闭钮、工具条七颗与两端翻页钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressed`（`ImageViewerPressedPart`，按 part 键记按住的那一颗），事件 `PRESS.START` / `PRESS.END` 挂根级、只在展开态接；贴住缩放端点的缩放钮与到边界的翻页钮不进，按住途中转禁用或浮层收起时由机器松开。
键盘表新增 `image-viewer.kbd.press`；`ImageViewerPressedPart` 进公开面。三端公开 props 与事件不变。
