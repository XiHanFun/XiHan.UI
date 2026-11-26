---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 颜色选择器的 `clearable` 开关，缺省开启，现有用法不变：写 `false` 即收起清空按钮：单选有值也不露、标准结构不再铺它，`setValue([])` 照旧清回未选。Web Components 写 `clearable="false"`。连接层 API 新增 `clearable`。
