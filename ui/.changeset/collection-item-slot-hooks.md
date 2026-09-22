---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

菜单族三家新增 `item-suffix` 部件与**按槽位的逐条钩子**：想给条目加个图标，不必再把整条重搭。

此前 `collection` 那条路只有一个整条替换的出口（Vue 的 `item` 插槽 / React 的 `renderItem`）。图标是可渲染内容、进不了 Headless，所以"给每条命令配个 SVG 图标"只能走那个出口——代价是文字、说明、快捷键全部得自己重新搭一遍，数据里写的 `description` / `shortcut` 一个都不生效。

现在首尾两格各有自己的钩子：

```vue
<XhMenuRoot :collection="actions" trigger-as-child>
  <template #trigger><XhButton variant="subtle">文件</XhButton></template>
  <template #item-prefix="node"><XhIcon :icon="iconOf(node)" size="sm" /></template>
</XhMenuRoot>
```

```tsx
<XhMenuRoot collection={actions} renderItemPrefix={node => <XhIcon icon={iconOf(node)} size="sm" />} />
```

- **`item-prefix` / `renderItemPrefix`** 只接管行首那一格（与数据里的 `indicator` 同一个部件，插槽在场时以它为准），文字、说明、快捷键照旧由数据铺。
- **`item-suffix` / `renderItemSuffix`** 只接管行尾那一格，落新增的 `item-suffix` 部件：家族的 suffix 列排在快捷键之后、选中对号之前，跨两行居中。它承载的是任意节点（计数、徽标、次级图标），所以家族只管落位，不规定字号与颜色。
- **`item` / `renderItem` 语义不变**，仍是整条的接管口。

Web Components 由作者自写 Light DOM，不需要钩子，只多一个可用的 `data-xh-part="item-suffix"` 角色。

文档的"破坏性命令"示例改用 `item-prefix` 重写：现在是三行数据加一个插槽，此前要把整条结构抄一遍。
