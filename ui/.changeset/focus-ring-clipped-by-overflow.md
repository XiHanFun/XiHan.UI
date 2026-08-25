---
"@xihan-ui/styles": patch
---

四处被祖先 `overflow` 裁掉的聚焦环改成往内收。

`outline` + 正的 `outline-offset` 把环画在元素盒外面，祖先只要是
`overflow: hidden / auto / scroll`，环就会被裁掉一截——键盘用户看到的是
三条边或者两侧缺口的半圈蓝环。四处改为 `outline-offset: calc(-1 * var(--xh-ring-width))`，
环整圈落在盒内：

- image-cropper 的 `crop-area` 与 `crop-handle`：两者都长在 `viewport` 里，
  那层 `overflow: hidden` 同时还替暗遮罩（`box-shadow: 0 0 0 9999px`）收边。
- heatmap 的 `grid`：`root` 为一整年五十几列备了 `overflow-x: auto`。
- table 与 transfer 的 `select-all-trigger`：同文件的邻居
  （table 的 `row` / `sort-trigger`、transfer 的 `search` / `item`）本就是内收写法，
  这两处是仅剩的外扩。

`--xh-ring-offset` 令牌本身不动：库里另有 9 条规则写着
`calc(-1 * var(--xh-ring-offset))`，翻令牌的符号会把它们一起翻成外扩。
