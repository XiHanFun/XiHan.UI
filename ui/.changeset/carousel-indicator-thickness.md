---
'@xihan-ui/styles': minor
---

Carousel 分页点新增组件槽 `--xh-carousel-indicator-thickness`：垂直于轨道的粗细单独可调（横轨管高、纵轨管宽），缺省与 `--xh-carousel-indicator-size` 同值，现有圆点与胶囊不变。此前分页点的宽高共用一个长度槽，只画得出圆点与拉长的胶囊，想要细横条只能覆盖指示点盒子本身的尺寸与底色，粗指针下盒子撑成 44px 命中区、点改由伪元素画，覆盖的底色就把整块命中区涂满。现在粗细调小即成细横条（圆角另把 `--xh-carousel-indicator-radius` 换成 `var(--xh-shape-pill)`）：细指针的命中区垂直于轨道多外扩一些、不低于 24px，粗指针下伪元素画的点与自动播放进度条同样按粗细画，44px 命中区不变。
