---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

**破坏性** Drawer 贴哪条边从 `side` 改叫 `placement`，与 26 个组件的方位同一个名字；投影到 root 与 content 上的 `data-side` 随之改成 `data-placement`（`data-side` 在 DiffView、Transfer、Pagination 里各指别的东西）。取值不变：`'top' | 'right' | 'bottom' | 'left'`，缺省 `right`。

| 旧名 | 新名 |
| --- | --- |
| `side`（WC attribute `side`） | `placement`（WC attribute `placement`） |
| 根插槽与 Api 上的 `side` | `placement` |
| 类型 `DrawerSide`、常量 `DRAWER_DEFAULT_SIDE` | `DrawerPlacement`、`DRAWER_DEFAULT_PLACEMENT` |
| 自写样式里的 `[data-scope='drawer'][data-side='left']` | `[data-scope='drawer'][data-placement='left']` |
