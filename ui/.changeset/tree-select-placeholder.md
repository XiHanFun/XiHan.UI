---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

TreeSelect 的占位态按设计真源的占位态一节补齐：
- 整树首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方），此前只是一行静态文字；已有节点时后台刷新保留上一帧，`tree` 按 `micro` 淡到 `--xh-state-disabled-opacity`。
- 分支首次展开取子项的 `branch-loading`、`branch-empty`、`branch-error`、`branch-retry-trigger` 此前没有皮肤，补齐：三种占位落在子层的位置、与子层同一缩进，文字取材质的次要文字、字号随档；在途一枚加载环（`branch-loading` 同样投影 `data-xh-loading-ring` 与 `data-loading`），失败一枚取 `--xh-fg-danger` 的警示字形，重试钮排在说明之下、取品牌色，悬停出下划线。新增 `--xh-tree-select-branch-status-py`、`-branch-status-fg`、`-branch-status-font-size`、`-branch-error-fg`、`-branch-retry-fg` 覆盖槽。
