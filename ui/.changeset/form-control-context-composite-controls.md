---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Editable、TagsInput、CheckboxGroup 与 Slider 现已接入统一的 FormControlContext 状态继承。
各组件只按原有公开契约消费 `disabled`、`readOnly`、`invalid`，TagsInput 另消费 `required`；
所有支持轴均按实例、最近 Field、Form、默认值逐轴解析，并允许实例显式 `false` 覆盖继承状态。
