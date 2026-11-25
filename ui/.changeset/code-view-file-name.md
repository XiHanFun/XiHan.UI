---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

**破坏性** CodeView 的文件名从 `filename` 改叫 `fileName`（多词驼峰，与 DownloadTrigger 一致），部件 `filename` 随之改成 `file-name`，连带部件组件、取值方法与覆盖槽。

| 旧名 | 新名 |
| --- | --- |
| `filename`（WC attribute `filename`） | `fileName`（Vue 模板与 WC attribute `file-name`） |
| 部件 `filename`（WC `data-xh-part="filename"`） | `file-name` |
| `XhCodeViewFilename`、`XhCodeViewFilenameProps` | `XhCodeViewFileName`、`XhCodeViewFileNameProps` |
| `api.filename`、`api.getFilenameProps()` | `api.fileName`、`api.getFileNameProps()` |
| `--xh-code-view-filename-fg` | `--xh-code-view-file-name-fg` |
