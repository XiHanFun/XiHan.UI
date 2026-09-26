---
'@xihan-ui/tokens': minor
---

墨色域的 auto 规则同时作用于 `[data-xh-ink-surface]` 的直接子元素：库自己渲染的彩色面打上这一标记、在 `--xh-ink-surface` 里给出自己的底色，面内的内容就按这块底选墨，面自身的底色与字色仍按外层取值（域落在面上会让底色随域翻转）。材质通道、减少透明（媒体查询与 `data-transparency="reduce"`）与强制色同样命中这些子元素；强制色块另外补上了此前漏掉的 `[data-xh-ink]` 域。
