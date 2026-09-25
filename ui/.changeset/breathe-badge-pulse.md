---
'@xihan-ui/tokens': minor
'@xihan-ui/motion': minor
'@xihan-ui/styles': minor
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

新增呼吸动效：共享关键帧 `xh-breathe`（明暗与缩放起伏，峰值在 42%）与 `xh-breathe-halo`（外扩光环），令牌 `--xh-motion-loop-breathe`（3600ms）、`--xh-motion-ease-breathe`（正弦式缓入缓出，原语 `--xh-ease-sine-in-out`）、`--xh-motion-scale-breathe` 与 `--xh-motion-scale-halo`（减弱档归 1）；`@xihan-ui/motion` 的 `easing.sineInOut` 与 `motionEasings.breathe` 同源。

Badge 新增 `pulse`（Web Components 为 `pulse` attribute）：圆点档呼吸，表达正在进行、给不出进度的状态（直播、录制、通话中）；光环播 3 轮后停，圆点持续到状态结束；数字角标不呼吸；减弱动效下两者都停，圆点停在满不透明度。badge.css 因此引入共享关键帧，体积基线随之上调。
