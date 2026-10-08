---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

Dialog 改为实体 sheet 面与贴边分隔的三段：

- 去掉头部渐变与顶光，面就是 1px 描边 + 不透明底 + 单层投影；删除使用者槽 `--xh-dialog-highlight`、`--xh-dialog-header-bg`、`--xh-dialog-content-lens-bg`、`--xh-dialog-content-lens-depth`、`--xh-dialog-header-lens-depth`
- 分三段时内衬由三段各给：头部是一条 48px 的带（紧凑 44px）、横向 20px，正文纵 24 横 20，尾段纵 16 横 20；头下、尾上的 1px 分隔线贴着面板两侧的边。新增使用者槽 `--xh-dialog-header-pt/-px`、`--xh-dialog-body-py/-px`、`--xh-dialog-footer-py/-px`
- 不分三段时标题行落在顶上 48px 带的中线上，横向内衬 20px
- 关闭钮的叉改为 12px，钮距右 16px、竖向落在头部带中线上
- 新增语义令牌 `--xh-overlay-header-h`、`--xh-overlay-sheet-px`、`--xh-overlay-sheet-body-py`、`--xh-overlay-sheet-footer-py` 与 `--xh-glyph-size-xs`（12px）
