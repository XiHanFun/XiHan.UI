---
'@xihan-ui/headless': minor
'@xihan-ui/styles': major
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Command、Cascader、Transfer 面板里内嵌的搜索框统一成一种写法：通栏一行，块尺寸取所在尺寸档的 `--xh-control-h-*`、字号取 `--xh-control-font-*`（Command 此前固定正文字号、Transfer 固定 sm 高度、Cascader 由内衬撑高）；只画一道面内分隔的下划线，取所在面材质的分隔令牌（Cascader、Transfer 取 `--xh-material-solid-separator`，Command 与它的底栏上沿取 sheet 面的 `--xh-material-elevated-separator`），Transfer 不再用字段边 `--xh-border-control`。三处搜索框的连接层投影 `data-xh-field-input`，重置与占位前景走字段家族：Cascader、Transfer 的占位文字此前是浏览器默认色，现在与其它字段同取 `--xh-fg-subtle`，新增 `--xh-transfer-placeholder-fg`，Cascader 与值文本的占位共用 `--xh-cascader-placeholder-fg`。破坏性：移除 `--xh-cascader-input-py`，改由新增的 `--xh-cascader-input-h` 定高。
