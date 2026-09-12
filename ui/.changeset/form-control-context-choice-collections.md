---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Rating、Segmented、ToggleGroup 与 Transfer 现已接入统一 FormControlContext 状态继承。
各组件只消费原有公开状态轴，并按实例、最近 Field、Form、默认值逐轴解析；显式 `false` 可覆盖继承状态。
