---
'@xihan-ui/pointer': minor
'@xihan-ui/headless': patch
---

`@xihan-ui/pointer` 新增 `wheelPixels(event, { line?, page? })`：把按行、按页计量的滚轮滚动量折成像素（缺省一行 16、一页 400 像素），返回 `{ x, y }`。

- `tabs` 的滚轮滚动、关系图与直角坐标图的滚轮缩放改用它，换算值不变。
