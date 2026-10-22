---
'@xihan-ui/core': minor
'@xihan-ui/headless': patch
---

**优化** 工具条的溢出收纳：条目只改了可及名、按下态或禁用时不再重量排版，只重读收起的条目在「更多」菜单里的样子；尺寸、条目增减与文字改写照旧重量。
**新增** `trackOverflowLayout` 的选项加 `onDescribe`：只有条目的声明变了时回调它；不给时照旧回调 `onChange`。
