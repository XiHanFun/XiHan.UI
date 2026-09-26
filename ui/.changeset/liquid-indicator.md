---
'@xihan-ui/tokens': minor
'@xihan-ui/core': minor
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

liquid 档的双沿指示器：`data-material="liquid"` 下，Segmented、Tabs、Anchor、NavigationMenu 的指示器起始沿与结束沿各由一支弹簧驱动，去向那一侧用 `spring-lead`、另一侧用 `spring-trail`，移动中被拉长、停下时收回；拉伸比例写成私有槽 `--xh-_<组件>-indicator-stretch`，皮肤据此把块向压到不低于新令牌 `--xh-motion-scale-squash`（0.86，减弱档为 1）。新的点击从当前位置与速度改向；standard 档与减弱动效下直接落位。

`@xihan-ui/core/visual-environment` 导出 `isLiquidMaterial(el)`：最近一层 `data-material` 声明为 `liquid` 时为真。
