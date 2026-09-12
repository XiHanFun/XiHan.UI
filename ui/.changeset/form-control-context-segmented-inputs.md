---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

PasswordInput、PinInput、DateField 与 TimeField 现已接入统一的 FormControlContext 状态继承。
`disabled`、`readOnly`、`invalid`、`required` 按实例、最近 Field、Form、默认值逐轴解析，
且三端都保留显式 `false` 覆盖继承状态的能力。
