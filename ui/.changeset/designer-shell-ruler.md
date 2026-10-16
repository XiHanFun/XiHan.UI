---
'@xihan-ui/designer-shell': minor
---

新增标尺框 `<xh-designer-ruler>`：包住画布，上、左两条标尺按视口与 `unit-size` 排刻度，左上角角块收 `slot="corner"` 的内容，画布上方一层参考线。从标尺拖进画布新建参考线，拖动已有参考线挪动、拖回标尺删除，点选后 Delete 删除，Esc 放弃拖动；参考线受控，经 `guides-change` 交出整组参考线与本次变化。另有选中范围淡底 `highlight`、刻度文字 `format`、拖动吸附 `snap` 与跟随指针的细线。
