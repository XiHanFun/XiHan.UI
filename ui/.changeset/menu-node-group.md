---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

`MenuNode` 新增 `group` 与 `groupLabel`，`collection` 那条路终于真的铺得出分组。

此前文档写着"`collection` 可直接生成条目、分组、标记位和分隔线"，`MenuNode` 却没有这两个字段，代铺的树也只认条目与分隔线。示例 `demos/menu/03-group` 照文档传了 `group` / `groupLabel`，浏览器里实测产出 0 个 `group`、0 个 `group-label` —— 一个不工作的示例照着一句不成立的文档写了出来。ContextMenu 与 Menubar 一直是对的，只有 Menu 漏了。

```ts
const actions = [
  { value: 'compact', label: '紧凑', group: 'density', groupLabel: '行高' },
  { value: 'comfortable', label: '宽松', group: 'density' },
  { value: 'sidebar', label: '侧栏', group: 'panels', groupLabel: '面板', separatorBefore: true },
]
```

规则与 ContextMenu 逐条对齐：

- **相邻同值收进同一个 `group`**，不相邻的同值各成一段（与数据顺序一致，不重排）。
- **标题取本组首个写了 `groupLabel` 的那条**，本组无人提供时不铺 `group-label`；`group` 靠 `aria-labelledby` 认领它。
- **领头一个分组的条目，它的 `separatorBefore` 画在 `group` 外面**；组内条目的分隔线留在组里。首条上的标记仍然不产出分隔线。
- 没写 `group` 的条目直接落在 `content` 上，与分组段互不影响。

手写部件那条路本来就支持分组，产出的 DOM 与代铺的一致，这次没有变化；Web Components 由作者自写 Light DOM，同样不受影响。
