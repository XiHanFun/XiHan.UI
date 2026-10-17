---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

穿梭框改用标准结构：新增 `transferStructure`，次序是左侧面板、移到右侧、移回左侧（`oneWay` 时不铺）、右侧面板；每侧依次是头部（标题、计数、全选）、搜索框（`searchable` 时才有）、本侧当前可见的条目（勾选标记、文字与副文本）、空态与在途占位。Vue / React 不写默认插槽时照它铺，表单影子仍由根按值装配；Web Components 的 `<xh-transfer>` 不写部件或只写 `root` 时生成整套节点。`TransferTranslations` 新增 `sourceTitle`、`targetTitle`、`selectAll`、`empty`、`loading`（标准结构里面板标题、全选格、空态与在途的字，十种语言都已补上），`TransferApi` 新增 `translations`。
