---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Kbd 暂停监听的开关从正向的 `enabled`（缺省 true）改成 `disabled`（缺省 false）：全库其余 76 个组件都用 `disabled`，只有它反着写。`api.enabled` 仍报「监听此刻是否生效」（开了 `register` 且没写 `disabled`）。

| 旧写法 | 新写法 |
| --- | --- |
| `enabled={false}`（WC attribute `enabled="false"`） | `disabled`（WC attribute `disabled`） |
| 不写 / `enabled` | 不写 |
