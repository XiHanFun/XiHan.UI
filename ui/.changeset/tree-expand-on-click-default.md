---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

Tree 的展开与选中分开：`expandOnClick` 缺省由 `true` 改为 `false`，与 TreeSelect 一致。

此前点分支行（或在分支上按确认键）会同时选中并切换展开态，想勾一枝却把它收了起来。现在点行与确认键只选中，展开归展开箭头（`branch-trigger`）与左右方向键；需要文件管理器那种「点目录即展开」的，显式打开 `expandOnClick`（Web Components 写 `expand-on-click`）。

**破坏性变更**：依赖点行展开的树需要补上 `expandOnClick`，或在分支行里摆一枚 `branch-trigger`——只摆了不可点的 `branch-indicator` 的树，缺省下只能靠方向键展开。
