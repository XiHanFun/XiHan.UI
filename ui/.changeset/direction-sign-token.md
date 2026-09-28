---
'@xihan-ui/tokens': minor
---

新增书写方向符号令牌 `--xh-direction-sign`：从左往右为 `1`、从右往左为 `-1`，按就近的 `dir` 属性决定、靠继承传到子树——`dir` 写在哪一层就在哪一层翻转，rtl 里局部写回 `ltr` 的子树跟着翻回，`dir="auto"` 沿用外层；不随 `data-density` 等轴的边界重置。逻辑属性自己会随方向换边，只认物理方向的量（`translate`、渐变角度、`clip-path` 的左右两侧）乘上它换向，取代祖先 `[dir='rtl']`（局部写回 ltr 时判错）与 `:dir()`（Chrome 120 起，高于浏览器硬底线）两种写法。
