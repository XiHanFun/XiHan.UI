---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': patch
---

Slider 粗指针命中区按拇指直径补足，不再压住字段标签：

- 新增语义令牌 `--xh-control-hit-coarse`（44px）：粗指针下命中区的最小边长，伪元素外扩补足到它
- 控件沿交叉轴的外扩总量改为「`--xh-control-hit-coarse` − 拇指直径」，sm 档 10px 的拇指也到 44px（此前固定外扩 16px，只有 42px）
- 横排时朝标签一侧最多扩到标签与控件之间的间距（`--xh-slider-label-gap`），点在标签上不再直接跳值，少扩的一截挪到块尾补齐；竖排两侧对称外扩
