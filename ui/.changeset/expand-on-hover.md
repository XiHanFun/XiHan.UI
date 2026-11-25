---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Cascader 与 FloatButton 的展开方式从枚举 `expandTrigger: 'click' | 'hover'` 改成布尔 `expandOnHover`，与 Menu 的 `openOnHover`、Combobox 的 `openOnClick`、Tree 的 `expandOnClick` 同构。缺省仍是点击展开；类型 `CascaderExpandTrigger`、`FloatButtonExpandTrigger` 一并删掉。

| 旧写法 | 新写法 |
| --- | --- |
| `expandTrigger="hover"`（WC attribute `expand-trigger="hover"`） | `expandOnHover`（Vue 模板与 WC attribute `expand-on-hover`） |
| `expandTrigger="click"` / 不写 | 不写 |
