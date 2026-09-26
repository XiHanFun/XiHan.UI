---
'@xihan-ui/tokens': minor
'@xihan-ui/motion': minor
'@xihan-ui/styles': minor
---

liquid 档的交互光：`data-material="liquid"` 下实心按钮在细指针悬停的一刻，一道光沿 1px 描边环扫过一次，光取面上前景色、不进面，文字对比不受影响；粗指针、强制色下不播，减弱动效下时长归 1ms。新增令牌 `--xh-motion-duration-glint`（640ms）与 motion 的 `motionDurations.glint`，共享关键帧 `xh-glint`，按钮新增覆盖槽 `--xh-button-glint-duration`。
