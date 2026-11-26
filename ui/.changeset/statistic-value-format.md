---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 统计数值直接收数值：`value` 按 `locale` 与 `formatOptions` 格式化后显示在值部件里，不必再自己拼千分位、小数位与货币符号。`formatOptions` 原样交给 `Intl.NumberFormat`（小数位、分组、货币、百分比、单位、紧凑记数），不写时按该语言的缺省，分组打开、至多三位小数，选项不合法时当场报错；`locale` 不写时取全局配置的语言，再没有按宿主语言。`null` 与不给同义，不会铺成 0。值部件里写了内容就照写的显示，不覆盖，原来手写数值的用法不受影响。Web Components 的 `formatOptions` 只能经 property 设置。连接层 API 新增 `valueText`。

**新增** 统计数值的标准结构：不写结构时（Vue 不写默认插槽、React 不给 children、Web Components 不写部件或只写 `root`）照 `statisticStructure` 铺出标签、前缀、值、后缀与涨跌，给了哪段才铺哪段。标签取 `label` 或同名插槽，前后缀来自 `prefix`、`suffix` 插槽（React 是同名属性），涨跌给了 `trend` 或新增的 `trendText`（Web Components 写作 `trend-text`）才铺，比数文字写在里面。
