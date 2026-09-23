---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Tree 的选中改成与 TreeSelect 同一种读法：行不换面，单选、多选与级联都只在行尾画对号，勾选框部件删除。

此前页内树有两套标记：单选铺品牌淡底 + 行首对号，勾选档再摆一枚行首方框——方框已经表明了勾选态，淡底又把同一件事说了一遍；而下拉里的树（TreeSelect）一直是透明底 + 行尾对号。现在两者统一：

- 行投影 Collection Item 的 `overlay` 语境：选中不换面、不换字色，悬停 / 高亮 / 按下沿用未选行的 100 → 200 阶梯。
- 对号（`item-indicator`）一律排到行尾，作者写在行首也会被排到最后；行尾那一格（`item-suffix`）在它之前。
- 分支行也放 `item-indicator`：勾选态与级联半选态落在标记自身的 `data-selected` / `data-indeterminate` 上，半选画横杠。
- forced-colors 下选中行保持 Canvas，只由对号表达；打印时对号按原样印出。

**破坏性变更**

- 删除部件 `item-checkbox` / `branch-checkbox`，以及三端对应的 `XhTreeItemCheckbox` / `XhTreeBranchCheckbox`（React 另有 `XhTreeItemCheckboxProps` / `XhTreeBranchCheckboxProps`）和 connect 上的 `getItemCheckboxProps` / `getBranchCheckboxProps`。
- 删除组件槽 `--xh-tree-checkbox-*`（8 个）与 `--xh-tree-row-bg-selected`。
- 行的 `data-xh-collection-context` 由 `page` 改为 `overlay`。

迁移：把勾选框换成对号，分支行同样摆一枚。

```vue
<XhTreeBranchControl>
  <XhTreeBranchTrigger />
  <XhTreeBranchText>华东</XhTreeBranchText>
  <XhTreeItemIndicator />
</XhTreeBranchControl>
<XhTreeItem value="sh">
  <XhTreeItemText>上海</XhTreeItemText>
  <XhTreeItemIndicator />
</XhTreeItem>
```

Web Components 把 `data-xh-part="item-checkbox"` / `"branch-checkbox"` 换成 `data-xh-part="item-indicator"`。
