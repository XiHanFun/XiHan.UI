---
'@xihan-ui/core': minor
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Progress 线形新增三样外观：`steps` 把轨道切成等宽的格、填充按整格亮起（读屏仍报实际值）；`striped` 在填充上铺斜纹，进行中沿行向流动、完成与减弱动效下静止；`buffer` 在填充之后画第二段浅色填充，新增 `buffer` 部件（Web Components 由元素生成进 track）。三者只对线形生效，`buffer` 只属于进度语义；写错地方或 `steps` 取值不合法时报新诊断码 `progress.option-ignored` 并按没给处理。填充与缓冲都铺满轨道按比例平移，不动宽度。progress.css 随之增大约 2.3 kB（分段遮罩、条纹与缓冲段的规则，以及它们的减弱动效、强制色与打印分支）。
