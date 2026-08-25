---
'@xihan-ui/styles': patch
---

装饰档 `--xh-_tone-soft` 从 500 提到与控件边界同一档

色条、指示条、锚点高亮这些用装饰档画的东西是非文字图形，按 WCAG 1.4.11 要 3:1。
500 档压在浅色画布上，success 2.29、warning 1.92、info 2.75 都够不到。

`--xh-_tone-border-control` 早就为同一个阈值兜过底（warning 在浅色下取 700、
neutral 在深色下取 550），要求完全一样，装饰档就直接跟着那一支走，六族十二组全部达标。
`check-tone-contrast` 补上这条断言，覆盖从 110 组扩到 122 组。

观感上所有色条、时间线指示点、锚点高亮会比原来重一档。
