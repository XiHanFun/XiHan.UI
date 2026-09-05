---
"@xihan-ui/styles": minor
---

**修复** `tool-call` 的指示符空盒。它的 `indicator` 是开合箭头，皮肤此前只写了转向与颜色，作者不往里塞图形时渲出来的是一个什么都不画的空盒——同族的 `reasoning` 早就有兜底字形，两家从此同一副写法：`:empty::before` 用 `--xh-glyph-mark-chevron-right` 画一枚，作者塞了自己的图形这条规则即不命中。同批按 18.10.1 的行式约定补 RTL 分流（收起朝行首、展开转向下方），并在 `root` 上声明 `--xh-icon-size`（新增覆盖槽 `--xh-tool-call-icon-size`），作者塞进来的 `XhIcon` 与兜底盒从此同一把尺。

**收敛**聚焦环内收档的最后两处写法。`password-input` 的 visibility-trigger 与 `time-picker` 的 item 各自另画一条环，偏移写的是 `calc(-1 * var(--xh-ring-offset))`，与全库其余各处的 `calc(-1 * var(--xh-ring-width))` 是两支同值令牌的两种写法。两支当前都是 2px，**渲染结果逐像素不变**；收敛掉是为了「把环调粗一档」这类全局调整不会只走一半。
