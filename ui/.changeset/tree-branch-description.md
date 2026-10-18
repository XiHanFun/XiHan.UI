---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Tree 新增分支行的说明部件 `branch-description`：`TreeNode.description` 本来就不分叶子与分支，分支行现在也有正式的说明部件，排法与叶子的 `item-description` 相同，带说明的分支行折成两行，说明独占第 2 行，放不下截断；展开箭头排在行首时，说明让出箭头那一格，与分支名同一起点。headless 新增 `getBranchDescriptionProps`，Vue / React 新增 `XhTreeBranchDescription`，Web Components 在 `branch-control` 里写 `data-xh-part="branch-description"`。
