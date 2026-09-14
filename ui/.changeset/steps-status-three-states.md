---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

**步骤条的 `StepStatus` 收成 `'completed' | 'current' | 'incomplete'`；出错 / 警示改为逐步语气 `tones`。**

`'error'` 与 `'warning'` 原来混在状态里：一步被打回时它仍然是「当前那一步」或「走过的那一步」，状态位却被语气占掉，皮肤只好另写两套颜色。现在状态只说步序，语气另走全库同一根轴：根上的 `tone` 给整组配色，新增 `tones?: Record<number, Tone>`（以及 collection 单步的 `tone`）给某一步单独标语气，落成 `item` 的 `data-tone`，那一步的标记、标题与连接线在这一级重新从语气层取色，还没走到的那一步也以空心描边加同色数字被看见。三端同步：Vue / React 新增 `tones` prop，自定义元素新增 `tones` property；皮肤撤掉 `data-state='error' | 'warning'` 的规则与对应的 `--xh-steps-*-error / -warning` 槽，改为 `--xh-steps-indicator-*-toned` 与 `--xh-steps-title-fg-toned`；「错误状态」示例改用 `tones`。
