---
'@xihan-ui/vue': patch
---

**修复** Nuxt 模块注册视觉环境插件模板时改用 `filename` 字段：旧别名 `fileName` 新版 Nuxt 已不认，生成类型时报 NUXT_B8011。
