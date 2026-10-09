---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

FileUpload 改为淡底面：

- 拖放区：2px 虚线 → 1px 虚线，圆角取 control（2px），静息铺 `--xh-bg-subtle`、字取正文色；悬停描边升 `--xh-border-strong`、底升一档；拖入换品牌描边，底仍是中性淡底一档（不用品牌淡底）；最小高改读新增语义令牌 `--xh-dropzone-min-h`（10rem）
- 文件行：去掉描边（透明边位留着），底 `--xh-bg-subtle`，行内与行间距 8px → 12px；删除钮按淡底承载阶梯换面，兜底叉改取 `--xh-control-indicator-sm`
- 缩略图位：32px 淡底方框 → 16px 品牌色无底图标位，空着时画一枚文件字形（新增语义令牌 `--xh-glyph-mark-file`）；放进来的图标同取 16px
- 失败行：描边透明、底回承载面，只有文件名与警示字形取危险色；新增组件槽 `--xh-file-upload-item-bg-error`
