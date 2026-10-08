---
'@xihan-ui/styles': patch
---

修复引入无层样式 `index.unlayered.css` 时，InfiniteScroll 取下一页按钮的文案贴在起始边：现在单行时整段居中，折行时逐行居中。有层的 `index.css` 不受影响。
