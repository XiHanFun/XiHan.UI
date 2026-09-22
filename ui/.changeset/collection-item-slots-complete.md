---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Command 补上快捷键提示，Tree / TreeSelect / Cascader / Transfer 补上行尾那一格——Collection Item 家族的六个槽至此每一格都有归属。

- **Command 的 `shortcut`**：命令面板本来就是快捷键的主场，`⌘K` 那一列此前没有承载它的部件。新增 `item-shortcut`，贴行尾、与说明同档同色、带 `aria-hidden`，不进检索串。
- **Tree / TreeSelect / Cascader / Transfer 的 `item-suffix`**：这四家的行首那一格归勾选框与展开箭头，行尾一直空着。现在留给作者放计数、徽标一类的任意节点，家族只管落位。

至此六个槽的归属：

| 槽 | 归属 |
| --- | --- |
| `prefix` | 菜单族 = `item-indicator`（前导图标）；候选列表 = `item-prefix`（作者内容）；树族 = 勾选框与展开箭头 |
| `text` | `item-text`，取自 `label`，也是连打检索的取字来源 |
| `description` | `item-description`，第 2 行、muted 档，全部集合组件可用 |
| `shortcut` | `item-shortcut`，菜单族与 Command |
| `suffix` | `item-suffix`，作者内容，全部集合组件可用 |
| `indicator` | 选中对号，由库按 `aria-selected` 显隐 |

导航族（Anchor / Breadcrumb / NavigationMenu / Tabs / SideNav）不在其列：那里的条目表达位置而不是一条可配置的数据行。
