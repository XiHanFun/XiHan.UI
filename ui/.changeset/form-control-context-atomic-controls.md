---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Checkbox、Switch、RadioGroup 与 NumberField 现已接入统一的 FormControlContext 状态继承：
`disabled`、`readOnly`、`invalid`、`required` 按实例、最近 Field、Form、默认值的顺序逐轴解析。
Vue、React 与 Web Components 共用 Headless resolver；Web Components 同时支持显式 `false` 覆盖继承状态。
