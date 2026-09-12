---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

DatePicker、TimePicker、ColorPicker 与 Mention 现已接入统一 FormControlContext 状态继承。每个组件只消费既有公开状态轴，按实例、最近 Field、Form、默认值逐轴解析，并允许显式 `false` 覆盖继承状态。
