---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

FileUpload 的三颗钮改接 Action Control 家族，不再各自手绘：
- 「选择文件」`trigger` 投影 text 档 `outline`、md：静息描边、悬停白底承载 100、按下 200 与 0.97 按压、焦点环与禁用面由家族给，不再悬停抬 raised 影（`--xh-file-upload-trigger-shadow-hover` 仍可自行加影）；字号改随家族 md 档，新增 `--xh-file-upload-trigger-font-weight`。
- 逐条删除 `item-delete-trigger` 投影 icon 档 `ghost`、xs：悬停 100 / 按下 200，悬停与按下时字换危险色；钮里的兜底叉按 xs 钮的字形尺画（`--xh-glyph-size-sm`），此前随文字号。
- 清空 `clear-trigger` 投影 text 档 `ghost`、sm：字号改随家族 sm 档（此前是说明字号），空列表时三态前景一起压淡。
此前三颗钮悬停落 200、按下落 300，白底承载面上高了一档。
