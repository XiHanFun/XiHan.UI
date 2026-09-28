---
'@xihan-ui/styles': patch
---

FloatButton 展开后触发器兜底的「+」转 45° 成「×」，收起转回（`--xh-motion-duration-nudge` + `enter-strong`，减弱动效下即刻到位），读得出再按一下就收起；此前展开后触发器仍是「+」。作者往触发器里塞了自己的图形时不转。展开列表的错开改为第五条起钉在第四级，与收起、与列表动效（`trackArrivals`）同一个封顶（此前展开最多错开 5 步、收起 4 步）。
