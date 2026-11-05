---
'@xihan-ui/core': major
'@xihan-ui/motion': major
'@xihan-ui/tokens': major
'@xihan-ui/headless': major
'@xihan-ui/styles': major
'@xihan-ui/web-components': patch
---

**移除** 液态粘连。`data-material="liquid"` 下 FloatButton 的展开动作不再从触发器里分离、收起时不再融回，触发器与动作之间不再以液颈相连；展开与收起回到与 standard 档相同的逐条冒出、逆序缩回。触发器仍是液态面（按下层换色调、亮边随指针、按住时随手指形变），展开组里的动作保持磨砂面，展开组不再投影 `data-xh-liquid`。

随之撤掉的公开面：`@xihan-ui/core/visual-environment` 的 `trackLiquidGoo` 与类型 `LiquidGoo`、`LiquidGooOptions`；`@xihan-ui/motion` 的弹簧预设 `merge`（`SpringPresetName` 不再含它）；令牌 `--xh-motion-spring-merge-stiffness` 与 `--xh-motion-spring-merge-damping`；皮肤里的色块层与滤镜规则（`[data-xh-liquid-goo]`、`[data-xh-liquid-goo-layer]`、`[data-xh-liquid-goo-filter]`、`[data-xh-liquid-goo-split]`）与私有槽 `--xh-_liquid-goo-shadow`。FloatButton 状态机的上下文 `merging` 改名 `exiting`、动作 `startMerge` / `endMerge` 改名 `startExit` / `endExit`，refs 不再有 `liquidGroup`。

`--xh-float-button-shadow` 不再接到整组投影上，只作用于触发器与原生动作项自己的面。
