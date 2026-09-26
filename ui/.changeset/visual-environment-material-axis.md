---
'@xihan-ui/core': minor
'@xihan-ui/tokens': minor
'@xihan-ui/vue': minor
'@xihan-ui/web-components': minor
---

视觉环境控制器新增第八轴 `material`（`standard` / `liquid`，缺省 `standard`，没有系统档）：`setPreference({ material: 'liquid' })` 在作用域根写 `data-material`，子作用域继承，Portal 视觉桥照常带到实例壳；新增类型 `Material`。`<xh-config>` 新增 `material` 属性，Vue 的 `provideXhConfig` 在 `initial.material` 变化时重建控制器。用了控制器的应用，材质轴改经它设置——控制器始终维护根上的 `data-material`。
