---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Listbox / Select / Combobox / Mention / Command 补上 `item-prefix` 与 `item-suffix` 两个部件和对应的逐条钩子。

这五家的行首那一格一直空着：它们的 `item-indicator` 是行尾的选中对号，不是前导图标槽（那是菜单族的用法）。所以想给选项配个国旗、给候选人配个头像、给命令配个图标，只能走整条替换的 `item` 插槽 / `renderItem`，代价是文字与副文本全要自己重搭。

```vue
<XhSelectRoot :collection="countries" label="国家">
  <template #item-prefix="node"><CountryFlag :code="node.value" /></template>
</XhSelectRoot>
```

```tsx
<XhMentionRoot collection={people} renderItemPrefix={node => <XhAvatar name={node.label} size="sm" />} />
```

- **`item-prefix`** 落家族的 prefix 列（行首），带 `aria-hidden`：它是装饰，可及名由条目文字承担。
- **`item-suffix`** 落 suffix 列（行尾、选中对号之前），承载计数、徽标一类的任意节点，家族只管落位。
- 两个钩子都只接管自己那一格，文字、副文本与选中对号照旧由数据与家族负责；`item` / `renderItem` 语义不变。

Tree / TreeSelect / Transfer 不在其列：它们的行首那一格已经归勾选框与展开箭头，再放作者内容会跟结构件抢位。
