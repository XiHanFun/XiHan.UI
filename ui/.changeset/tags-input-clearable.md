---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 标签输入的 `clearable` 开关，缺省开启，现有用法不变：写 `false` 即关掉清空能力，清空按钮恒收起、标准结构不再铺它，`api.clear()` 也被拦下，逐个删除照旧可用。Web Components 写 `clearable="false"`。连接层 API 新增 `clearable`。
