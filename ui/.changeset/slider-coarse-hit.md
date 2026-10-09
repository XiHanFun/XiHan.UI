---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': patch
---

Slider 粗指针命中区按拇指直径补足到 44px，朝标签一侧不越过标签间距：

- 新增语义令牌 `--xh-control-hit-coarse`（44px）：粗指针下命中区的最小边长，伪元素外扩补足到它
- 控件沿交叉轴的外扩总量为「`--xh-control-hit-coarse` − 拇指直径」，按拇指算而不是固定一格，sm 档 10px 的拇指也到 44px
- 横排时朝标签一侧最多扩到标签与控件之间的间距（`--xh-slider-label-gap`），点在标签上不会直接跳值，少扩的一截挪到块尾补齐；竖排两侧对称外扩
