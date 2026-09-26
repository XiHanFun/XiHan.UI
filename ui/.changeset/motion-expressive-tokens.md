---
'@xihan-ui/tokens': minor
'@xihan-ui/motion': minor
---

新增表现性动效令牌：`--xh-motion-duration-attention`（注意动效播一遍，640ms，减弱档 1ms）、`--xh-motion-distance-lg`（16px，减弱档归零）、`--xh-motion-ease-emphasis`（取新原语 `--xh-ease-emphasized`）。它们供 `@xihan-ui/animations` 的预设使用，组件皮肤不用。`@xihan-ui/motion` 同步导出语义位移 `motionDistances`（sm / md / lg）与错开步长 `motionStaggerStep`，`motionDurations` 增加 `attention`、`motionEasings` 增加 `emphasis`，与令牌逐条对账。
