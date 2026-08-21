---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": minor
"@xihan-ui/vue": minor
---

内建兜底字形收进令牌：勾、半选横杠、展开箭头、排序方向、必填星号原先在 14 份皮肤里各写一遍（26 处），现在统一走 `--xh-glyph-mark-*` 一族十个令牌。使用者在 `:root` 上重声明即全局换，写在任意容器上即只换那一块，取值就是 CSS `content` 的取值（字符、`url()`、`none`）。新增 `check-glyph-slots` 门禁禁止皮肤里再写字面字形，并双向核对令牌与用处。

`transfer` 的条目勾号补上 `:empty` 守卫，与其余 12 个组件一致：作者往格子里塞了自己的图形，皮肤那条勾就不再重影。`XhCheckbox` 新增 `indicator` 插槽——它的方框此前没有任何子部件入口，皮肤那条 `:empty` 守卫在 Vue 侧根本够不着。
