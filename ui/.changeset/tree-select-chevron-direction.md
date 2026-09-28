---
'@xihan-ui/styles': patch
---

TreeSelect 分支箭头的朝向改为乘 `--xh-direction-sign`：此前按祖先 `[dir='rtl']` 翻转，rtl 页面里局部写回 `ltr` 的树选择器收起的箭头照样朝左；现在按就近的 `dir` 走，收起时指向行尾、展开时朝下。
