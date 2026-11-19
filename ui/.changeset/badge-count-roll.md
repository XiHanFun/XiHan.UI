---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Badge 换数不再瞬切：露面期间计数变了，计数逐位排出，变了的那几位沿块向滚过去（变大往上、变小往下），没变的位原地不动；多出、少掉的一位（含超过上限的「+」）宽度随之补间、角标跟着伸缩，滚走的那一位播完才摘掉。数值角色 `move` / `continuous`，减弱动效下直接换字；出现与清零仍是原来的弹出与缩小淡出。

角标没给自定义内容时，indicator 里多了三个部件：`value`（数字部分，rtl 下仍从左往右写）、`glyph`（数字的一位）、`suffix`（超过上限的「+」，随行向排在数字后面）。连接层新增 `glyphs` / `suffix` 与 `getValueProps()` / `getGlyphProps()` / `getSuffixProps()`；`text` 与 indicator 默认插槽的载荷不变。badge.css 因此变大（逐位排布、滚动与列宽补间的规则与关键帧）。

**修复** Web Components 的 `<xh-badge>` 改了 `count` 之后 indicator 里的数字不跟着变：第一次写进去之后就当成作者内容不再改。现在元素自己写的计数与作者内容分开认，每次都按新计数重写。
