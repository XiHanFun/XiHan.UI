---
'@xihan-ui/tokens': minor
'@xihan-ui/motion': minor
'@xihan-ui/core': minor
'@xihan-ui/styles': minor
---

`@xihan-ui/core/visual-environment` 新增液态组 `trackLiquidGoo(host, { source, members, domains })`：宿主的材质轴为 `liquid` 时，在宿主最前面插入装粘连滤镜的 `<svg>` 与一层装饰色块层（`aria-hidden`、不接指针），同组的块边缘相距约 15px 以内就连成一片；投影、底色、墨色细线与 1px 亮边都沿整组外形画，色调、通透档与光源方向跟源块走。`split(items, open)` 让块从源块中分离或融回，离源块近的先走、相邻两块错开交错步长，减弱动效下不播放。

弹簧新增预设 `merge` 与令牌 `--xh-motion-spring-merge-stiffness / -damping`（320 / 24，超调 5.8%），供融合分离使用。液态层皮肤新增色块层与滤镜各段的填色规则，投影经私有槽 `--xh-_liquid-goo-shadow`，组件可在自己的宿主上接入使用者的投影槽。
