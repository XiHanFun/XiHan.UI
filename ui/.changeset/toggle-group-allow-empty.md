---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** ToggleGroup 的「能不能点成无选中」从反义的 `disallowEmpty`（缺省 false）改成肯定写法 `allowEmpty`（缺省 true）：布尔 prop 用肯定命名，全库没有别的 `disallowX`。要保留至少一个选中项，写 `allowEmpty={false}`。

| 旧写法 | 新写法 |
| --- | --- |
| `disallowEmpty`（WC attribute `disallow-empty`） | `allowEmpty={false}`（Vue 模板 `:allow-empty="false"`，WC attribute `allow-empty="false"`） |
| 不写 | 不写（等同 `allowEmpty`，缺省可清空） |
