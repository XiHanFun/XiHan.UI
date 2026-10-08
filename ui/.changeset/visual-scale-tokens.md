---
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
'@xihan-ui/headless': patch
---

视觉尺度整体调整：

- 圆角：control 与 inset 由 4px 改为 2px，surface 由 8px 改为 4px，overlay 由 12px 改为 4px（`--xh-radius-sm/md/lg` 改为 2 / 4 / 8px，`--xh-shape-overlay` 改指 `--xh-radius-md`）
- 控件高：comfortable 由 32 / 36 / 40px 改为 28 / 32 / 36px，compact 由 28 / 32 / 36px 改为 24 / 28 / 32px；方格与 Switch 轨道同步换档（Switch md 24px）
- 中性色换成冷灰阶，亮色正文改取 neutral 900，页面底 `--xh-bg-page` 改取 neutral 100；淡底阶梯随之落在 4.7% / 10.2% / 16.9%
- 标签与按钮字重 `--xh-text-label-weight` 由 500 改为 400
- 按压只换面：`--xh-motion-scale-press` 由 0.97 改为 1，主题写回 0.97 即恢复按下回弹
- 锚定浮层（frosted 配方）改为实体底 + 1px 描边 + 一层 `0 4px 10px` 投影，不再透景模糊；模态与通知面（elevated 配方）投影改为一层 `0 4px 12px`
- `--xh-elevation-raised` 缺省 none（平面卡片），`--xh-elevation-floating` / `-lifted` / `-sheet` 改为单层柔和投影
- 表格单元格纵向内距加一档（md 12px）

依赖控件高度、圆角或浮层透景的页面布局需要复查；要找回旧尺度，在根上覆盖对应令牌即可。
