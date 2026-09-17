---
"@xihan-ui/styles": minor
---

**Collection Item 配方的选中主体兼认 `data-selected`，交互守卫兼认 `data-disabled`。** 此前 selected 只读 `[aria-selected='true']`、守卫只排除 `[aria-disabled='true']`；Tree / TreeSelect 的分支行（`branch-control`）不是 treeitem 本体，两项 ARIA 事实都在外层 `branch` 上，行上只有连接层同步下来的 `data-selected` / `data-disabled`——选中面永远命不中，禁用分支悬停仍换底。

现在 selected 主体是 `:is([aria-selected='true'], [data-selected])`，守卫多排除一条 `[data-disabled]`；`:is` 取最高特指度，规则层级维持 (0,1,0) 起算，页内 / 浮层两种上下文的选中面与叠加态选择器源序不变。
