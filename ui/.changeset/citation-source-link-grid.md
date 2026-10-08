---
'@xihan-ui/styles': patch
---

修复引入无层样式 `index.unlayered.css` 时，Citation 来源列表的行没有按「序号 | 标题 / 来源」两列排版：现在序号列按内容取宽，标题与来源所在的文字列铺到行尾。有层的 `index.css` 不受影响。
