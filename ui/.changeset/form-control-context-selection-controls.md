---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Select、Cascader、Combobox 与 TreeSelect 现已接入统一 FormControlContext 状态继承。三轴或四轴严格按各组件现有公开契约消费，并按实例、最近 Field、Form、默认值逐轴解析；显式 `false` 可覆盖继承状态。
