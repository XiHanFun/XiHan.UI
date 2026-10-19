---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

表格（Table）新增 `tree`（Web Components 写 `tree` 属性）：声明这是一棵树，不必等某一行带上 `parentId`。开着时根节点总报 `treegrid`、每行写 `aria-level`，Alt + 左右键改层级始终归表格，任何一行都能接受「放进去」（仍经 `allowRowDrop` 把关），叶子行不写 `aria-expanded`。不开时照旧按行有没有 `parentId` 推断：一行都没有就是平表，根节点报 `grid`，Alt + 左右键放行给页面，只有可展开或已有子行的行接受「放进去」。
