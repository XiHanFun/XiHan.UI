---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

另外九个集合组件补上 `item-description` 部件与节点上的 `description`：条目的第 2 行终于到处都能写了。

家族的网格里一直留着说明这一行（跨 text 槽的第 2 行、muted 档），但只有 ContextMenu 与 Menubar 拿得到它。一句话说不清的选项——订阅方案、权限档、机型——只能把解释挤进 `label`，或者放弃 `collection` 退回手写部件。

覆盖 Listbox / Select / Combobox / Mention / Command / Cascader / Tree / TreeSelect / Transfer：

```ts
const plans = [
  { value: 'team', label: '团队版', description: '最多 20 人，共享工作区与审计日志' },
  { value: 'enterprise', label: '企业版', description: '单点登录、私有部署与专属支持' },
]
```

- 新部件 `item-description`（`getItemDescriptionProps` / `Xh*ItemDescription` / `data-xh-part="item-description"`）跨 text 槽落第 2 行，与快捷键同档同色，**不跟语气**。
- 代铺的树按数据铺：写了 `description` 的条目才多一个部件，没写的与此前完全一致。
- 不进检索串：连打检索与命令面板的过滤都只取 `item-text` 那一段。

SideNav 不在其列：它的入口在折叠成图标栏时只剩一格，第 2 行无处安放。
