---
'@xihan-ui/pointer': minor
'@xihan-ui/designer-kit': minor
'@xihan-ui/headless': patch
---

`@xihan-ui/pointer` 新增 `wheelPixels(event, { line?, page? })`：把按行、按页计量的滚轮滚动量折成像素（缺省一行 16、一页 400 像素），返回 `{ x, y }`。

- `@xihan-ui/designer-kit` 的 `wheelZoomFactor` 改用它，按页滚动折成的像素由 800 改为 400，与组件库其它滚轮处理一致；designer-kit 因此依赖 `@xihan-ui/pointer`。
- `tabs` 的滚轮滚动、关系图与直角坐标图的滚轮缩放改用它，换算值不变。
