---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

Notification 改排版：

- 卡片预设：缺省宽由 24rem 改为 300px（新增语义令牌 `--xh-overlay-notification-w`，摞的定位面同宽）、四边内衬由 16px 改为 20px；左列类型字形由 20px 改为 24px；标题取面板标题档（heading-3）、正文色，行高 1.5 与字形同高；说明改为 14px 正文色的正文
- 轻提示预设：圆角由浮层档改为 control（2px），纵向内衬由 12px 改为 10px，行首字形保持 20px；标题 14px / medium，说明保持 13px 次级色
- 两种预设的关闭钮叉由 16px 改为 12px（`--xh-glyph-size-xs`）；卡片的叉仍距右 12px，竖向改为与标题首行同一条中线（上内衬 + (标题行高 − 钮边长) / 2，舒适档距上 18px、紧凑 16px）
