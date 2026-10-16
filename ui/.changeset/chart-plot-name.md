---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

图表家族（直角坐标图、饼图、雷达图、漏斗图、桑基图、关系图、层级图）不放 caption、只在根上写 `aria-label` 或 `aria-labelledby` 时，绘图区也有可及名了：此前绘图区恒引用 caption 的 id，没有 caption 时引用落空，读屏念不出图名，axe 报 svg-img-alt。现在 caption 在场时绘图区引用它，不在场时沿用根上的那一条；caption 后补进来或根上的命名改动时跟着变。
