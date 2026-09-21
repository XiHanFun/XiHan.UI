---
'@xihan-ui/styles': patch
---

FileUpload 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-file-upload-icon-size`（§6.5）：条目行首传完的勾与失败的警示两枚 `::before` 固定状态标记此前读 root 的 `--xh-icon-size`（随文 1em，条目字号下 14px，且不随密度换档）；现在取新增公开槽 `--xh-file-upload-item-mark-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px）——comfortable 从 14px 放到 16px，与同一行里 icon 档的删除钮并排，compact 尺寸不变但从此随密度换档。它们是固定状态标记，作者塞进条目的部件顶不掉。`--xh-file-upload-icon-size` 仍只管作者放进缩略图槽、删除钮与清空钮里的图标与皮肤画的兜底叉（随文 1em 不变）。
