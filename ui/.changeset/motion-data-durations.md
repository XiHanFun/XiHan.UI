---
'@xihan-ui/tokens': minor
'@xihan-ui/motion': minor
---

新增两枚数据动效的语义时长：`--xh-motion-duration-reveal`（640ms）给数据标记首次出现——柱从基线长出、折线描出、扇区扫开；`--xh-motion-duration-morph`（400ms）给数据更新——标记从旧位置走到新位置、坐标轴刻度滑动。减弱动效下两者都归 1ms。`motionDurations` 与 `reducedMotionDurations` 同步加入 `reveal`、`morph`，`readMotion(el).duration('reveal' | 'morph')` 可直接读取。
