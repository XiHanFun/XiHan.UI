---
'@xihan-ui/styles': patch
---

Action Control 家族在 `(pointer: coarse)` 下扩热区的两条 `::after` 规则改由 `:where()` 包住，特指度从 (0,2,1) 降到 (0,0,1)。皮肤对同一伪元素的覆盖（Table 排序把手、Rating 星、RadioGroup 条目这些拿 `::after` 画字形的部件把热区钉回原位）从此只靠特指度就赢，不再依赖源序：消费方产物里家族被重复内联、副本排在皮肤之后时，手机上表头排序箭头不再被撑成整格。
