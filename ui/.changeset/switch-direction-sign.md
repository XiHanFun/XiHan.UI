---
'@xihan-ui/styles': patch
---

Switch 的滑块换向改为乘 `--xh-direction-sign`：此前按祖先 `[dir='rtl']` 换向，rtl 页面里局部写回 `ltr` 的开关照样命中，打开态与按住拉长时滑块被推出轨道；现在按就近的 `dir` 走，嵌套方向下滑块始终停在轨道的行尾。
